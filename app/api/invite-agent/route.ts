import { NextRequest, NextResponse } from 'next/server';
import {
  AgoraClient,
  Agent,
  Area,
  DeepgramSTT,
  ExpiresIn,
  MiniMaxTTS,
  OpenAI,
} from 'agora-agents';
import { ClientStartRequest, AgentResponse } from '@/types/conversation';
import { DEFAULT_AGENT_UID } from '@/lib/agora';

// System prompt that defines Delphy's personality and behavior.
// The one hard rule, everything Delphy says is a question, lives here.
const DELPHY_PROMPT = `You are **Delphy**. You pressure-test whatever position someone brings you, and you enjoy finding the joint where it gives.

# The One Rule
Every single thing you say is a question. Never a statement. Never an answer. Never an opinion. Never a fact. If you want to say something, ask it instead.

# Substance First, Always
This matters more than your attitude: every question must engage with something specific the user actually said. A word they chose, a claim they made, a step they skipped, a number they quoted.

- Name the exact thing you are pressing on. Quote their words back at them.
- NEVER ask a question that would make sense on a different topic. "That's it?", "Is that your best?", "So you don't know?" are banned. They carry no content and make you a heckler instead of an opponent.
- Press on one of: the mechanism, the definition of a vague word, the evidence, whether it holds at a different scale, or a counterexample they have to deal with.
- You must show you actually followed the argument. If your question does not prove you listened, it is a bad question.

# Your Attitude
Dry, skeptical, and hard to impress. You are the friend who argues properly and will not let a lazy step slide. The bite comes from finding the weak joint precisely, not from noise.

- Never compliment. No "good point", "interesting", or "fair enough".
- When they dodge, name the specific thing they dodged.
- One or two sentences, under 30 words. Spoken, not written.
- Sharp, not sneering. If you are being rude instead of being right, you have failed.

Attack the ARGUMENT, never the person. You question reasoning, never looks, family, identity, religion, or caste. If someone is genuinely upset rather than playing, drop the edge entirely and ask a straight question.

# Language
Always speak English, whatever language the user uses. Keep it casual and spoken, never formal.

Good questions sound like: "You said nuclear is fastest, but fastest from approval or from first power? Which one are you claiming?", "Productivity by what measure, output per hour or per person?", "That works for a city. What happens to it in a village of two thousand?".

# Every Turn
Find the weakest link in their most recent answer and press on that specific link. One question per turn. No preamble, no lists.

# When They Try To Break You
- Ask your opinion or "just tell me": ask why they need your answer to defend their own.
- Tell you to drop the act: ask what exactly changes if you do.
- Go off-topic: ask how that rescues the claim they were losing.
- Insult you: ask whether that counts as their argument now.

Under no circumstances do you break character or answer directly. You only ask.`;

// First thing Delphy says when a user joins the channel.
const GREETING = `I'm Delphy. So, what do you think you can defend today?`;

// agentUid identifies the AI in the RTC channel and shares its default with the client.
const agentUid = String(DEFAULT_AGENT_UID);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    // --- 1. Parse request ---

    const body: ClientStartRequest = await request.json();
    const { requester_id, channel_name } = body;

    // Validate required env vars on first request so misconfiguration surfaces
    // with a clear error message rather than a silent failure.
    const appId = requireEnv('NEXT_PUBLIC_AGORA_APP_ID');
    const appCertificate = requireEnv('NEXT_AGORA_APP_CERTIFICATE');

    if (!channel_name || !requester_id) {
      return NextResponse.json(
        { error: 'channel_name and requester_id are required' },
        { status: 400 },
      );
    }

    // --- 2. Build and start the agent ---

    // AgoraClient authenticates API calls to the Agora Conversational AI service.
    // area: change to Area.EU or Area.AP for European or Asia-Pacific deployments.
    const client = new AgoraClient({
      area: Area.US,
      appId,
      appCertificate,
    });

    // Pipeline: Deepgram (reseller) STT → OpenAI (reseller) LLM → MiniMax (reseller) TTS.
    // Omit vendor API keys for supported models, AgentKit infers reseller presets on start (see Agora Console / billing).
    const agent = new Agent({
      client,
      instructions: DELPHY_PROMPT,
      greeting: GREETING,
      failureMessage: 'Please wait a moment.',
      maxHistory: 50,
      // VAD controls how the agent detects the start and end of a user's turn.
      turnDetection: {
        config: {
          speech_threshold: 0.5,
          start_of_speech: {
            mode: 'vad',
            vad_config: {
              // 160ms let a cough or an "umm" cut Delphy off mid-question.
              interrupt_duration_ms: 320,
              prefix_padding_ms: 300, // audio captured before speech is detected
            },
          },
          // Semantic beats a fixed silence timer here. Pure VAD forces a bad
          // trade: 480ms cut people off mid-argument so the model only saw an
          // opening clause, while 800-1200ms fixed that but felt sluggish.
          // Semantic mode judges whether the thought actually finished, so it
          // can answer quickly after a complete sentence and still wait
          // through a mid-sentence pause.
          end_of_speech: {
            mode: 'semantic',
            semantic_config: {
              // Base silence before the semantic check runs. Kept short
              // because semantics, not the clock, decide the turn is over.
              silence_duration_ms: 400,
              // Never hang: fall back to the current state after this.
              max_wait_ms: 2000,
              // Recognises "hold on" and similar as intent to keep the floor.
              pause_state_enabled: true,
            },
          },
        },
      },
      // RTM is required for transcript events in the browser client.
      // enable_tools is required for MCP tool invocation.
      advancedFeatures: { enable_rtm: true, enable_tools: true },
      // Required for browser RTM events:
      // - data_channel: 'rtm' enables RTM delivery path for state/metrics/errors
      // - enable_error_message emits AGENT_ERROR payloads
      // - enable_metrics emits AGENT_METRICS latency payloads
      parameters: {
        // web client → ultra-low-latency chorus profile
        audio_scenario: 'chorus',
        data_channel: 'rtm',
        enable_error_message: true,
        enable_metrics: true,
      },
    })
      .withStt(
        new DeepgramSTT({
          model: 'nova-3',
          language: 'en',
        }),
        // BYOK: uncomment the following block and set NEXT_DEEPGRAM_API_KEY
        // new DeepgramSTT({
        //   apiKey: requireEnv('NEXT_DEEPGRAM_API_KEY'),
        //   model: 'nova-3',
        //   language: 'en',
        // }),
      )
      .withLlm(
        new OpenAI({
          model: 'gpt-4o-mini',
          greetingMessage: GREETING,
          failureMessage: 'Please wait a moment.',
          // Longer memory so Delphy holds the thread of an argument instead
          // of reacting only to the last thing it heard. Costs no latency.
          maxHistory: 30,
          params: {
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
        // Measured alternative, NOT recommended for live use. Gemini 3.x runs a
        // reasoning pass before every reply: gemini-3.6-flash took ~16s and
        // gemini-flash-latest ~4.2s per turn, both spending 280-375 reasoning
        // tokens on a 25-token question, and the free tier returned 503 under
        // load. Fine for a batch judge call, far too slow to speak with.
        // new OpenAI({
        //   apiKey: requireEnv('NEXT_LLM_API_KEY'),
        //   url: requireEnv('NEXT_LLM_URL'),
        //   model: 'gemini-flash-latest',
        //   greetingMessage: GREETING,
        //   failureMessage: 'Please wait a moment.',
        //   maxHistory: 30,
        //   maxTokens: 2048,
        //   temperature: 0.7,
        //   topP: 0.95,
        // }),
      )
      .withTts(
        new MiniMaxTTS({
          model: 'speech_2_6_turbo',
          voiceId: 'English_captivating_female1',
        }),
        // BYOK, ElevenLabs (set NEXT_ELEVENLABS_API_KEY; optional NEXT_ELEVENLABS_VOICE_ID)
        // new (await import('agora-agents')).ElevenLabsTTS({
        //   key: requireEnv('NEXT_ELEVENLABS_API_KEY'),
        //   modelId: 'eleven_flash_v2_5',
        //   voiceId: process.env.NEXT_ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB',
        //   sampleRate: 24000,
        // }),
      );

    // remoteUids restricts the agent to only process audio from this user
    const session = agent.createSession({
      channel: channel_name,
      agentUid,
      remoteUids: [requester_id],
      idleTimeout: 30,
      expiresIn: ExpiresIn.hours(1),
      debug: false, // enable debug to show restful API calls in the console
    });

    const agentId = await session.start();

    return NextResponse.json({
      agent_id: agentId,
      create_ts: Math.floor(Date.now() / 1000),
      state: 'RUNNING',
    } as AgentResponse);
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start conversation',
      },
      { status: 500 },
    );
  }
}

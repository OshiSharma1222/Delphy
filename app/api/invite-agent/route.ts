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
import { resolveMode } from '@/lib/delphy/modes';
import { getPersona } from '@/lib/delphy/personas';

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

    // Which Delphy the caller asked for. An unknown or absent mode resolves to
    // the default rather than failing, so a stale client still gets a session.
    const mode = resolveMode(body.mode);
    const persona = getPersona(mode);

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
      instructions: persona.instructions,
      greeting: persona.greeting,
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
              // Critical mode raises this again, see personas.ts.
              interrupt_duration_ms: persona.turnDetection.interruptDurationMs,
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
              // Critical mode runs longer: working out a reason out loud
              // produces pauses that ragebait's timings would talk over.
              silence_duration_ms: persona.turnDetection.silenceDurationMs,
              // Never hang: fall back to the current state after this.
              max_wait_ms: persona.turnDetection.maxWaitMs,
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
          greetingMessage: persona.greeting,
          failureMessage: 'Please wait a moment.',
          // Longer memory so Delphy holds the thread of an argument instead
          // of reacting only to the last thing it heard. Costs no latency.
          maxHistory: 30,
          params: {
            max_tokens: 1024,
            temperature: persona.temperature,
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
      // Echoed back so the client labels the call with the persona that
      // actually started, not the one it hoped for.
      mode,
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

# Delphy

A voice-native devil's advocate. Bring a position you actually hold, say it out
loud, and Delphy answers only in questions — going straight for the weakest
thing you just said. It never states, never agrees, never takes a side.

Built on [Agora's Conversational AI Engine](https://docs.agora.io): a real-time
ASR → LLM → TTS pipeline running over Agora's SD-RTN, with transcripts and agent
state delivered to the browser over RTM.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3, CSS custom-property design tokens |
| Realtime audio | `agora-rtc-sdk-ng` via `agora-rtc-react` |
| Signaling | `agora-rtm` (transcripts, agent state, metrics, errors) |
| Agent orchestration | `agora-agents` (server), `agora-agent-client-toolkit` (browser) |
| Call UI primitives | `agora-agent-uikit` |
| Speech-to-text | Deepgram `nova-3` |
| LLM | OpenAI `gpt-4o-mini` |
| Text-to-speech | MiniMax `speech_2_6_turbo` |

STT/LLM/TTS run through Agora's reseller presets, so no vendor API keys are
needed for the default pipeline. Each has a commented BYOK block in
`app/api/invite-agent/route.ts` if you would rather bring your own.

---

## System architecture

```mermaid
flowchart TB
    subgraph browser["Browser"]
        HP["HomePage<br/>pre-call, scrolls"]
        LP["LandingPage<br/>session bootstrap"]
        CC["ConversationComponent<br/>in-call, viewport-pinned"]
        RTC["AgoraRTC client<br/>mic capture + publish"]
        RTM["RTM client<br/>transcripts + events"]
    end

    subgraph next["Next.js API routes"]
        TOK["/api/generate-agora-token"]
        INV["/api/invite-agent"]
        STOP["/api/stop-conversation"]
        LLMEP["/api/chat/completions<br/>custom-LLM endpoint"]
    end

    subgraph agora["Agora"]
        SDRTN["SD-RTN<br/>real-time audio"]
        CONVO["Conversational AI Engine"]
    end

    subgraph vendors["Pipeline vendors"]
        STT["Deepgram nova-3"]
        LLM["OpenAI gpt-4o-mini"]
        TTS["MiniMax speech_2_6_turbo"]
    end

    HP -->|"Take the stand"| LP
    LP --> TOK
    LP --> INV
    LP --> STOP
    LP --> CC
    CC --> RTC
    CC --> RTM

    TOK -->|"RTC+RTM token"| LP
    INV -->|"start agent"| CONVO
    STOP -->|"stop agent"| CONVO

    RTC <-->|"user audio / agent audio"| SDRTN
    RTM <-->|"transcripts, state, metrics, errors"| CONVO
    CONVO <--> SDRTN

    CONVO --> STT
    STT --> LLM
    LLM --> TTS
    TTS --> CONVO

    LLMEP -.->|"not currently wired"| CONVO
```

---

## Session lifecycle

The startup handshake is where most integration bugs live. Two things worth
noting: the agent invite and the RTM setup run **in parallel** — both only need
the token response — and the agent joins the channel asynchronously, so
`start()` returning does not mean the agent is already in the room.

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant LP as LandingPage
    participant API as Next.js API
    participant AG as Agora ConvoAI
    participant CC as ConversationComponent

    U->>LP: Click "Take the stand"
    LP->>API: GET /api/generate-agora-token
    API-->>LP: token, uid, channel

    par Agent invite
        LP->>API: POST /api/invite-agent
        API->>AG: agent.createSession().start()
        AG-->>API: agent_id
        API-->>LP: agent_id, state RUNNING
    and RTM setup
        LP->>AG: rtm.login(token)
        LP->>AG: rtm.subscribe(channel)
    end

    LP->>CC: mount with agoraData + rtmClient
    CC->>AG: useJoin(appid, channel, token, uid)
    CC->>CC: useLocalMicrophoneTrack()
    CC->>AG: usePublish(localMicrophoneTrack)
    CC->>AG: AgoraVoiceAI.init() + subscribeMessage()

    AG-->>CC: user-joined (agentUid 123456)
    AG-->>CC: greeting audio + TRANSCRIPT_UPDATED

    loop Each turn
        U->>AG: speech over SD-RTN
        AG->>AG: Deepgram then OpenAI then MiniMax
        AG-->>CC: agent audio, transcript, AGENT_STATE_CHANGED
    end

    U->>LP: End conversation
    LP->>API: POST /api/stop-conversation
    API->>AG: client.stopAgent(agent_id)
    LP->>AG: rtm.logout()
```

**StrictMode note.** `ConversationComponent` gates both `useJoin` and
`useLocalMicrophoneTrack` behind an `isReady` flag set via `setTimeout(fn, 0)`.
React StrictMode fires cleanup synchronously before any timeout callback, so the
first (discarded) mount's timer is always cancelled and only the real mount
joins. Without this the app joins twice and creates two mic tracks, producing a
roughly 3-second audio gap.

---

## Types

```mermaid
classDiagram
    direction LR

    class AgoraTokenData {
        +string token
        +string uid
        +string channel
        +string agentId
    }

    class ClientStartRequest {
        +string requester_id
        +string channel_name
    }

    class AgentResponse {
        +string agent_id
        +number create_ts
        +string state
    }

    class StopConversationRequest {
        +string agent_id
    }

    class AgoraRenewalTokens {
        +string rtcToken
        +string rtmToken
    }

    class ConversationComponentProps {
        +AgoraTokenData agoraData
        +RTMClient rtmClient
        +onTokenWillExpire(uid) Promise
        +onEndConversation() void
    }

    class ConnectionIssue {
        +string id
        +string source
        +string agentUserId
        +code string_or_number
        +string message
        +number timestamp
    }

    ConversationComponentProps --> AgoraTokenData
    ConversationComponentProps ..> AgoraRenewalTokens : returns
    ClientStartRequest ..> AgentResponse : invite-agent
    StopConversationRequest ..> AgentResponse : stop-conversation
    AgoraTokenData ..> ClientStartRequest : uid, channel
```

`ConnectionIssue.source` is one of `rtm`, `agent`, or `rtm-signaling`, recording
which layer reported the problem. The in-call status panel de-duplicates issues
sharing an agent, code, and message within 1.5 seconds.

---

## Visualizer state

`mapAgentVisualizerState` in `lib/conversation.ts` folds three independent
signals — RTC connection state, agent presence, and agent state — into one
display state. Transport problems deliberately outrank agent state, so the
visualizer never claims to be "listening" in the middle of a reconnect.

```mermaid
stateDiagram-v2
    [*] --> joining

    joining --> not_joined : RTC connected, agent absent
    not_joined --> ambient : agent joins

    state agent_present {
        ambient --> listening : listening
        listening --> analyzing : thinking
        analyzing --> talking : speaking
        talking --> listening : listening
        ambient --> ambient : idle or silent
    }

    agent_present --> joining : CONNECTING or RECONNECTING
    agent_present --> disconnected : DISCONNECTED
    not_joined --> disconnected : DISCONNECTED
    joining --> disconnected : DISCONNECTED
    disconnected --> [*]
```

---

## Not yet wired

`lib/delphy/` holds the round-progression design — pure functions with **no
importers outside that folder**. The live agent currently runs from the single
`DELPHY_PROMPT` system prompt in `app/api/invite-agent/route.ts`, and the
`01 / 02 / 03` rail on the homepage is static.

The same applies to `app/api/chat/completions/` — a working OpenAI-compatible
custom-LLM endpoint that the agent config does not point at, because `withLlm`
uses Agora's reseller preset instead.

The diagrams below describe that design, not what runs today.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> Round1

    Round1 --> Round1 : held, holds under 2
    Round1 --> Round2 : held, holds reaches 2
    Round2 --> Round3 : held, holds reaches 2
    Round3 --> Complete : held, holds reaches 2

    Round1 --> Round1 : hedged or conceded
    Round2 --> Round2 : hedged or conceded
    Round3 --> Round3 : hedged or conceded

    Complete --> [*] : closing verdict
```

At two strikes the round does not advance. `applyVerdict` instead returns
`escalated: true` plus a `pressure` steer — `vague` for a hedge, `escalate`
after two strikes — intended for the next question-generation call.

`guardRail.ts` enforces the one hard rule, that every Delphy line is a question.
It rejects text that does not end in a question mark, that opens with an
assertion, or that contains any declarative sentence of three or more words. The
intended flow is one stricter retry, then a canned in-character fallback.

---

## Project layout

```
app/
  layout.tsx                    root layout and metadata
  globals.css                   design tokens and Delphy light palette
  api/
    generate-agora-token/       RTC+RTM token minting
    invite-agent/               agent config and session start
    stop-conversation/          idempotent agent teardown
    chat/completions/           custom-LLM endpoint (not wired)
components/
  LandingPage.tsx               session bootstrap, view switch
  HomePage.tsx                  pre-call homepage composition
  home/                         nav, hero, how-it-works, sample, rounds, footer
  ConversationComponent.tsx     in-call join, publish, transcripts, teardown
  ConnectionStatusPanel.tsx     connection state and captured issues
  MicrophoneSelector.tsx        input-device switching
lib/
  agora.ts                      DEFAULT_AGENT_UID
  conversation.ts               transcript normalisation, state mapping
  delphy/                       round logic and guardrail (not wired)
types/
  conversation.ts               shared API and prop types
```

---

## Running locally

Requires Node 22 or newer (`.nvmrc` pins 24) and pnpm.

```bash
pnpm install
pnpm dev
```

Create `.env` with your Agora credentials:

```
NEXT_PUBLIC_AGORA_APP_ID=your-app-id
NEXT_AGORA_APP_CERTIFICATE=your-app-certificate
```

Both come from the [Agora Console](https://console.agora.io). The certificate is
server-only — only `NEXT_PUBLIC_AGORA_APP_ID` reaches the browser.

### Checks

```bash
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm build        # next build
pnpm verify       # doctor, lint, typecheck, api contracts, build
```

If those abort before running with `ERR_PNPM_IGNORED_BUILDS`, run
`pnpm approve-builds` once to let `esbuild`, `sharp`, and `unrs-resolver` run
their install scripts.

---

## Deploying

`vercel.json` and a multi-stage `Dockerfile` are both included. Set the same two
environment variables on whichever platform you use. The app needs no database —
`lib/delphy/sessionStore.ts` is an in-process `Map`, so it does not survive a
restart or scale past a single instance.

import type { RTMClient } from 'agora-rtm';
import type { DelphyModeId } from '@/lib/delphy/modes';

export interface AgoraTokenData {
  token: string;
  uid: string;
  channel: string;
  agentId?: string;
}

export interface ClientStartRequest {
  requester_id: string;
  channel_name: string;
  /** Which persona to start. Omitted or unknown falls back to DEFAULT_MODE. */
  mode?: DelphyModeId;
}

export interface StopConversationRequest {
  agent_id: string;
}

export interface AgentResponse {
  agent_id: string;
  create_ts: number;
  state: string;
  /** The mode the server actually resolved, which may differ from the request. */
  mode?: DelphyModeId;
}

export interface AgoraRenewalTokens {
  rtcToken: string;
  rtmToken: string;
}

export interface ConversationComponentProps {
  agoraData: AgoraTokenData;
  mode: DelphyModeId;
  rtmClient: RTMClient;
  onTokenWillExpire: (uid: string) => Promise<AgoraRenewalTokens>;
  onEndConversation: () => void;
}

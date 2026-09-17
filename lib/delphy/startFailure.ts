/**
 * A failed start is one of three different problems and they need three
 * different sentences. "Please try again" is only honest for the third.
 *
 *   missing credentials   the deployment was never configured, retrying is futile
 *   rejected credentials  the values exist but Agora refuses them
 *   anything else         transient, worth another go
 *
 * Lives here rather than in the component so it can be tested without a DOM.
 */
export function describeStartFailure(detail: string): string {
  if (/credentials are not set/i.test(detail)) {
    return 'This deployment has no Agora credentials. Copy env.local.example to .env, fill in NEXT_PUBLIC_AGORA_APP_ID and NEXT_AGORA_APP_CERTIFICATE from the Agora Console, then restart the server.';
  }
  if (/invalid token|\b401\b|unauthor/i.test(detail)) {
    return 'Agora rejected these credentials. Check that the App ID and App Certificate in .env both belong to the same Agora project.';
  }
  return 'Failed to start conversation. Please try again.';
}

/** Pulls the server's own explanation out of a failed API response. */
export async function readApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.error === 'string') return body.error;
    return JSON.stringify(body);
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

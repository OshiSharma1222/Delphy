'use client';

import { useState, useEffect, useCallback } from 'react';
import { IRemoteAudioTrack } from 'agora-rtc-react';
import { Headphones, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SpeakerSelectorProps {
  /** Remote audio tracks to route. In practice this is the agent's voice. */
  audioTracks: IRemoteAudioTrack[];
}

interface PlaybackDevice {
  deviceId: string;
  label: string;
}

/**
 * Chooses where the agent's voice plays.
 *
 * Without this the browser sends remote audio to whatever the OS calls the
 * default output, which is a common way to hear nothing at all: pairing a
 * Bluetooth headset makes Windows switch it to the Hands-Free profile when the
 * microphone opens, and playback can land on a different device entirely.
 *
 * Note the client-level AgoraRTC.setPlaybackDevice() is a no-op as of SDK
 * v4.7.0, routing has to be set per remote track.
 */
export function SpeakerSelector({ audioTracks }: SpeakerSelectorProps) {
  const [devices, setDevices] = useState<PlaybackDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const fetchSpeakers = useCallback(async () => {
    try {
      const AgoraRTC = (await import('agora-rtc-react')).default;
      const speakers = await AgoraRTC.getPlaybackDevices();

      // "default" and "communications" are Windows aliases, not real outputs,
      // and are the usual suspects when audio vanishes on a headset.
      setDevices(
        speakers
          .filter(
            (device) =>
              device.deviceId !== 'default' &&
              device.deviceId !== 'communications',
          )
          .map((device) => ({
            deviceId: device.deviceId,
            label: device.label || `Output ${device.deviceId.slice(0, 5)}...`,
          })),
      );
    } catch (error) {
      console.error('Error fetching speakers:', error);
    }
  }, []);

  useEffect(() => {
    fetchSpeakers();
  }, [fetchSpeakers]);

  // Re-apply the chosen output whenever the agent republishes its audio,
  // otherwise a reconnect silently reverts to the system default.
  useEffect(() => {
    if (!currentDeviceId || audioTracks.length === 0) return;
    audioTracks.forEach((track) => {
      track.setPlaybackDevice(currentDeviceId).catch((error) => {
        console.error('Error routing agent audio:', error);
      });
    });
  }, [audioTracks, currentDeviceId]);

  const handleDeviceChange = async (deviceId: string) => {
    setRouteError(null);
    try {
      await Promise.all(
        audioTracks.map((track) => track.setPlaybackDevice(deviceId)),
      );
      setCurrentDeviceId(deviceId);
    } catch (error) {
      console.error('Error routing agent audio:', error);
      setRouteError('That output could not be opened. Try another device.');
    }
  };

  if (devices.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10 bg-secondary hover:bg-accent/10 border border-border"
          title="Select where Delphy plays"
        >
          <Headphones className="h-4 w-4 text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-56 bg-popover border-border"
      >
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Play Delphy through
        </div>
        {devices.map((device) => (
          <DropdownMenuItem
            key={device.deviceId}
            onClick={() => handleDeviceChange(device.deviceId)}
            className={`cursor-pointer ${
              device.deviceId === currentDeviceId
                ? 'bg-accent/15 text-primary'
                : 'text-foreground hover:bg-accent/10'
            }`}
          >
            <span className="truncate">{device.label}</span>
            {device.deviceId === currentDeviceId && (
              <Check className="ml-auto h-3.5 w-3.5 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {routeError && (
          <p
            role="alert"
            className="px-2 pb-1.5 pt-2 text-[11px] leading-4 text-destructive"
          >
            {routeError}
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';

interface JitsiMeetProps {
  roomName: string;
  displayName?: string;
  email?: string;
  token?: string;
  className?: string;
  onReadyToClose?: () => void;
}

const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'localhost:8080';

export function JitsiMeet({
  roomName,
  displayName,
  email,
  token,
  className,
  onReadyToClose,
}: JitsiMeetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<unknown>(null);

  useEffect(() => {
    const loadJitsi = () => {
      if (typeof window === 'undefined') return;

      // Check if Jitsi API is available (from external script)
      if ((window as unknown as Record<string, unknown>)['JitsiMeetExternalAPI']) {
        initJitsi();
      } else {
        // Load Jitsi script dynamically
        const script = document.createElement('script');
        script.src = `http://${JITSI_DOMAIN}/external_api.js`;
        script.async = true;
        script.onload = initJitsi;
        script.onerror = () => {
          console.warn('Failed to load Jitsi Meet API, falling back to iframe');
        };
        document.head.appendChild(script);
      }
    };

    const initJitsi = () => {
      if (!containerRef.current) return;
      const JitsiAPI = (window as unknown as Record<string, unknown>)['JitsiMeetExternalAPI'] as new (
        domain: string,
        options: Record<string, unknown>
      ) => {
        dispose: () => void;
        addListener: (event: string, handler: () => void) => void;
      };

      if (!JitsiAPI) return;

      const api = new JitsiAPI(JITSI_DOMAIN, {
        roomName: roomName,
        parentNode: containerRef.current,
        userInfo: {
          displayName: displayName || 'Pet Owner',
          email: email || '',
        },
        jwt: token,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'chat',
            'settings',
            'raisehand',
            'videoquality',
            'tileview',
          ],
          SHOW_JITSI_WATERMARK: false,
        },
      });

      if (onReadyToClose) {
        api.addListener('readyToClose', onReadyToClose);
      }

      apiRef.current = api;
    };

    loadJitsi();

    return () => {
      if (apiRef.current && typeof (apiRef.current as { dispose?: () => void }).dispose === 'function') {
        (apiRef.current as { dispose: () => void }).dispose();
      }
    };
  }, [roomName, displayName, email, token, onReadyToClose]);

  // Build iframe URL with token if provided
  const iframeUrl = token
    ? `http://${JITSI_DOMAIN}/${roomName}?jwt=${token}`
    : `http://${JITSI_DOMAIN}/${roomName}`;

  return (
    <div className={clsx('relative rounded-xl overflow-hidden bg-gray-900', className)}>
      {/* Fallback iframe in case Jitsi API doesn't load */}
      <div ref={containerRef} className="w-full h-full">
        <iframe
          src={iframeUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="w-full h-full border-0"
          title="Pawpet Video Consultation"
        />
      </div>
    </div>
  );
}

export default JitsiMeet;

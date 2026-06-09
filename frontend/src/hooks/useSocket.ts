'use client';

import { useEffect, useRef, useCallback } from 'react';
import { connectSocket, disconnectSocket, UrgentSocketEvent } from '@/lib/socket';

type AppSocket = ReturnType<typeof connectSocket>;

interface UseSocketOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { onConnect, onDisconnect, autoConnect = true } = options;
  const socketRef = useRef<AppSocket | null>(null);

  useEffect(() => {
    if (autoConnect) {
      const socket = connectSocket();
      socketRef.current = socket;

      if (onConnect) {
        socket.on('connect', onConnect);
      }

      if (onDisconnect) {
        socket.on('disconnect', onDisconnect);
      }

      return () => {
        if (onConnect) socket.off('connect', onConnect);
        if (onDisconnect) socket.off('disconnect', onDisconnect);
      };
    }
  }, [autoConnect, onConnect, onDisconnect]);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    const socket = socketRef.current;
    if (socket) {
      socket.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    const socket = socketRef.current;
    if (socket) {
      socket.off(event, handler);
    }
  }, []);

  const emit = useCallback((event: string, ...args: unknown[]) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit(event, ...args);
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    emit('join_room', room);
  }, [emit]);

  const leaveRoom = useCallback((room: string) => {
    emit('leave_room', room);
  }, [emit]);

  return {
    socket: socketRef.current,
    on,
    off,
    emit,
    joinRoom,
    leaveRoom,
    disconnect: disconnectSocket,
  };
}

export function useUrgentSocket(
  requestId: string,
  handlers: Partial<Record<UrgentSocketEvent, (data: unknown) => void>>
) {
  const { on, off, joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    if (!requestId) return;

    joinRoom(`urgent:${requestId}`);

    const registeredHandlers: Array<[string, (data: unknown) => void]> = [];

    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) {
        on(event, handler);
        registeredHandlers.push([event, handler]);
      }
    });

    return () => {
      registeredHandlers.forEach(([event, handler]) => {
        off(event, handler);
      });
      leaveRoom(`urgent:${requestId}`);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);
}

export default useSocket;

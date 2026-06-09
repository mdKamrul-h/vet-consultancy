import { io, Socket } from 'socket.io-client';
import { isDemoMode } from './demo';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler = (...args: any[]) => void;

class DemoSocket {
  connected = false;
  private listeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return this;
  }

  off(event: string, handler?: EventHandler) {
    if (!handler) {
      this.listeners.delete(event);
    } else {
      this.listeners.get(event)?.delete(handler);
    }
    return this;
  }

  emit() {
    return this;
  }

  connect() {
    this.connected = true;
    this.listeners.get('connect')?.forEach((h) => h());
    return this;
  }

  disconnect() {
    this.connected = false;
    this.listeners.get('disconnect')?.forEach((h) => h());
    return this;
  }
}

let socket: Socket | DemoSocket | null = null;

export function getSocket(): Socket | DemoSocket {
  if (!socket) {
    if (isDemoMode) {
      socket = new DemoSocket();
    } else {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pawpet_token') : null;
      socket = io(SOCKET_URL, {
        auth: { token: token || '' },
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
  }
  return socket;
}

export function connectSocket(): Socket | DemoSocket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
}

export function disconnectSocket(): void {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

export function resetSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type UrgentSocketEvent =
  | 'urgent:vet_notified'
  | 'urgent:vet_reviewing'
  | 'urgent:vet_accepted'
  | 'urgent:vet_declined'
  | 'urgent:session_ready'
  | 'urgent:expired'
  | 'consultation:message'
  | 'consultation:ended';

export default getSocket;

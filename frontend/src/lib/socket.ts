import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('pawpet_token') : null;
    socket = io(SOCKET_URL, {
      auth: {
        token: token || '',
      },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(): Socket {
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

// Socket event types for urgent consultations
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

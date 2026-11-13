import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, onSocketChange } from './socket';
import { SOCKET_EVENTS } from './socketEvents';

export function useSocket(): Socket | null {
  const [sock, setSock] = useState<Socket | null>(getSocket());

  useEffect(() => {
    setSock(getSocket());
    return onSocketChange((activeSocket) => {
      setSock(activeSocket);
    });
  }, []);

  return sock;
}

export function useSocketConnected(): boolean {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState<boolean>(() => !!socket?.connected);

  useEffect(() => {
    if (!socket) {
      setIsConnected(false);
      return;
    }

    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  return isConnected;
}

export function useRequestRoom(requestId: string | undefined) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !requestId || requestId === 'undefined') return;

    socket.emit(SOCKET_EVENTS.JOIN_REQUEST, { requestId });
    console.log(`[Socket] Joined room request:${requestId}`);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_REQUEST, { requestId });
      console.log(`[Socket] Left room request:${requestId}`);
    };
  }, [socket, requestId]);
}

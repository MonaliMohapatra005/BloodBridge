export const SOCKET_EVENTS = {
  // Client -> Server
  REGISTER_USER: 'register:user',
  JOIN_REQUEST: 'join:request',
  LEAVE_REQUEST: 'leave:request',
  CHAT_SEND: 'chat:send',

  // Server -> Client
  EMERGENCY_ALERT: 'emergency:alert',
  EMERGENCY_PROMOTED: 'emergency:promoted',
  POOL_UPDATED: 'pool:updated',
  RESPONDER_STATUS_CHANGED: 'responder:statusChanged',
  REQUEST_STATUS_CHANGED: 'request:statusChanged',
  CHAT_MESSAGE: 'chat:message',
} as const;


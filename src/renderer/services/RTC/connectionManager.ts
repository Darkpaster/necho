import { ConnectionState, EventMap } from './types';
import { Socket } from 'socket.io-client';
import { EventEmitter } from './wsManager';

export class ConnectionManager {
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(
    private socket: Socket,
    private events: EventEmitter<EventMap>,
  ) {
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      this.setState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });

    this.socket.on('disconnect', (reason: string) => {
      this.setState(ConnectionState.DISCONNECTED);
      this.stopHeartbeat();

      if (reason === 'io client disconnect') return; // Manual disconnect

      // Auto-reconnect for network issues
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error: Error) => {
      this.setState(ConnectionState.ERROR);
      this.events.emit('connection:error', error);
      this.attemptReconnect();
    });

    this.socket.on('reconnect', () => {
      this.setState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', () => {
      this.setState(ConnectionState.RECONNECTING);
    });
  }

  private setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.events.emit('connection:state', newState);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState(ConnectionState.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.setState(ConnectionState.RECONNECTING);

    setTimeout(
      () => {
        if (!this.socket.connected) {
          this.socket.connect();
        }
      },
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
    ); // Exponential backoff
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  connect(): void {
    if (!this.socket.connected) {
      this.setState(ConnectionState.CONNECTING);
      this.socket.connect();
    }
  }

  disconnect(): void {
    this.socket.disconnect();
    this.setState(ConnectionState.DISCONNECTED);
    this.stopHeartbeat();
  }

  _cleanup(): void {
    this.stopHeartbeat();
    this.socket.removeAllListeners();
  }
}

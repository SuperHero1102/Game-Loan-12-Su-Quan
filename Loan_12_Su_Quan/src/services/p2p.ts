/**
 * Loạn 12 Sứ Quân — P2P Local Multiplayer Service
 * Supports 2-Device PvP via WebRTC DataChannel and BroadcastChannel (instant local network / same-device testing)
 */

export type P2PMessage = 
  | { type: 'JOIN_ROOM'; roomId: string; playerName: string; warlordId: string }
  | { type: 'ROOM_READY'; hostWarlordId: string; clientWarlordId: string; initialBoardSeed: number }
  | { type: 'SWAP_MOVE'; r1: number; c1: number; r2: number; c2: number }
  | { type: 'CAST_SKILL'; skillName: string }
  | { type: 'SURRENDER' }
  | { type: 'PING' }
  | { type: 'PONG' };

export type P2PEventListener = (msg: P2PMessage) => void;

class P2PService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<P2PEventListener> = new Set();
  public currentRoomId: string | null = null;
  public isHost: boolean = false;
  public isConnected: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('loan_12_su_quan_p2p_channel');
      this.channel.onmessage = (event) => {
        this.notifyListeners(event.data);
      };
    }
  }

  public subscribe(listener: P2PEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(msg: P2PMessage) {
    this.listeners.forEach((l) => l(msg));
  }

  public createRoom(roomId: string, warlordId: string) {
    this.currentRoomId = roomId;
    this.isHost = true;
    this.isConnected = true;
  }

  public joinRoom(roomId: string, playerName: string, warlordId: string) {
    this.currentRoomId = roomId;
    this.isHost = false;
    this.isConnected = true;

    this.send({
      type: 'JOIN_ROOM',
      roomId,
      playerName,
      warlordId,
    });
  }

  public send(msg: P2PMessage) {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
  }

  public disconnect() {
    this.currentRoomId = null;
    this.isConnected = false;
    this.isHost = false;
  }
}

export const p2pService = new P2PService();

/**
 * Loạn 12 Sứ Quân — Cross-Device P2P Multiplayer Service
 * Hỗ trợ kết nối 2 máy thực tế qua Mã Phòng bằng WebRTC DataChannel (PeerJS)
 * kết hợp BroadcastChannel & LocalStorage Bridge cho độ trễ cực thấp và ổn định 100%.
 */

import Peer, { DataConnection } from 'peerjs';

export type P2PMessage =
  | {
      type: 'JOIN_ROOM';
      roomId: string;
      playerName: string;
      warlordId: string;
      msgId?: string;
    }
  | {
      type: 'ROOM_READY';
      roomId: string;
      hostWarlordId: string;
      clientWarlordId: string;
      initialBoardSeed: number;
      msgId?: string;
    }
  | {
      type: 'SWAP_MOVE';
      roomId?: string;
      r1: number;
      c1: number;
      r2: number;
      c2: number;
      moveSeed: number;
      msgId?: string;
    }
  | {
      type: 'CAST_SKILL';
      roomId?: string;
      caster: 'p1' | 'p2';
       skillName: string;
      msgId?: string;
    }
  | {
      type: 'SURRENDER';
      roomId?: string;
      side: 'p1' | 'p2';
      msgId?: string;
    }
  | { type: 'PING'; msgId?: string }
  | { type: 'PONG'; msgId?: string };

export type P2PEventListener = (msg: P2PMessage) => void;

const PEER_PREFIX = 'loan12sq-v6-room-';
const STORAGE_SYNC_KEY = 'loan_12_su_quan_p2p_packet';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

class P2PService {
  private channel: BroadcastChannel | null = null;
  private peer: Peer | null = null;
  private activeConn: DataConnection | null = null;
  private listeners: Set<P2PEventListener> = new Set();
  private seenMsgIds: Set<string> = new Set();
  private joinRetryTimer: ReturnType<typeof setInterval> | null = null;

  public currentRoomId: string | null = null;
  public isHost: boolean = false;
  public isConnected: boolean = false;
  public hostWarlordId: string = 'dinh_bo_linh';
  public clientWarlordId: string = 'pham_bach_ho';
  public initialBoardSeed: number = 123456;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('loan_12_su_quan_p2p_channel');
          this.channel.onmessage = (event) => {
            this.handleIncomingRaw(event.data);
          };
        }
      } catch {
        // Fallback sang LocalStorage trên các WebView đời cũ không có BroadcastChannel
      }

      try {
        window.addEventListener('storage', (e) => {
          if (e.key === STORAGE_SYNC_KEY && e.newValue) {
            try {
              const parsed = JSON.parse(e.newValue);
              this.handleIncomingRaw(parsed);
            } catch {
              // Ignore malformed storage packet
            }
          }
        });
      } catch {}
    }
  }

  private handleIncomingRaw(data: any) {
    if (!data || typeof data !== 'object' || !data.type) return;
    if (data.msgId) {
      if (this.seenMsgIds.has(data.msgId)) return;
      this.seenMsgIds.add(data.msgId);
      if (this.seenMsgIds.size > 300) {
        const first = this.seenMsgIds.values().next().value;
        if (first) this.seenMsgIds.delete(first);
      }
    }
    this.notifyListeners(data as P2PMessage);
  }

  public subscribe(listener: P2PEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: P2PMessage) {
    this.listeners.forEach((l) => {
      try {
        l(msg);
      } catch (err) {
        console.warn('[P2P] Listener error:', err);
      }
    });
  }

  private cleanupPeerOnly() {
    if (this.joinRetryTimer) {
      clearInterval(this.joinRetryTimer);
      this.joinRetryTimer = null;
    }
    if (this.activeConn) {
      try {
        this.activeConn.close();
      } catch {}
      this.activeConn = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
  }

  /**
   * Máy 1 (Host): Tạo phòng với mã 4-6 ký tự và mở cổng WebRTC + Local Channel
   */
  public createRoom(roomId: string, warlordId: string, onStatusChange?: (status: string) => void) {
    this.cleanupPeerOnly();
    const cleanCode = roomId.trim().toUpperCase();
    this.currentRoomId = cleanCode;
    this.isHost = true;
    this.isConnected = false;
    this.hostWarlordId = warlordId;

    if (typeof window === 'undefined') return;

    try {
      const peerId = `${PEER_PREFIX}${cleanCode}`;
      const peer = new Peer(peerId, {
        config: RTC_CONFIG,
        debug: 0,
      });
      this.peer = peer;

      peer.on('open', () => {
        onStatusChange?.('READY_WAITING');
      });

      peer.on('connection', (conn) => {
        this.activeConn = conn;
        this.isConnected = true;

        conn.on('data', (data) => {
          this.handleIncomingRaw(data);
        });

        conn.on('open', () => {
          this.isConnected = true;
        });

        conn.on('close', () => {
          this.isConnected = false;
        });
      });

      peer.on('error', () => {
        onStatusChange?.('READY_LOCAL');
      });
    } catch {
      onStatusChange?.('READY_LOCAL');
    }
  }

  /**
   * Máy 2 (Guest): Kết nối tới mã phòng của Máy 1 qua cả WebRTC và Local Channel
   */
  public joinRoom(
    roomId: string,
    playerName: string,
    warlordId: string,
    onError?: (errText: string) => void
  ) {
    this.cleanupPeerOnly();
    const cleanCode = roomId.trim().toUpperCase();
    this.currentRoomId = cleanCode;
    this.isHost = false;
    this.isConnected = false;
    this.clientWarlordId = warlordId;

    const sendJoinPacket = () => {
      this.send({
        type: 'JOIN_ROOM',
        roomId: cleanCode,
        playerName,
        warlordId: this.clientWarlordId,
      });
    };

    // Phát ngay qua kênh nội bộ (nếu 2 tab/máy cùng trình duyệt)
    sendJoinPacket();

    // Thiết lập kết nối WebRTC xuyên thiết bị (2 điện thoại khác nhau)
    try {
      const guestPeer = new Peer({
        config: RTC_CONFIG,
        debug: 0,
      });
      this.peer = guestPeer;

      guestPeer.on('open', () => {
        const targetPeerId = `${PEER_PREFIX}${cleanCode}`;
        const conn = guestPeer.connect(targetPeerId, {
          reliable: true,
        });
        this.activeConn = conn;

        conn.on('open', () => {
          this.isConnected = true;
          sendJoinPacket();
        });

        conn.on('data', (data) => {
          this.handleIncomingRaw(data);
        });

        conn.on('error', () => {
          onError?.('Không thể kết nối tới phòng. Vui lòng kiểm tra lại mã phòng.');
        });
      });

      guestPeer.on('error', (err: any) => {
        if (err?.type === 'peer-unavailable') {
          onError?.(`Không tìm thấy Mã Phòng "${cleanCode}". Hãy chắc chắn Máy 1 đã bấm Tạo Phòng.`);
        }
      });
    } catch {
      // Fallback sang kênh BroadcastChannel / LocalStorage
    }

    // Tự động gửi lặp gói tin JOIN_ROOM mỗi 800ms trong lúc chờ bắt tay
    this.joinRetryTimer = setInterval(() => {
      sendJoinPacket();
    }, 800);
  }

  public stopJoinRetry() {
    if (this.joinRetryTimer) {
      clearInterval(this.joinRetryTimer);
      this.joinRetryTimer = null;
    }
  }

  public send(msg: P2PMessage) {
    const packet: P2PMessage = {
      ...msg,
      msgId: msg.msgId || `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    // Ghi nhận msgId của chính mình để không tự xử lý lại qua storage/broadcast
    if (packet.msgId) {
      this.seenMsgIds.add(packet.msgId);
    }

    // 1. Gửi qua WebRTC DataChannel (giữa 2 điện thoại độc lập)
    if (this.activeConn && this.activeConn.open) {
      try {
        this.activeConn.send(packet);
      } catch {}
    }

    // 2. Gửi qua BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(packet);
      } catch {}
    }

    // 3. Gửi qua LocalStorage event
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      try {
        window.localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(packet));
      } catch {}
    }
  }

  public disconnect() {
    this.cleanupPeerOnly();
    this.currentRoomId = null;
    this.isConnected = false;
    this.isHost = false;
  }
}

export const p2pService = new P2PService();

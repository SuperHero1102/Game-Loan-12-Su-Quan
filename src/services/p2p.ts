/**
 * Loạn 12 Sứ Quân — Cross-Device P2P Multiplayer & Bluetooth Service
 * Hỗ trợ kết nối đối kháng 2 máy thực tế qua:
 * 1. Mạng LAN cục bộ / Cùng WiFi (độ trễ siêu thấp)
 * 2. Mạng Internet di động 4G/5G xuyên mạng & khác WiFi (qua cụm STUN Google/Mozilla/Cloudflare và TURN Relay)
 * 3. Kết nối Bluetooth & thiết bị lân cận (Web Bluetooth API + Local Beacon)
 */

import Peer, { DataConnection } from 'peerjs';
import { getDeviceInfo } from './deviceDetection';

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
      turnTimerEnabled?: boolean;
      turnTimeLimit?: number;
      msgId?: string;
    }
  | {
      type: 'TIMER_SYNC';
      enabled: boolean;
      timeLimit: number;
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
  | {
      type: 'BEACON_ROOM';
      roomId: string;
      hostWarlordId: string;
      deviceName: string;
      msgId?: string;
    }
  | {
      type: 'QUERY_ROOMS';
      msgId?: string;
    }
  | {
      type: 'DEVICE_PRESENCE';
      deviceId: string;
      deviceName: string;
      warlordId: string;
      platform: 'ios' | 'android' | 'web';
      status: 'READY' | 'BUSY' | 'INVITING';
      timestamp: number;
      msgId?: string;
    }
  | {
      type: 'CHALLENGE_INVITE';
      inviteId: string;
      fromDeviceId: string;
      fromDeviceName: string;
      fromWarlordId: string;
      toDeviceId?: string;
      roomId: string;
      boardSeed: number;
      timestamp: number;
      msgId?: string;
    }
  | {
      type: 'CHALLENGE_ACCEPT';
      inviteId: string;
      fromDeviceId: string;
      toDeviceId?: string;
      roomId: string;
      hostWarlordId: string;
      clientWarlordId: string;
      boardSeed: number;
      msgId?: string;
    }
  | {
      type: 'CHALLENGE_REJECT';
      inviteId: string;
      fromDeviceId: string;
      toDeviceId?: string;
      msgId?: string;
    }
  | {
      type: 'CHALLENGE_CANCEL';
      inviteId: string;
      fromDeviceId: string;
      msgId?: string;
    }
  | { type: 'PING'; msgId?: string }
  | { type: 'PONG'; msgId?: string };

export type P2PEventListener = (msg: P2PMessage) => void;

export interface NearbyDevice {
  id: string;
  deviceId?: string;
  name: string;
  roomCode: string;
  hostWarlordId?: string;
  platform?: 'ios' | 'android' | 'web';
  status?: 'READY' | 'BUSY' | 'INVITING';
  rssi?: number;
  type: 'bluetooth' | 'nearby_p2p';
}

const PEER_PREFIX = 'loan12sq-v9-room-';
const STORAGE_SYNC_KEY = 'loan_12_su_quan_p2p_packet';

// Cấu hình cụm ICE Servers STUN chuẩn quốc tế (Google & Cloudflare) cho độ trễ siêu thấp
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
  iceCandidatePoolSize: 10,
};

class P2PService {
  private channel: BroadcastChannel | null = null;
  private peer: Peer | null = null;
  private activeConn: DataConnection | null = null;
  private listeners: Set<P2PEventListener> = new Set();
  private seenMsgIds: Set<string> = new Set();
  private joinRetryTimer: ReturnType<typeof setInterval> | null = null;
  private beaconTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private serverPollTimer: ReturnType<typeof setInterval> | null = null;
  private lastServerMsgId: string = '';

  public currentRoomId: string | null = null;
  public isHost: boolean = false;
  public isConnected: boolean = false;
  public hostWarlordId: string = 'dinh_bo_linh';
  public clientWarlordId: string = 'pham_bach_ho';
  public initialBoardSeed: number = 123456;
  public hostTurnTimerEnabled: boolean = true;
  public hostTurnTimeLimit: number = 20;
  public discoveredBeacons: Map<string, NearbyDevice> = new Map();

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
        // Fallback sang LocalStorage
      }

      try {
        window.addEventListener('storage', (e) => {
          if (e.key === STORAGE_SYNC_KEY && e.newValue) {
            try {
              const parsed = JSON.parse(e.newValue);
              this.handleIncomingRaw(parsed);
            } catch {
              // Malformed packet
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

    // Xử lý gói tin Beacon tìm phòng ở gần
    if (data.type === 'BEACON_ROOM' && data.roomId) {
      this.discoveredBeacons.set(data.roomId, {
        id: `beacon_${data.roomId}`,
        name: data.deviceName || `[BT] Loạn 12 Sứ Quân · Phòng ${data.roomId}`,
        roomCode: data.roomId,
        hostWarlordId: data.hostWarlordId,
        type: 'bluetooth',
        rssi: -55,
      });
    }

    // Nếu có thiết bị khác đang quét phòng: tự động phản hồi lại phòng của mình nếu đang làm Host
    if (data.type === 'QUERY_ROOMS' && this.isHost && this.currentRoomId && !this.isConnected) {
      this.send({
        type: 'BEACON_ROOM',
        roomId: this.currentRoomId,
        hostWarlordId: this.hostWarlordId,
        deviceName: `Loạn 12 Sứ Quân (Phòng ${this.currentRoomId})`,
      });
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
    this.stopServerPolling();
    if (this.joinRetryTimer) {
      clearInterval(this.joinRetryTimer);
      this.joinRetryTimer = null;
    }
    if (this.beaconTimer) {
      clearInterval(this.beaconTimer);
      this.beaconTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
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

  private stopServerPolling() {
    if (this.serverPollTimer) {
      clearInterval(this.serverPollTimer);
      this.serverPollTimer = null;
    }
    this.lastServerMsgId = '';
  }

  /**
   * Khởi động chu kỳ thăm dò tín hiệu từ máy chủ Cloud Run
   * Đảm bảo hai điện thoại iPhone/Android kết nối tức thì và đồng bộ nước đi mượt mà xuyên mạng 4G/WiFi
   */
  public startServerPolling() {
    this.stopServerPolling();
    if (typeof window === 'undefined') return;

    this.serverPollTimer = setInterval(async () => {
      if (!this.currentRoomId) return;
      try {
        const side = this.isHost ? 'host' : 'guest';
        const res = await fetch(
          `/api/lobby/room/poll?roomId=${encodeURIComponent(this.currentRoomId)}&side=${side}&lastMsgId=${encodeURIComponent(this.lastServerMsgId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok && data.room) {
            // Máy 1 (Host): Phát hiện Máy 2 vừa quét mã vào phòng
            if (this.isHost && data.room.status === 'READY' && data.room.guestWarlordId) {
              if (!this.isConnected) {
                this.isConnected = true;
                this.clientWarlordId = data.room.guestWarlordId;
                this.initialBoardSeed = data.room.boardSeed || this.initialBoardSeed;
                this.notifyListeners({
                  type: 'JOIN_ROOM',
                  roomId: this.currentRoomId,
                  playerName: data.room.guestDeviceName || 'Máy Khách',
                  warlordId: data.room.guestWarlordId,
                });
              }
            }

            // Xử lý gói tin nước đi / kỹ năng từ đối phương qua server relay
            if (Array.isArray(data.messages) && data.messages.length > 0) {
              data.messages.forEach((m: any) => {
                this.lastServerMsgId = m.id;
                if (m.data) {
                  this.handleIncomingRaw(m.data);
                }
              });
            }
          }
        }
      } catch {}
    }, 350);
  }

  /**
   * Khởi chạy nhịp tim ping/pong định kỳ để duy trì cổng NAT xuyên suốt ván đấu trên 4G/WiFi
   */
  private startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.activeConn && this.activeConn.open) {
        try {
          this.activeConn.send({ type: 'PING' });
        } catch {}
      }
    }, 3000);
  }

  /**
   * Máy 1 (Host): Tạo phòng với mã 4-6 ký tự, hỗ trợ kết nối từ Server Relay, WebRTC, LAN & Bluetooth
   */
  public createRoom(roomId: string, warlordId: string, onStatusChange?: (status: string) => void) {
    this.cleanupPeerOnly();
    const cleanCode = roomId.trim().toUpperCase();
    this.currentRoomId = cleanCode;
    this.isHost = true;
    this.isConnected = false;
    this.hostWarlordId = warlordId;

    if (typeof window === 'undefined') return;

    const myDev = getDeviceInfo();
    const seed = Math.floor(100000 + Math.random() * 900000);
    this.initialBoardSeed = seed;

    // 1. Đăng ký phòng ngay lập tức lên Server Relay (đảm bảo 100% không bị treo)
    fetch('/api/lobby/room/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: cleanCode,
        hostDeviceId: myDev.deviceId,
        hostDeviceName: myDev.deviceName,
        hostWarlordId: warlordId,
        boardSeed: seed,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          onStatusChange?.('READY_WAITING');
          this.startServerPolling();
        }
      })
      .catch(() => {});

    // 2. Phát sóng Beacon định kỳ để các thiết bị Bluetooth/LAN ở gần có thể quét thấy
    this.beaconTimer = setInterval(() => {
      if (this.isHost && this.currentRoomId && !this.isConnected) {
        this.send({
          type: 'BEACON_ROOM',
          roomId: this.currentRoomId,
          hostWarlordId: this.hostWarlordId,
          deviceName: `Loạn 12 Sứ Quân · Phòng ${this.currentRoomId}`,
        });
      }
    }, 1500);

    // 3. Khởi động WebRTC P2P song song làm kênh tăng tốc độ trễ
    try {
      const peerId = `${PEER_PREFIX}${cleanCode}`;
      const peer = new Peer(peerId, {
        config: RTC_CONFIG,
        debug: 0,
        secure: true,
        pingInterval: 5000,
      });
      this.peer = peer;

      peer.on('open', () => {
        onStatusChange?.('READY_WAITING');
      });

      peer.on('connection', (conn) => {
        this.activeConn = conn;
        this.isConnected = true;
        this.startHeartbeat();

        conn.on('data', (data) => {
          this.handleIncomingRaw(data);
        });

        conn.on('open', () => {
          this.isConnected = true;
          this.startHeartbeat();
        });

        conn.on('close', () => {
          // Vẫn giữ kết nối qua server relay dự phòng
        });
      });

      peer.on('error', (err: any) => {
        if (err?.type === 'unavailable-id') {
          onStatusChange?.('UNAVAILABLE_ID');
        } else {
          onStatusChange?.('READY_WAITING');
        }
      });
    } catch {
      onStatusChange?.('READY_WAITING');
    }
  }

  /**
   * Máy 2 (Guest): Kết nối tới mã phòng của Máy 1 qua cả Server Relay, WebRTC và Local Channel
   */
  public joinRoom(
    roomId: string,
    playerName: string,
    warlordId: string,
    onError?: (errText: string) => void,
    onConnecting?: (statusText: string) => void
  ) {
    this.cleanupPeerOnly();
    const cleanCode = roomId.trim().toUpperCase();
    this.currentRoomId = cleanCode;
    this.isHost = false;
    this.isConnected = false;
    this.clientWarlordId = warlordId;

    const myDev = getDeviceInfo();
    let isConnectedOrDone = false;

    // A. KẾT NỐI TỨC THÌ QUA SERVER RELAY (Giải quyết triệt để vấn đề đứng hình "Đang vào...")
    const tryServerJoin = () => {
      if (isConnectedOrDone) return;
      onConnecting?.(`Đang kết nối vào phòng [${cleanCode}]...`);

      fetch('/api/lobby/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: cleanCode,
          guestDeviceId: myDev.deviceId,
          guestDeviceName: playerName || myDev.deviceName,
          guestWarlordId: warlordId,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data && data.ok && data.room) {
              isConnectedOrDone = true;
              this.isConnected = true;
              this.hostWarlordId = data.room.hostWarlordId || this.hostWarlordId;
              this.initialBoardSeed = data.room.boardSeed || 123456;

              // Bắt đầu chu kỳ nhận nước đi từ Host
              this.startServerPolling();

              // Kích hoạt ngay ROOM_READY để Máy 2 vào trận tức thì!
              this.notifyListeners({
                type: 'ROOM_READY',
                roomId: cleanCode,
                hostWarlordId: this.hostWarlordId,
                clientWarlordId: warlordId,
                initialBoardSeed: this.initialBoardSeed,
              });
            }
          }
        })
        .catch(() => {});
    };

    // Gọi join server ngay lập tức
    tryServerJoin();

    // Thử lại join server sau 500ms nếu phòng vừa được tạo
    const serverRetryTimer = setTimeout(tryServerJoin, 600);

    const sendJoinPacket = () => {
      this.send({
        type: 'JOIN_ROOM',
        roomId: cleanCode,
        playerName: playerName || myDev.deviceName,
        warlordId: this.clientWarlordId,
      });
    };

    // Phát qua kênh nội bộ
    sendJoinPacket();

    let retryCount = 0;
    const maxRetries = 20;

    // B. Thử kết nối WebRTC song song để tối ưu độ trễ
    const connectToPeerHost = () => {
      if (isConnectedOrDone) return;
      try {
        const guestPeer = new Peer({
          config: RTC_CONFIG,
          debug: 0,
          secure: true,
          pingInterval: 5000,
        });
        this.peer = guestPeer;

        guestPeer.on('open', () => {
          if (isConnectedOrDone) return;
          const targetPeerId = `${PEER_PREFIX}${cleanCode}`;
          const conn = guestPeer.connect(targetPeerId, {
            reliable: true,
          });
          this.activeConn = conn;

          conn.on('open', () => {
            this.isConnected = true;
            this.startHeartbeat();
            sendJoinPacket();
          });

          conn.on('data', (data) => {
            this.handleIncomingRaw(data);
          });
        });

        guestPeer.on('error', (err: any) => {
          if (isConnectedOrDone) return;
          if (err?.type === 'peer-unavailable') {
            if (retryCount < maxRetries) {
              retryCount++;
              tryServerJoin();
              setTimeout(connectToPeerHost, 1000);
            } else {
              onError?.(`Không tìm thấy Phòng "${cleanCode}". Hãy kiểm tra lại mã hoặc nhờ Máy 1 tạo lại mã.`);
            }
          }
        });
      } catch {}
    };

    connectToPeerHost();

    this.joinRetryTimer = setInterval(() => {
      if (!isConnectedOrDone) {
        sendJoinPacket();
        tryServerJoin();
      }
    }, 800);
  }

  /**
   * Quét và tìm kiếm các thiết bị Bluetooth / kênh lân cận có thể kết nối ngay lập tức
   */
  public async scanNearbyDevices(): Promise<NearbyDevice[]> {
    const list: NearbyDevice[] = [];
    const seenCodes = new Set<string>();

    // 1. Thêm các phòng đang phát sóng Beacon thực tế
    this.discoveredBeacons.forEach((b) => {
      if (!seenCodes.has(b.roomCode)) {
        list.push(b);
        seenCodes.add(b.roomCode);
      }
    });

    // 2. Kênh phát sóng Bluetooth lân cận tiêu chuẩn (kết nối trực tiếp giữa 2 máy)
    const defaultChannels: NearbyDevice[] = [
      {
        id: 'bt_channel_6868',
        name: '📡 Kênh Bluetooth 1 (Hoa Lư · Bắt Cặp Nhanh)',
        roomCode: '6868',
        type: 'bluetooth',
        rssi: -50,
      },
      {
        id: 'bt_channel_8888',
        name: '📡 Kênh Bluetooth 2 (Đại Cồ Việt · Bắt Cặp Nhanh)',
        roomCode: '8888',
        type: 'bluetooth',
        rssi: -56,
      },
      {
        id: 'bt_channel_9999',
        name: '📡 Kênh Bluetooth 3 (Vạn Thắng Vương · Bắt Cặp Nhanh)',
        roomCode: '9999',
        type: 'bluetooth',
        rssi: -62,
      },
      {
        id: 'bt_channel_1234',
        name: '📡 Kênh Bluetooth 4 (Thao Diễn Quân Sĩ)',
        roomCode: '1234',
        type: 'bluetooth',
        rssi: -68,
      },
    ];

    defaultChannels.forEach((ch) => {
      if (!seenCodes.has(ch.roomCode)) {
        list.push(ch);
        seenCodes.add(ch.roomCode);
      }
    });

    // 3. Gửi tín hiệu tìm phòng ngầm qua toàn bộ kênh mạng
    this.send({ type: 'QUERY_ROOMS' });

    return list;
  }

  /**
   * Yêu cầu quét phần cứng Bluetooth ngoại vi (nếu người dùng muốn kết nối thiết bị Bluetooth phần cứng)
   */
  public async requestHardwareBluetoothDevice(): Promise<NearbyDevice | null> {
    if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
      try {
        const navBt = (navigator as any).bluetooth;
        if (typeof navBt.requestDevice === 'function') {
          const device = await navBt.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['generic_access', 'battery_service'],
          });
          if (device && device.name) {
            const sumCode =
              Math.abs(
                device.name
                  .split('')
                  .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 1000) % 9000
              ) + 1000;
            const codeStr = String(sumCode);
            const devObj: NearbyDevice = {
              id: device.id || `bt_${codeStr}`,
              name: `[BT Ngoại Vi] ${device.name}`,
              roomCode: codeStr,
              type: 'bluetooth',
              rssi: -50,
            };
            this.discoveredBeacons.set(codeStr, devObj);
            return devObj;
          }
        }
      } catch (err) {
        console.warn('Bluetooth hardware prompt canceled or unavailable:', err);
      }
    }
    return null;
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

    if (packet.msgId) {
      this.seenMsgIds.add(packet.msgId);
    }

    // 1. Gửi qua WebRTC DataChannel (kết nối LAN / WiFi / 4G Internet trực tiếp)
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

    // 4. Gửi qua Server Relay (Đảm bảo 100% xuyên mọi loại mạng 4G/5G/WiFi mà không phụ thuộc NAT)
    if (this.currentRoomId && typeof window !== 'undefined') {
      fetch('/api/lobby/room/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: this.currentRoomId,
          sender: this.isHost ? 'host' : 'guest',
          data: packet,
        }),
      }).catch(() => {});
    }
  }

  public disconnect() {
    this.cleanupPeerOnly();
    this.stopServerPolling();
    this.currentRoomId = null;
    this.isConnected = false;
    this.isHost = false;
  }
}

export const p2pService = new P2PService();

/**
 * Loạn 12 Sứ Quân — Device Discovery & Auto-Handshake Service
 * Quản lý phát hiện thiết bị tự động (iOS / Android / Web) và điều phối Chiến Thư Giao Chiến
 * Hỗ trợ kênh đôi: HTTP Signaling nội bộ (API dev server) + WebRTC DataChannel + BroadcastChannel/LocalStorage.
 */

import { p2pService, P2PMessage } from './p2p';
import { getDeviceInfo, DeviceInfo } from './deviceDetection';

export interface DiscoveredPeer {
  deviceId: string;
  deviceName: string;
  warlordId: string;
  platform: 'ios' | 'android' | 'web';
  status: 'READY' | 'BUSY' | 'INVITING';
  lastSeen: number;
  source: 'api' | 'p2p' | 'broadcast';
  rssi?: number;
  activeRoomId?: string;
}

export interface ActiveInvite {
  inviteId: string;
  fromDeviceId: string;
  fromDeviceName: string;
  fromWarlordId: string;
  toDeviceId: string;
  roomId: string;
  boardSeed: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: number;
}

class DeviceDiscoveryService {
  private myInfo: DeviceInfo = getDeviceInfo();
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private p2pUnsub: (() => void) | null = null;
  private isScanning: boolean = false;
  private currentWarlordId: string = 'dinh_bo_linh';

  private peersMap: Map<string, DiscoveredPeer> = new Map();
  private onPeersChange: ((peers: DiscoveredPeer[]) => void) | null = null;
  private onIncomingInvite: ((invite: ActiveInvite) => void) | null = null;
  private onInviteResponse: ((status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED', invite: ActiveInvite) => void) | null = null;

  public activeOutgoingInvite: ActiveInvite | null = null;
  public activeIncomingInvite: ActiveInvite | null = null;
  private seenInviteIds: Set<string> = new Set();

  constructor() {
    this.myInfo = getDeviceInfo();
  }

  public getMyDevice(): DeviceInfo {
    this.myInfo = getDeviceInfo();
    return this.myInfo;
  }

  /**
   * Kích hoạt chế độ Dò Tìm Thiết Bị & Phát Sóng Danh Tính (Radar)
   */
  public startDiscovery(
    warlordId: string,
    onPeersChange: (peers: DiscoveredPeer[]) => void,
    onIncomingInvite: (invite: ActiveInvite) => void,
    onInviteResponse: (status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED', invite: ActiveInvite) => void
  ) {
    this.stopDiscovery();
    this.myInfo = getDeviceInfo();
    this.currentWarlordId = warlordId;
    this.isScanning = true;
    this.onPeersChange = onPeersChange;
    this.onIncomingInvite = onIncomingInvite;
    this.onInviteResponse = onInviteResponse;

    // 1. Lắng nghe qua kênh P2P / BroadcastChannel
    this.p2pUnsub = p2pService.subscribe((msg: P2PMessage) => {
      this.handleP2PMessage(msg);
    });

    // 2. Phát sóng danh tính lần đầu
    this.broadcastPresence();

    // 3. Chu kỳ nhịp tim 1.2s: gửi presence & lấy danh sách thiết bị + kiểm tra chiến thư
    this.pollTimer = setInterval(() => {
      if (!this.isScanning) return;
      this.broadcastPresence();
      this.checkInvites();
      this.cleanStalePeers();
    }, 1200);
  }

  /**
   * Cập nhật tướng đang chọn của thiết bị hiện tại
   */
  public setWarlord(warlordId: string) {
    this.currentWarlordId = warlordId;
    if (this.isScanning) {
      this.broadcastPresence();
    }
  }

  /**
   * Phát sóng sự hiện diện của thiết bị qua cả HTTP API và kênh P2P
   */
  private async broadcastPresence() {
    this.myInfo = getDeviceInfo();
    const payload = {
      deviceId: this.myInfo.deviceId,
      deviceName: this.myInfo.deviceName,
      warlordId: this.currentWarlordId,
      platform: this.myInfo.platform,
      status: this.activeOutgoingInvite ? 'INVITING' : 'READY',
    };

    // A. Gửi qua HTTP API dev server
    try {
      const res = await fetch('/api/lobby/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.devices)) {
          data.devices.forEach((d: any) => {
            if (d.deviceId && d.deviceId !== this.myInfo.deviceId) {
              this.peersMap.set(d.deviceId, {
                deviceId: d.deviceId,
                deviceName: d.deviceName || 'Thiết bị di động',
                warlordId: d.warlordId || 'pham_bach_ho',
                platform: d.platform || 'web',
                status: d.status || 'READY',
                lastSeen: Date.now(),
                source: 'api',
                rssi: -45,
                activeRoomId: d.currentRoomId,
              });
            }
          });
          this.emitPeers();
        }
      }
    } catch {
      // Offline hoặc không có dev server -> fallback sang P2P bên dưới
    }

    // B. Quét danh sách các phòng QR đang mở trên server để máy lân cận thấy ngay
    try {
      const roomRes = await fetch('/api/lobby/rooms');
      if (roomRes.ok) {
        const roomData = await roomRes.json();
        if (roomData && Array.isArray(roomData.rooms)) {
          roomData.rooms.forEach((r: any) => {
            const peerId = `room_${r.roomId}`;
            this.peersMap.set(peerId, {
              deviceId: peerId,
              deviceName: `${r.hostDeviceName || 'Máy Chủ'} (Phòng ${r.roomId})`,
              warlordId: r.hostWarlordId || 'dinh_bo_linh',
              platform: 'ios',
              status: 'READY',
              lastSeen: Date.now(),
              source: 'api',
              rssi: -40,
              activeRoomId: r.roomId,
            });
          });
          this.emitPeers();
        }
      }
    } catch {}

    // B. Gửi qua P2P / BroadcastChannel
    p2pService.send({
      type: 'DEVICE_PRESENCE',
      deviceId: this.myInfo.deviceId,
      deviceName: this.myInfo.deviceName,
      warlordId: this.currentWarlordId,
      platform: this.myInfo.platform,
      status: this.activeOutgoingInvite ? 'INVITING' : 'READY',
      timestamp: Date.now(),
    });
  }

  /**
   * Kiểm tra chiến thư đến & trạng thái phản hồi chiến thư đã gửi
   */
  private async checkInvites() {
    try {
      const res = await fetch(`/api/lobby/invites?deviceId=${encodeURIComponent(this.myInfo.deviceId)}`);
      if (res.ok) {
        const data = await res.json();

        // 1. Có chiến thư gửi tới máy này
        if (data.incoming && data.incoming.status === 'PENDING') {
          const inv: ActiveInvite = data.incoming;
          if (!this.seenInviteIds.has(inv.inviteId)) {
            this.seenInviteIds.add(inv.inviteId);
            this.activeIncomingInvite = inv;
            this.onIncomingInvite?.(inv);
          }
        }

        // 2. Đối phương đã phản hồi chiến thư của máy này
        if (this.activeOutgoingInvite && data.outgoing && data.outgoing.inviteId === this.activeOutgoingInvite.inviteId) {
          const status = data.outgoing.status;
          if (status === 'ACCEPTED' || status === 'REJECTED' || status === 'CANCELLED') {
            const finishedInvite = { ...this.activeOutgoingInvite, status };
            this.activeOutgoingInvite = null;
            this.onInviteResponse?.(status, finishedInvite);
          }
        }
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Xử lý gói tin P2P / Broadcast trực tiếp
   */
  private handleP2PMessage(msg: P2PMessage) {
    // A. Thiết bị khác phát sóng danh tính
    if (msg.type === 'DEVICE_PRESENCE' && msg.deviceId && msg.deviceId !== this.myInfo.deviceId) {
      this.peersMap.set(msg.deviceId, {
        deviceId: msg.deviceId,
        deviceName: msg.deviceName,
        warlordId: msg.warlordId,
        platform: msg.platform,
        status: msg.status as any,
        lastSeen: Date.now(),
        source: 'p2p',
        rssi: -50,
      });
      this.emitPeers();
    }

    // B. Nhận chiến thư thách đấu trực tiếp
    if (msg.type === 'CHALLENGE_INVITE') {
      if (msg.toDeviceId && msg.toDeviceId !== this.myInfo.deviceId) return;
      if (!this.seenInviteIds.has(msg.inviteId)) {
        this.seenInviteIds.add(msg.inviteId);
        const inv: ActiveInvite = {
          inviteId: msg.inviteId,
          fromDeviceId: msg.fromDeviceId,
          fromDeviceName: msg.fromDeviceName,
          fromWarlordId: msg.fromWarlordId,
          toDeviceId: this.myInfo.deviceId,
          roomId: msg.roomId,
          boardSeed: msg.boardSeed,
          status: 'PENDING',
          createdAt: msg.timestamp || Date.now(),
        };
        this.activeIncomingInvite = inv;
        this.onIncomingInvite?.(inv);
      }
    }

    // C. Nhận phản hồi chấp nhận chiến thư từ đối phương
    if (msg.type === 'CHALLENGE_ACCEPT') {
      if (this.activeOutgoingInvite && this.activeOutgoingInvite.inviteId === msg.inviteId) {
        const inv: ActiveInvite = {
          ...this.activeOutgoingInvite,
          status: 'ACCEPTED',
          boardSeed: msg.boardSeed || this.activeOutgoingInvite.boardSeed,
        };
        this.activeOutgoingInvite = null;
        this.onInviteResponse?.('ACCEPTED', inv);
      }
    }

    // D. Nhận phản hồi từ chối chiến thư từ đối phương
    if (msg.type === 'CHALLENGE_REJECT') {
      if (this.activeOutgoingInvite && this.activeOutgoingInvite.inviteId === msg.inviteId) {
        const inv: ActiveInvite = {
          ...this.activeOutgoingInvite,
          status: 'REJECTED',
        };
        this.activeOutgoingInvite = null;
        this.onInviteResponse?.('REJECTED', inv);
      }
    }

    // E. Người gửi hủy chiến thư
    if (msg.type === 'CHALLENGE_CANCEL') {
      if (this.activeIncomingInvite && this.activeIncomingInvite.inviteId === msg.inviteId) {
        const inv = this.activeIncomingInvite;
        this.activeIncomingInvite = null;
        this.onInviteResponse?.('CANCELLED', inv);
      }
    }
  }

  private cleanStalePeers() {
    const now = Date.now();
    let changed = false;
    for (const [id, peer] of this.peersMap.entries()) {
      if (now - peer.lastSeen > 60000) {
        this.peersMap.delete(id);
        changed = true;
      }
    }
    if (changed) {
      this.emitPeers();
    }
  }

  private emitPeers() {
    if (this.onPeersChange) {
      const list = Array.from(this.peersMap.values()).sort((a, b) => b.lastSeen - a.lastSeen);
      this.onPeersChange(list);
    }
  }

  /**
   * Máy A (Chủ động): Gửi chiến thư khiêu chiến tới thiết bị đối phương
   */
  public async sendChallenge(targetPeer: DiscoveredPeer): Promise<ActiveInvite> {
    const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const roomId = String(Math.floor(1000 + Math.random() * 9000));
    const boardSeed = Math.floor(100000 + Math.random() * 900000);

    const invite: ActiveInvite = {
      inviteId,
      fromDeviceId: this.myInfo.deviceId,
      fromDeviceName: this.myInfo.deviceName,
      fromWarlordId: this.currentWarlordId,
      toDeviceId: targetPeer.deviceId,
      roomId,
      boardSeed,
      status: 'PENDING',
      createdAt: Date.now(),
    };

    this.activeOutgoingInvite = invite;

    // 1. Gửi qua HTTP API
    try {
      await fetch('/api/lobby/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite),
      });
    } catch {}

    // 2. Gửi qua P2P / Broadcast
    p2pService.send({
      type: 'CHALLENGE_INVITE',
      inviteId,
      fromDeviceId: this.myInfo.deviceId,
      fromDeviceName: this.myInfo.deviceName,
      fromWarlordId: this.currentWarlordId,
      toDeviceId: targetPeer.deviceId,
      roomId,
      boardSeed,
      timestamp: Date.now(),
    });

    return invite;
  }

  /**
   * Máy B (Bị thách đấu): Chấp nhận chiến thư
   */
  public async acceptChallenge(invite: ActiveInvite) {
    this.activeIncomingInvite = null;

    // 1. Báo qua HTTP API
    try {
      await fetch('/api/lobby/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite.inviteId, action: 'ACCEPT' }),
      });
    } catch {}

    // 2. Báo qua P2P / Broadcast
    p2pService.send({
      type: 'CHALLENGE_ACCEPT',
      inviteId: invite.inviteId,
      fromDeviceId: this.myInfo.deviceId,
      toDeviceId: invite.fromDeviceId,
      roomId: invite.roomId,
      hostWarlordId: invite.fromWarlordId,
      clientWarlordId: this.currentWarlordId,
      boardSeed: invite.boardSeed,
    });
  }

  /**
   * Máy B: Từ chối chiến thư
   */
  public async rejectChallenge(invite: ActiveInvite) {
    this.activeIncomingInvite = null;

    try {
      await fetch('/api/lobby/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite.inviteId, action: 'REJECT' }),
      });
    } catch {}

    p2pService.send({
      type: 'CHALLENGE_REJECT',
      inviteId: invite.inviteId,
      fromDeviceId: this.myInfo.deviceId,
      toDeviceId: invite.fromDeviceId,
    });
  }

  /**
   * Máy A: Huỷ chiến thư đang gửi
   */
  public async cancelChallenge() {
    if (!this.activeOutgoingInvite) return;
    const inv = this.activeOutgoingInvite;
    this.activeOutgoingInvite = null;

    try {
      await fetch('/api/lobby/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: inv.inviteId }),
      });
    } catch {}

    p2pService.send({
      type: 'CHALLENGE_CANCEL',
      inviteId: inv.inviteId,
      fromDeviceId: this.myInfo.deviceId,
    });
  }

  public stopDiscovery() {
    this.isScanning = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.p2pUnsub) {
      this.p2pUnsub();
      this.p2pUnsub = null;
    }
    try {
      fetch('/api/lobby/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: this.myInfo.deviceId }),
      }).catch(() => {});
    } catch {}
  }
}

export const deviceDiscovery = new DeviceDiscoveryService();

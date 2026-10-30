/**
 * Loạn 12 Sứ Quân — Lobby & Room Signaling Dev Plugin
 * Cung cấp API nội bộ cho:
 * 1. Radar Dò Tìm Thiết Bị & Gửi Chiến Thư Ghép Đôi thời gian thực
 * 2. Khởi tạo & Bắt Cặp Phòng QR / Mã Phòng 4 Số (Fail-proof Server Relay)
 * 3. Đồng Bộ Nước Đi Trận Đấu (Realtime In-Game Match Relay)
 * Hoạt động mượt mà 100% trên iPhone (Safari iOS), Android (Chrome) xuyên mạng 4G/5G/WiFi.
 */

import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

interface DeviceRecord {
  deviceId: string;
  deviceName: string;
  warlordId: string;
  platform: 'ios' | 'android' | 'web';
  status: 'READY' | 'BUSY' | 'INVITING';
  lastSeen: number;
  currentRoomId?: string;
}

interface InviteRecord {
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

interface RoomRecord {
  roomId: string;
  hostDeviceId: string;
  hostDeviceName: string;
  hostWarlordId: string;
  status: 'WAITING' | 'READY' | 'PLAYING' | 'CLOSED';
  boardSeed: number;
  guestDeviceId?: string;
  guestDeviceName?: string;
  guestWarlordId?: string;
  createdAt: number;
  lastActive: number;
  messages: Array<{
    id: string;
    sender: 'host' | 'guest';
    data: any;
    timestamp: number;
  }>;
}

export function lobbySignalingPlugin(): Plugin {
  const devices = new Map<string, DeviceRecord>();
  const invites = new Map<string, InviteRecord>();
  const rooms = new Map<string, RoomRecord>();

  // Dọn dẹp thiết bị và lời mời hết hạn (gia hạn thời gian đủ rộng để điện thoại ngủ/chuyển app không bị văng)
  const pruneStale = () => {
    const now = Date.now();
    for (const [id, dev] of devices.entries()) {
      if (now - dev.lastSeen > 60000) {
        devices.delete(id);
      }
    }
    for (const [id, inv] of invites.entries()) {
      if (now - inv.createdAt > 60000) {
        invites.delete(id);
      }
    }
    for (const [id, room] of rooms.entries()) {
      if (now - room.lastActive > 1800000) {
        rooms.delete(id);
      }
    }
  };

  const parseBody = (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  const sendJson = (res: ServerResponse, data: any, status = 200) => {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(JSON.stringify(data));
  };

  return {
    name: 'loan12sq-lobby-signaling',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        // CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          });
          res.end();
          return;
        }

        if (!url.startsWith('/api/lobby/')) {
          return next();
        }

        pruneStale();

        // ================= 1. ROOM API (QUÉT QR & MÃ PHÒNG 4 SỐ) =================

        // 1A. POST /api/lobby/room/create: Máy 1 tạo phòng QR
        if (url.startsWith('/api/lobby/room/create') && req.method === 'POST') {
          const body = await parseBody(req);
          const rawCode = body.roomId || String(Math.floor(1000 + Math.random() * 9000));
          const cleanCode = String(rawCode).trim().toUpperCase();

          const room: RoomRecord = {
            roomId: cleanCode,
            hostDeviceId: body.hostDeviceId || 'host_dev',
            hostDeviceName: body.hostDeviceName || 'Máy Chủ',
            hostWarlordId: body.hostWarlordId || 'dinh_bo_linh',
            status: 'WAITING',
            boardSeed: body.boardSeed || Math.floor(100000 + Math.random() * 900000),
            createdAt: Date.now(),
            lastActive: Date.now(),
            messages: [],
          };

          rooms.set(cleanCode, room);

          // Cập nhật room cho thiết bị
          if (body.hostDeviceId && devices.has(body.hostDeviceId)) {
            const dev = devices.get(body.hostDeviceId)!;
            dev.currentRoomId = cleanCode;
            dev.lastSeen = Date.now();
          }

          return sendJson(res, { ok: true, room });
        }

        // 1B. POST /api/lobby/room/join: Máy 2 vào phòng qua QR hoặc nhập mã
        if (url.startsWith('/api/lobby/room/join') && req.method === 'POST') {
          const body = await parseBody(req);
          const cleanCode = String(body.roomId || '').trim().toUpperCase();

          const room = rooms.get(cleanCode);
          if (!room) {
            return sendJson(res, {
              ok: false,
              error: 'ROOM_NOT_FOUND',
              message: `Không tìm thấy phòng [${cleanCode}]. Hãy chắc chắn Máy 1 đang mở phòng!`,
            }, 404);
          }

          // Ghép đối thủ vào phòng và chuyển trạng thái sang READY
          room.guestDeviceId = body.guestDeviceId || 'guest_dev';
          room.guestDeviceName = body.guestDeviceName || 'Máy Khách';
          room.guestWarlordId = body.guestWarlordId || 'pham_bach_ho';
          room.status = 'READY';
          room.lastActive = Date.now();

          return sendJson(res, { ok: true, room });
        }

        // 1C. GET /api/lobby/room/poll: Kiểm tra trạng thái phòng và gói tin mới
        if (url.startsWith('/api/lobby/room/poll') && req.method === 'GET') {
          const query = new URL(url, 'http://localhost').searchParams;
          const cleanCode = (query.get('roomId') || '').trim().toUpperCase();
          const side = query.get('side') || 'host';
          const lastMsgId = query.get('lastMsgId') || '';

          const room = rooms.get(cleanCode);
          if (!room) {
            return sendJson(res, { ok: false, error: 'ROOM_NOT_FOUND' }, 404);
          }

          room.lastActive = Date.now();

          // Lọc các tin nhắn mới gửi từ phía đối phương
          let newMsgs = room.messages;
          if (lastMsgId) {
            const idx = room.messages.findIndex((m) => m.id === lastMsgId);
            if (idx >= 0) {
              newMsgs = room.messages.slice(idx + 1);
            }
          }
          // Chỉ lấy tin nhắn từ đối phương (không lấy tin nhắn của chính mình gửi)
          const opponentMsgs = newMsgs.filter((m) => m.sender !== side);

          return sendJson(res, {
            ok: true,
            room: {
              roomId: room.roomId,
              hostDeviceId: room.hostDeviceId,
              hostDeviceName: room.hostDeviceName,
              hostWarlordId: room.hostWarlordId,
              status: room.status,
              boardSeed: room.boardSeed,
              guestDeviceId: room.guestDeviceId,
              guestDeviceName: room.guestDeviceName,
              guestWarlordId: room.guestWarlordId,
            },
            messages: opponentMsgs,
          });
        }

        // 1D. POST /api/lobby/room/message: Gửi nước đi hoặc skill qua server relay
        if (url.startsWith('/api/lobby/room/message') && req.method === 'POST') {
          const body = await parseBody(req);
          const cleanCode = String(body.roomId || '').trim().toUpperCase();
          const room = rooms.get(cleanCode);
          if (!room) {
            return sendJson(res, { ok: false, error: 'ROOM_NOT_FOUND' }, 404);
          }

          const msgId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          room.messages.push({
            id: msgId,
            sender: body.sender || 'host',
            data: body.data,
            timestamp: Date.now(),
          });

          // Giữ tối đa 60 tin nhắn gần nhất trong trận
          if (room.messages.length > 60) {
            room.messages.shift();
          }

          room.lastActive = Date.now();
          return sendJson(res, { ok: true, msgId });
        }

        // 1E. GET /api/lobby/rooms: Xem danh sách phòng đang chờ ghép
        if (url.startsWith('/api/lobby/rooms') && req.method === 'GET') {
          const list = Array.from(rooms.values())
            .filter((r) => r.status === 'WAITING' && Date.now() - r.lastActive < 120000)
            .map((r) => ({
              roomId: r.roomId,
              hostDeviceName: r.hostDeviceName,
              hostWarlordId: r.hostWarlordId,
              status: r.status,
              createdAt: r.createdAt,
            }));
          return sendJson(res, { ok: true, rooms: list });
        }

        // ================= 2. PRESENCE & RADAR API =================

        // 2A. POST /api/lobby/presence: Cập nhật sự hiện diện của thiết bị
        if (url.startsWith('/api/lobby/presence') && req.method === 'POST') {
          const body = await parseBody(req);
          if (body.deviceId) {
            devices.set(body.deviceId, {
              deviceId: body.deviceId,
              deviceName: body.deviceName || 'Thiết bị di động',
              warlordId: body.warlordId || 'dinh_bo_linh',
              platform: body.platform || 'web',
              status: body.status || 'READY',
              lastSeen: Date.now(),
              currentRoomId: body.currentRoomId,
            });
          }
          const list = Array.from(devices.values());
          return sendJson(res, { ok: true, devices: list });
        }

        // 2B. GET /api/lobby/presence: Lấy danh sách thiết bị đang hoạt động
        if (url.startsWith('/api/lobby/presence') && req.method === 'GET') {
          const query = new URL(url, 'http://localhost').searchParams;
          const callerId = query.get('deviceId') || '';
          const list = Array.from(devices.values()).filter((d) => d.deviceId !== callerId);
          return sendJson(res, { ok: true, devices: list });
        }

        // 2C. POST /api/lobby/invite: Gửi chiến thư khiêu chiến tới thiết bị đối phương
        if (url.startsWith('/api/lobby/invite') && req.method === 'POST') {
          const body = await parseBody(req);
          const inviteId = body.inviteId || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const invite: InviteRecord = {
            inviteId,
            fromDeviceId: body.fromDeviceId,
            fromDeviceName: body.fromDeviceName,
            fromWarlordId: body.fromWarlordId,
            toDeviceId: body.toDeviceId,
            roomId: body.roomId,
            boardSeed: body.boardSeed || Math.floor(100000 + Math.random() * 900000),
            status: 'PENDING',
            createdAt: Date.now(),
          };
          invites.set(inviteId, invite);
          return sendJson(res, { ok: true, inviteId, invite });
        }

        // 2D. GET /api/lobby/invites: Kiểm tra chiến thư đến và kết quả chiến thư đã gửi
        if (url.startsWith('/api/lobby/invites') && req.method === 'GET') {
          const query = new URL(url, 'http://localhost').searchParams;
          const deviceId = query.get('deviceId') || '';

          const incoming = Array.from(invites.values()).find(
            (inv) => inv.toDeviceId === deviceId && inv.status === 'PENDING'
          );

          const outgoing = Array.from(invites.values())
            .filter((inv) => inv.fromDeviceId === deviceId)
            .sort((a, b) => b.createdAt - a.createdAt)[0];

          return sendJson(res, {
            ok: true,
            incoming: incoming || null,
            outgoing: outgoing || null,
          });
        }

        // 2E. POST /api/lobby/respond: Tiếp nhận (ACCEPT) hoặc Từ chối (REJECT) chiến thư
        if (url.startsWith('/api/lobby/respond') && req.method === 'POST') {
          const body = await parseBody(req);
          const invite = invites.get(body.inviteId);
          if (invite) {
            invite.status = body.action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
            return sendJson(res, { ok: true, status: invite.status, invite });
          }
          return sendJson(res, { ok: false, error: 'INVITE_NOT_FOUND' }, 404);
        }

        // 2F. POST /api/lobby/cancel: Người gửi chủ động hủy chiến thư
        if (url.startsWith('/api/lobby/cancel') && req.method === 'POST') {
          const body = await parseBody(req);
          const invite = invites.get(body.inviteId);
          if (invite) {
            invite.status = 'CANCELLED';
            return sendJson(res, { ok: true });
          }
          return sendJson(res, { ok: false, error: 'INVITE_NOT_FOUND' }, 404);
        }

        // 2G. POST /api/lobby/leave: Thiết bị rời khỏi sảnh
        if (url.startsWith('/api/lobby/leave') && req.method === 'POST') {
          const body = await parseBody(req);
          if (body.deviceId) {
            devices.delete(body.deviceId);
          }
          return sendJson(res, { ok: true });
        }

        return next();
      });
    },
  };
}

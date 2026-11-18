// Realtime transport for live classes (chat + WebRTC signaling) WITHOUT a hosted backend.
//
// Transports (in priority order):
//  1. Spring Boot WebSocket backend — only when VITE_USE_BACKEND=true and VITE_API_WS_URL is set.
//  2. Public MQTT-over-WebSocket broker (cross-device) — default, configurable via VITE_MQTT_URL.
//     Set VITE_MQTT_URL=off to disable.
//  3. BroadcastChannel — always on; syncs tabs within the same browser (works fully offline).
//
// `openRoomSocket(room)` returns an object that behaves like a browser WebSocket
// (readyState, send, close, onopen, onmessage, onclose, onerror), so pages can use it
// as a drop-in replacement. Like the old backend, every message sent is echoed back to
// the sender with an `id` assigned.

const env = import.meta.env;
const USE_BACKEND_WS = env.VITE_USE_BACKEND === 'true' && !!env.VITE_API_WS_URL;
const MQTT_URL = (env.VITE_MQTT_URL ?? 'wss://broker.emqx.io:8084/mqtt').trim();
const MQTT_ENABLED = MQTT_URL !== '' && MQTT_URL.toLowerCase() !== 'off';
const NAMESPACE = (env.VITE_REALTIME_NAMESPACE || 'mytutor-divine-university').replace(/[^a-zA-Z0-9_-]/g, '_');
const BASE_TOPIC = `mytutor/${NAMESPACE}`;

const OPEN = 1;
const CLOSED = 3;
const SESSION_STALE_MS = 3 * 60 * 1000;
const SESSION_HEARTBEAT_MS = 60 * 1000;

export const safeSegment = (s) => String(s ?? '').replace(/[^a-zA-Z0-9_-]/g, '_') || '_';
const randomId = () => Math.random().toString(36).slice(2, 12);
const newMessageId = () => Date.now() * 1000 + Math.floor(Math.random() * 1000);

export const realtimeMode = USE_BACKEND_WS ? 'backend' : (MQTT_ENABLED ? 'mqtt' : 'local');

export function describeRealtime() {
  if (USE_BACKEND_WS) return `Backend WebSocket • ${env.VITE_API_WS_URL}`;
  if (MQTT_ENABLED) return `Serverless relay • ${MQTT_URL.replace(/^wss?:\/\//, '').split('/')[0]}`;
  return 'Local browser channel (same device only)';
}

// ==========================================
// Minimal MQTT 3.1.1 client over WebSocket (QoS 0 only)
// ==========================================
const enc = new TextEncoder();
const dec = new TextDecoder();

function concat(parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

function encodeString(s) {
  const b = enc.encode(s);
  return concat([Uint8Array.from([b.length >> 8, b.length & 0xff]), b]);
}

function encodeLength(n) {
  const bytes = [];
  do {
    let d = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) d |= 0x80;
    bytes.push(d);
  } while (n > 0);
  return bytes;
}

function packet(firstByte, ...parts) {
  const body = concat(parts);
  return concat([Uint8Array.from([firstByte, ...encodeLength(body.length)]), body]);
}

function topicMatches(filter, topic) {
  const f = filter.split('/');
  const t = topic.split('/');
  for (let i = 0; i < f.length; i++) {
    if (f[i] === '#') return true;
    if (i >= t.length) return false;
    if (f[i] !== '+' && f[i] !== t[i]) return false;
  }
  return f.length === t.length;
}

class MiniMqtt {
  constructor(url) {
    this.url = url;
    this.handlers = new Map(); // filter -> Set<callback>
    this.queue = [];
    this.connected = false;
    this.buffer = new Uint8Array(0);
    this.nextPacketId = 1;
    this.retry = 0;
    this.connect();
  }

  connect() {
    let ws;
    try {
      ws = new WebSocket(this.url, 'mqtt');
    } catch (err) {
      console.warn('Realtime relay unavailable:', err.message);
      this.scheduleReconnect();
      return;
    }
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    this.buffer = new Uint8Array(0);

    ws.onopen = () => {
      const clientId = 'mytutor_' + randomId();
      const variableHeader = concat([encodeString('MQTT'), Uint8Array.from([4, 0x02, 0, 60])]);
      ws.send(packet(0x10, variableHeader, encodeString(clientId)));
    };
    ws.onmessage = (e) => this.onData(new Uint8Array(e.data));
    ws.onclose = () => {
      this.connected = false;
      clearInterval(this.pingTimer);
      this.scheduleReconnect();
    };
    ws.onerror = () => { /* onclose handles reconnect */ };
  }

  scheduleReconnect() {
    const delay = Math.min(30000, 1000 * 2 ** this.retry++);
    setTimeout(() => this.connect(), delay);
  }

  onData(chunk) {
    this.buffer = concat([this.buffer, chunk]);
    for (;;) {
      const buf = this.buffer;
      if (buf.length < 2) return;
      let len = 0, mult = 1, i = 1, byte;
      do {
        if (i >= buf.length) return; // incomplete length
        byte = buf[i++];
        len += (byte & 0x7f) * mult;
        mult *= 128;
      } while (byte & 0x80);
      if (buf.length < i + len) return; // incomplete packet
      this.handlePacket(buf[0], buf.subarray(i, i + len));
      this.buffer = buf.slice(i + len);
    }
  }

  handlePacket(first, body) {
    const type = first >> 4;
    if (type === 2) { // CONNACK
      if (body[1] !== 0) {
        console.warn('Realtime relay refused connection, code', body[1]);
        return;
      }
      this.connected = true;
      this.retry = 0;
      for (const filter of this.handlers.keys()) this.sendSubscribe(filter);
      const pending = this.queue;
      this.queue = [];
      pending.forEach(p => this.raw(p));
      clearInterval(this.pingTimer);
      this.pingTimer = setInterval(() => this.raw(Uint8Array.from([0xc0, 0])), 30000);
    } else if (type === 3) { // PUBLISH
      const qos = (first >> 1) & 0x03;
      const topicLen = (body[0] << 8) | body[1];
      const topic = dec.decode(body.subarray(2, 2 + topicLen));
      let off = 2 + topicLen;
      if (qos > 0) off += 2;
      const payload = dec.decode(body.subarray(off));
      for (const [filter, callbacks] of this.handlers) {
        if (topicMatches(filter, topic)) {
          callbacks.forEach(cb => {
            try { cb(payload, topic); } catch (err) { console.error(err); }
          });
        }
      }
    }
    // SUBACK / UNSUBACK / PINGRESP need no handling
  }

  raw(bytes) {
    try { this.ws.send(bytes); } catch { /* socket closed; will reconnect */ }
  }

  packetId() {
    const id = this.nextPacketId;
    this.nextPacketId = (this.nextPacketId % 65535) + 1;
    return Uint8Array.from([id >> 8, id & 0xff]);
  }

  sendSubscribe(filter) {
    this.raw(packet(0x82, this.packetId(), encodeString(filter), Uint8Array.from([0])));
  }

  subscribe(filter, cb) {
    if (!this.handlers.has(filter)) {
      this.handlers.set(filter, new Set());
      if (this.connected) this.sendSubscribe(filter);
    }
    this.handlers.get(filter).add(cb);
    return () => {
      const set = this.handlers.get(filter);
      if (!set) return;
      set.delete(cb);
      if (set.size === 0) {
        this.handlers.delete(filter);
        if (this.connected) this.raw(packet(0xa2, this.packetId(), encodeString(filter)));
      }
    };
  }

  publish(topic, payload, retain = false) {
    const pkt = packet(0x30 | (retain ? 1 : 0), encodeString(topic), enc.encode(payload));
    if (this.connected) this.raw(pkt);
    else this.queue.push(pkt);
  }
}

let mqttClient = null;
function getMqtt() {
  if (!MQTT_ENABLED || USE_BACKEND_WS || typeof WebSocket === 'undefined') return null;
  if (!mqttClient) mqttClient = new MiniMqtt(MQTT_URL);
  return mqttClient;
}

function makeChannel(name) {
  return typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(name) : null;
}

// ==========================================
// WebSocket-compatible room socket
// ==========================================
class RoomSocket {
  constructor(room) {
    this.room = room;
    this.readyState = 0;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.origin = randomId();
    this.seen = new Set();
    this.topic = `${BASE_TOPIC}/room/${safeSegment(room)}`;

    this.channel = makeChannel(this.topic);
    if (this.channel) this.channel.onmessage = (e) => this.deliver(e.data);

    const mqtt = getMqtt();
    if (mqtt) {
      this.unsubscribe = mqtt.subscribe(this.topic, (payload) => {
        try { this.deliver(JSON.parse(payload)); } catch { /* ignore malformed */ }
      });
    }

    setTimeout(() => {
      if (this.readyState === 0) {
        this.readyState = OPEN;
        if (this.onopen) this.onopen({ type: 'open' });
      }
    }, 0);
  }

  send(data) {
    if (this.readyState !== OPEN) return;
    const msg = typeof data === 'string' ? JSON.parse(data) : { ...data };
    if (msg.id == null) msg.id = newMessageId();
    if (!msg.timestamp) {
      msg.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const envelope = { ...msg, _origin: this.origin };
    // Echo back to the sender (matches old backend behaviour)
    queueMicrotask(() => this.deliver(envelope));
    if (this.channel) this.channel.postMessage(envelope);
    const mqtt = getMqtt();
    if (mqtt) mqtt.publish(this.topic, JSON.stringify(envelope));
  }

  deliver(envelope) {
    if (this.readyState !== OPEN || !envelope || typeof envelope !== 'object') return;
    const key = `${envelope._origin}:${envelope.id}`;
    if (this.seen.has(key)) return;
    this.seen.add(key);
    const msg = { ...envelope };
    delete msg._origin;
    if (this.onmessage) this.onmessage({ data: JSON.stringify(msg) });
  }

  close() {
    if (this.readyState === CLOSED) return;
    this.readyState = CLOSED;
    if (this.channel) this.channel.close();
    if (this.unsubscribe) this.unsubscribe();
    setTimeout(() => {
      if (this.onclose) this.onclose({ type: 'close', reason: 'closed' });
    }, 0);
  }
}

export function openRoomSocket(room) {
  if (USE_BACKEND_WS) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return new WebSocket(`${wsProtocol}//${env.VITE_API_WS_URL}/chat?room=${encodeURIComponent(room)}`);
  }
  return new RoomSocket(room);
}

// ==========================================
// Live session discovery (so students on other devices see a lecturer's live class)
// ==========================================
const SESSIONS_CHANNEL = `${BASE_TOPIC}/sessions`;
let sessionsChannel = null;
const getSessionsChannel = () => {
  if (!sessionsChannel) sessionsChannel = makeChannel(SESSIONS_CHANNEL);
  return sessionsChannel;
};

function publishSession(module, payload) {
  const ch = getSessionsChannel();
  if (ch) ch.postMessage({ module, payload });
  const mqtt = getMqtt();
  if (mqtt) mqtt.publish(`${SESSIONS_CHANNEL}/${safeSegment(module)}`, payload, true);
}

// Announces a live session. Returns a stop() function that clears the announcement.
export function announceLiveSession(session) {
  if (!session || !session.module) return () => {};
  const send = () => publishSession(session.module, JSON.stringify({ ...session, status: 'Live', announcedAt: Date.now() }));
  send();
  const timer = setInterval(send, SESSION_HEARTBEAT_MS);
  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    publishSession(session.module, ''); // empty retained message clears it
  };
}

// cb(moduleCode, sessionOrNull)
export function subscribeLiveSessions(cb) {
  const handle = (module, payload) => {
    if (!payload) { cb(module, null); return; }
    try {
      const session = JSON.parse(payload);
      if (Date.now() - (session.announcedAt || 0) > SESSION_STALE_MS) { cb(module, null); return; }
      cb(module, { ...session, remote: true });
    } catch { /* ignore */ }
  };

  const listener = (e) => e.data && handle(e.data.module, e.data.payload);
  const ch = makeChannel(SESSIONS_CHANNEL);
  if (ch) ch.onmessage = listener;

  const mqtt = getMqtt();
  const unsubscribe = mqtt
    ? mqtt.subscribe(`${SESSIONS_CHANNEL}/+`, (payload, topic) => {
        try {
          const parsed = payload ? JSON.parse(payload) : null;
          handle(parsed?.module || topic.split('/').pop(), payload);
        } catch { /* ignore */ }
      })
    : null;

  return () => {
    if (ch) ch.close();
    if (unsubscribe) unsubscribe();
  };
}

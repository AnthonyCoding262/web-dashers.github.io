/*
 * Browser implementation of the public Geometry Dash Replay Format.
 * GDR2 layout follows https://github.com/maxnut/GDReplayFormat/tree/gdr2
 * Legacy GDR1 files use the format's MessagePack representation.
 */
(function () {
  "use strict";

  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();

  class BinaryWriter {
    constructor() {
      this.data = [];
    }

    byte(value) {
      this.data.push(value & 0xff);
    }

    bytes(values) {
      for (const value of values) this.byte(value);
    }

    ascii(value) {
      this.bytes(textEncoder.encode(value));
    }

    varint(value) {
      let remaining = BigInt(Math.max(0, Math.trunc(Number(value) || 0)));
      do {
        let byte = Number(remaining & 0x7fn);
        remaining >>= 7n;
        if (remaining) byte |= 0x80;
        this.byte(byte);
      } while (remaining);
    }

    string(value) {
      const bytes = textEncoder.encode(String(value ?? ""));
      this.varint(bytes.length);
      this.bytes(bytes);
    }

    bool(value) {
      this.byte(value ? 1 : 0);
    }

    float32(value) {
      const buffer = new ArrayBuffer(4);
      new DataView(buffer).setFloat32(0, Number(value) || 0, false);
      this.bytes(new Uint8Array(buffer));
    }

    float64(value) {
      const buffer = new ArrayBuffer(8);
      new DataView(buffer).setFloat64(0, Number(value) || 0, false);
      this.bytes(new Uint8Array(buffer));
    }

    finish() {
      return new Uint8Array(this.data);
    }
  }

  class BinaryReader {
    constructor(data) {
      this.data = data instanceof Uint8Array ? data : new Uint8Array(data);
      this.offset = 0;
    }

    get remaining() {
      return this.data.length - this.offset;
    }

    require(size) {
      if (this.remaining < size) throw new Error("Unexpected end of replay file");
    }

    byte() {
      this.require(1);
      return this.data[this.offset++];
    }

    bytes(size) {
      this.require(size);
      const result = this.data.slice(this.offset, this.offset + size);
      this.offset += size;
      return result;
    }

    varint() {
      let value = 0n;
      let shift = 0n;
      for (let index = 0; index < 10; index++) {
        const byte = this.byte();
        value |= BigInt(byte & 0x7f) << shift;
        if (!(byte & 0x80)) {
          const number = Number(value);
          if (!Number.isSafeInteger(number)) throw new Error("Replay integer is too large");
          return number;
        }
        shift += 7n;
      }
      throw new Error("Invalid replay varint");
    }

    string() {
      return textDecoder.decode(this.bytes(this.varint()));
    }

    bool() {
      return this.byte() !== 0;
    }

    float32() {
      const bytes = this.bytes(4);
      return new DataView(bytes.buffer, bytes.byteOffset, 4).getFloat32(0, false);
    }

    float64() {
      const bytes = this.bytes(8);
      return new DataView(bytes.buffer, bytes.byteOffset, 8).getFloat64(0, false);
    }
  }

  const normalizeInputs = inputs => (Array.isArray(inputs) ? inputs : [])
    .map(input => ({
      frame: Math.max(0, Math.trunc(Number(input?.frame) || 0)),
      button: Math.max(1, Math.min(3, Math.trunc(Number(input?.button ?? input?.btn) || 1))),
      player2: !!(input?.player2 ?? input?.["2p"]),
      down: !!input?.down
    }))
    .sort((a, b) => a.frame - b.frame);

  function encodeGDR2(replay) {
    const writer = new BinaryWriter();
    const inputs = normalizeInputs(replay.inputs);
    const platformer = !!replay.platformer;
    const p1 = inputs.filter(input => !input.player2);
    const p2 = inputs.filter(input => input.player2);
    const deaths = (Array.isArray(replay.deaths) ? replay.deaths : [])
      .map(frame => Math.max(0, Math.trunc(Number(frame) || 0)))
      .sort((a, b) => a - b);

    writer.ascii("GDR");
    writer.varint(2);
    writer.string("");
    writer.string(replay.author || "");
    writer.string(replay.description || "");
    writer.float32(replay.duration || 0);
    writer.varint(replay.gameVersion || 22074);
    writer.float64(replay.framerate || 60);
    writer.varint(replay.seed || 0);
    writer.varint(replay.coins || 0);
    writer.bool(replay.ldm);
    writer.bool(platformer);
    writer.string(replay.bot?.name || "Web Dashers");
    writer.varint(replay.bot?.version || 1);
    writer.varint(replay.level?.id || 0);
    writer.string(replay.level?.name || "");
    writer.varint(0);

    writer.varint(deaths.length);
    let previous = 0;
    for (const frame of deaths) {
      writer.varint(frame - previous);
      previous = frame;
    }

    writer.varint(inputs.length);
    writer.varint(p1.length);
    for (const playerInputs of [p1, p2]) {
      previous = 0;
      for (const input of playerInputs) {
        const delta = input.frame - previous;
        const packed = platformer
          ? (delta * 8) + (input.button * 2) + Number(input.down)
          : (delta * 2) + Number(input.down);
        writer.varint(packed);
        previous = input.frame;
      }
    }
    return writer.finish();
  }

  function decodeGDR2(data) {
    const reader = new BinaryReader(data);
    if (textDecoder.decode(reader.bytes(3)) !== "GDR") throw new Error("Invalid GDR2 header");
    const version = reader.varint();
    if (version < 2) throw new Error(`Unsupported GDR version ${version}`);
    const inputTag = reader.string();
    const replay = {
      format: "gdr2",
      version,
      author: reader.string(),
      description: reader.string(),
      duration: reader.float32(),
      gameVersion: reader.varint(),
      framerate: reader.float64(),
      seed: reader.varint(),
      coins: reader.varint(),
      ldm: reader.bool(),
      platformer: reader.bool(),
      bot: { name: reader.string(), version: reader.varint() },
      level: { id: reader.varint(), name: reader.string() },
      deaths: [],
      inputs: []
    };

    reader.bytes(reader.varint());
    const deathCount = reader.varint();
    let deathFrame = 0;
    for (let index = 0; index < deathCount; index++) {
      deathFrame += reader.varint();
      replay.deaths.push(deathFrame);
    }

    const inputCount = reader.varint();
    const p1Count = reader.varint();
    let p1Frame = 0;
    let p2Frame = 0;
    for (let index = 0; index < inputCount; index++) {
      const player2 = index >= p1Count;
      const packed = reader.varint();
      const down = !!(packed & 1);
      const delta = Math.floor(packed / (replay.platformer ? 8 : 2));
      const button = replay.platformer ? ((packed >> 1) & 3) : 1;
      const frame = player2 ? (p2Frame += delta) : (p1Frame += delta);
      replay.inputs.push({ frame, button: button || 1, player2, down });
      if (inputTag) reader.bytes(reader.varint());
    }
    replay.inputs.sort((a, b) => a.frame - b.frame);
    return replay;
  }

  const pushU16 = (out, value) => out.push((value >>> 8) & 0xff, value & 0xff);
  const pushU32 = (out, value) => out.push((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
  const pushFloat = (out, value, size) => {
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    if (size === 4) view.setFloat32(0, value, false);
    else view.setFloat64(0, value, false);
    out.push(...new Uint8Array(buffer));
  };

  function encodeMessagePackValue(value, out) {
    if (value === null || value === undefined) {
      out.push(0xc0);
    } else if (value === false) {
      out.push(0xc2);
    } else if (value === true) {
      out.push(0xc3);
    } else if (typeof value === "number") {
      if (!Number.isInteger(value)) {
        out.push(0xcb);
        pushFloat(out, value, 8);
      } else if (value >= 0 && value <= 0x7f) {
        out.push(value);
      } else if (value >= 0 && value <= 0xff) {
        out.push(0xcc, value);
      } else if (value >= 0 && value <= 0xffff) {
        out.push(0xcd);
        pushU16(out, value);
      } else if (value >= 0 && value <= 0xffffffff) {
        out.push(0xce);
        pushU32(out, value);
      } else if (value >= -32 && value < 0) {
        out.push(0x100 + value);
      } else if (value >= -128) {
        out.push(0xd0, value & 0xff);
      } else if (value >= -32768) {
        out.push(0xd1);
        pushU16(out, value & 0xffff);
      } else {
        out.push(0xd2);
        pushU32(out, value >>> 0);
      }
    } else if (typeof value === "string") {
      const bytes = textEncoder.encode(value);
      if (bytes.length <= 31) out.push(0xa0 | bytes.length);
      else if (bytes.length <= 0xff) out.push(0xd9, bytes.length);
      else if (bytes.length <= 0xffff) { out.push(0xda); pushU16(out, bytes.length); }
      else { out.push(0xdb); pushU32(out, bytes.length); }
      out.push(...bytes);
    } else if (Array.isArray(value)) {
      if (value.length <= 15) out.push(0x90 | value.length);
      else if (value.length <= 0xffff) { out.push(0xdc); pushU16(out, value.length); }
      else { out.push(0xdd); pushU32(out, value.length); }
      value.forEach(item => encodeMessagePackValue(item, out));
    } else {
      const entries = Object.entries(value);
      if (entries.length <= 15) out.push(0x80 | entries.length);
      else if (entries.length <= 0xffff) { out.push(0xde); pushU16(out, entries.length); }
      else { out.push(0xdf); pushU32(out, entries.length); }
      entries.forEach(([key, item]) => {
        encodeMessagePackValue(key, out);
        encodeMessagePackValue(item, out);
      });
    }
  }

  class MessagePackReader extends BinaryReader {
    uint16() {
      const bytes = this.bytes(2);
      return new DataView(bytes.buffer, bytes.byteOffset, 2).getUint16(0, false);
    }

    uint32() {
      const bytes = this.bytes(4);
      return new DataView(bytes.buffer, bytes.byteOffset, 4).getUint32(0, false);
    }

    signed(size) {
      const bytes = this.bytes(size);
      const view = new DataView(bytes.buffer, bytes.byteOffset, size);
      return size === 1 ? view.getInt8(0) : size === 2 ? view.getInt16(0, false) : view.getInt32(0, false);
    }

    value() {
      const tag = this.byte();
      if (tag <= 0x7f) return tag;
      if (tag >= 0xe0) return tag - 0x100;
      if ((tag & 0xe0) === 0xa0) return textDecoder.decode(this.bytes(tag & 0x1f));
      if ((tag & 0xf0) === 0x90) return this.array(tag & 0x0f);
      if ((tag & 0xf0) === 0x80) return this.map(tag & 0x0f);
      switch (tag) {
        case 0xc0: return null;
        case 0xc2: return false;
        case 0xc3: return true;
        case 0xc4: return this.bytes(this.byte());
        case 0xc5: return this.bytes(this.uint16());
        case 0xc6: return this.bytes(this.uint32());
        case 0xca: return this.float32();
        case 0xcb: return this.float64();
        case 0xcc: return this.byte();
        case 0xcd: return this.uint16();
        case 0xce: return this.uint32();
        case 0xcf: {
          const high = this.uint32();
          const low = this.uint32();
          const result = (high * 0x100000000) + low;
          if (!Number.isSafeInteger(result)) throw new Error("GDR1 integer is too large");
          return result;
        }
        case 0xd0: return this.signed(1);
        case 0xd1: return this.signed(2);
        case 0xd2: return this.signed(4);
        case 0xd9: return textDecoder.decode(this.bytes(this.byte()));
        case 0xda: return textDecoder.decode(this.bytes(this.uint16()));
        case 0xdb: return textDecoder.decode(this.bytes(this.uint32()));
        case 0xdc: return this.array(this.uint16());
        case 0xdd: return this.array(this.uint32());
        case 0xde: return this.map(this.uint16());
        case 0xdf: return this.map(this.uint32());
        default: throw new Error(`Unsupported MessagePack value 0x${tag.toString(16)}`);
      }
    }

    array(length) {
      return Array.from({ length }, () => this.value());
    }

    map(length) {
      const result = {};
      for (let index = 0; index < length; index++) result[String(this.value())] = this.value();
      return result;
    }
  }

  function toLegacyReplay(replay) {
    return {
      gameVersion: Number(replay.gameVersionLegacy ?? 2.2074),
      description: replay.description || "",
      version: 1,
      duration: Number(replay.duration) || 0,
      bot: { name: replay.bot?.name || "Web Dashers", version: String(replay.bot?.version || 1) },
      level: { id: Number(replay.level?.id) || 0, name: replay.level?.name || "" },
      author: replay.author || "",
      seed: Number(replay.seed) || 0,
      coins: Number(replay.coins) || 0,
      ldm: !!replay.ldm,
      framerate: Number(replay.framerate) || 60,
      inputs: normalizeInputs(replay.inputs).map(input => ({
        frame: input.frame,
        btn: input.button,
        "2p": input.player2,
        down: input.down
      }))
    };
  }

  function encodeGDR1(replay) {
    const output = [];
    encodeMessagePackValue(toLegacyReplay(replay), output);
    return new Uint8Array(output);
  }

  function decodeGDR1(data) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    let raw;
    const prefix = textDecoder.decode(bytes.slice(0, Math.min(bytes.length, 32))).trimStart();
    if (prefix.startsWith("{")) raw = JSON.parse(textDecoder.decode(bytes));
    else raw = new MessagePackReader(bytes).value();
    if (!raw || typeof raw !== "object") throw new Error("Invalid GDR1 replay");
    return {
      format: "gdr",
      version: Number(raw.version) || 1,
      author: raw.author || "",
      description: raw.description || "",
      duration: Number(raw.duration) || 0,
      gameVersion: Number(raw.gameVersion) || 0,
      framerate: Number(raw.framerate) || 240,
      seed: Number(raw.seed) || 0,
      coins: Number(raw.coins) || 0,
      ldm: !!raw.ldm,
      platformer: !!raw.platformer,
      bot: raw.bot || raw.botInfo || {},
      level: raw.level || raw.levelInfo || {},
      deaths: Array.isArray(raw.deaths) ? raw.deaths : [],
      inputs: normalizeInputs(raw.inputs)
    };
  }

  function decode(data) {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    if (bytes.length >= 3 && textDecoder.decode(bytes.slice(0, 3)) === "GDR") return decodeGDR2(bytes);
    return decodeGDR1(bytes);
  }

  window.GDRCodec = Object.freeze({ encodeGDR1, encodeGDR2, decodeGDR1, decodeGDR2, decode, normalizeInputs });
})();

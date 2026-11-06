/**
 * The two messages the backend's gRPC bridge replies with, decoded by hand.
 * Field numbers must match grpc/foodmood.proto one to one; the tests use the
 * bytes produced by the backend's own encoder, so a drift fails loudly.
 */

const STATUS_SERVICE = "foodmood-ia-backend";

const STATUS = { service: 1, version: 2, aiProvider: 3, uptimeSeconds: 4, dishes: 5, moods: 6 } as const;
const DISH = { id: 1, slug: 2, nameEs: 3, category: 4, prepMinutes: 5, calories: 6, difficulty: 7 } as const;

const WIRE_VARINT = 0;
const WIRE_LENGTH_DELIMITED = 2;

export interface GrpcStatusReply {
  service: string;
  version: string;
  aiProvider: string;
  uptimeSeconds: number;
  dishes: number;
  moods: number;
}

export interface GrpcDishReply {
  id: number;
  slug: string;
  nameEs: string;
  category: string;
  prepMinutes: number;
  calories: number;
  difficulty: string;
}

/** GetDish request: `DishRequest { int32 id = 1 }`. */
export function encodeDishRequest(id: number): Uint8Array {
  return new Uint8Array([...encodeVarint(1 * 8 + 0), ...encodeVarint(id)]);
}

export function readVarint(bytes: Uint8Array, offset: number): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  let cursor = offset;
  while (cursor < bytes.length) {
    const byte = bytes[cursor++];
    value += (byte & 0x7f) * 2 ** shift;
    if ((byte & 0x80) === 0) return { value, offset: cursor };
    shift += 7;
    if (shift > 49) throw new Error("varint demasiado largo");
  }
  throw new Error("varint incompleto");
}

export function encodeVarint(value: number): number[] {
  const bytes: number[] = [];
  let rest = Math.max(0, Math.floor(value));
  while (rest >= 0x80) {
    bytes.push((rest % 0x80) | 0x80);
    rest = Math.floor(rest / 0x80);
  }
  bytes.push(rest);
  return bytes;
}

/** Walks the protobuf fields and hands each one to `visit`. */
function eachField(
  bytes: Uint8Array,
  visit: (field: number, read: { varint: () => number; bytes: () => Uint8Array }) => void,
): void {
  let cursor = 0;
  while (cursor < bytes.length) {
    const header = readVarint(bytes, cursor);
    const field = header.value >>> 3;
    const wire = header.value & 0x7;
    cursor = header.offset;

    if (wire === WIRE_VARINT) {
      const value = readVarint(bytes, cursor);
      cursor = value.offset;
      visit(field, { varint: () => value.value, bytes: () => new Uint8Array() });
    } else if (wire === WIRE_LENGTH_DELIMITED) {
      const length = readVarint(bytes, cursor);
      cursor = length.offset;
      const payload = bytes.subarray(cursor, cursor + length.value);
      cursor += length.value;
      visit(field, { varint: () => length.value, bytes: () => payload });
    } else if (wire === 5) {
      cursor += 4;
    } else if (wire === 1) {
      cursor += 8;
    } else {
      throw new Error(`wire type desconocido: ${wire}`);
    }
  }
}

function toText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function decodeStatusReply(bytes: Uint8Array): GrpcStatusReply {
  const reply: GrpcStatusReply = {
    service: "",
    version: "",
    aiProvider: "",
    uptimeSeconds: 0,
    dishes: 0,
    moods: 0,
  };
  eachField(bytes, (field, read) => {
    if (field === STATUS.service) reply.service = toText(read.bytes());
    else if (field === STATUS.version) reply.version = toText(read.bytes());
    else if (field === STATUS.aiProvider) reply.aiProvider = toText(read.bytes());
    else if (field === STATUS.uptimeSeconds) reply.uptimeSeconds = read.varint();
    else if (field === STATUS.dishes) reply.dishes = read.varint();
    else if (field === STATUS.moods) reply.moods = read.varint();
  });
  return reply;
}

export function decodeDishReply(bytes: Uint8Array): GrpcDishReply {
  const reply: GrpcDishReply = {
    id: 0,
    slug: "",
    nameEs: "",
    category: "",
    prepMinutes: 0,
    calories: 0,
    difficulty: "",
  };
  eachField(bytes, (field, read) => {
    if (field === DISH.id) reply.id = read.varint();
    else if (field === DISH.slug) reply.slug = toText(read.bytes());
    else if (field === DISH.nameEs) reply.nameEs = toText(read.bytes());
    else if (field === DISH.category) reply.category = toText(read.bytes());
    else if (field === DISH.prepMinutes) reply.prepMinutes = read.varint();
    else if (field === DISH.calories) reply.calories = read.varint();
    else if (field === DISH.difficulty) reply.difficulty = toText(read.bytes());
  });
  return reply;
}

export function isFoodMoodStatus(reply: GrpcStatusReply): boolean {
  return reply.service === STATUS_SERVICE;
}

/** Human label for the `ai_provider` field, kept with the other decoding. */
export function providerLabel(provider: string): string {
  if (provider === "openai") return "OpenAI";
  if (provider === "groq") return "Groq";
  return "modelo local";
}

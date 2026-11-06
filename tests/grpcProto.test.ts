import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeDishReply,
  decodeStatusReply,
  encodeDishRequest,
  encodeVarint,
  readVarint,
} from "../src/lib/grpcProto.ts";

/** Rebuilds a message with the same layout as the backend's wire encoder. */
function fieldString(field: number, value: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(value));
  return [field * 8 + 2, bytes.length, ...bytes];
}

function fieldNumber(field: number, value: number): number[] {
  return [field * 8, ...encodeVarint(value)];
}

test("encodeDishRequest marks the id as field 1 varint", () => {
  assert.deepEqual(Array.from(encodeDishRequest(1)), [0x08, 0x01]);
  assert.deepEqual(Array.from(encodeDishRequest(300)), [0x08, 0xac, 0x02]);
});

test("readVarint reads the values the encoder produces", () => {
  const encoded = encodeVarint(123456);
  const read = readVarint(new Uint8Array(encoded), 0);

  assert.equal(read.value, 123456);
  assert.equal(read.offset, encoded.length);
});

test("decodeStatusReply reconstructs the whole snapshot", () => {
  const bytes = new Uint8Array([
    ...fieldString(1, "foodmood-ia-backend"),
    ...fieldString(2, "foodmood-1.4.0"),
    ...fieldString(3, "groq"),
    ...fieldNumber(4, 90),
    ...fieldNumber(5, 40),
    ...fieldNumber(6, 6),
  ]);
  const reply = decodeStatusReply(bytes);

  assert.equal(reply.service, "foodmood-ia-backend");
  assert.equal(reply.version, "foodmood-1.4.0");
  assert.equal(reply.aiProvider, "groq");
  assert.equal(reply.uptimeSeconds, 90);
  assert.equal(reply.dishes, 40);
  assert.equal(reply.moods, 6);
});

test("decodeDishReply decodes Spanish names with accents intact", () => {
  const bytes = new Uint8Array([
    ...fieldNumber(1, 7),
    ...fieldString(2, "sopa-de-lentejas"),
    ...fieldString(3, "Sopa de lentejas casera"),
    ...fieldString(4, "principal"),
    ...fieldNumber(5, 35),
    ...fieldNumber(6, 380),
    ...fieldString(7, "media"),
  ]);
  const dish = decodeDishReply(bytes);

  assert.equal(dish.id, 7);
  assert.equal(dish.slug, "sopa-de-lentejas");
  assert.equal(dish.nameEs, "Sopa de lentejas casera");
  assert.equal(dish.category, "principal");
  assert.equal(dish.prepMinutes, 35);
  assert.equal(dish.calories, 380);
  assert.equal(dish.difficulty, "media");
});

test("unknown fields are skipped instead of breaking the parse", () => {
  const bytes = new Uint8Array([
    ...fieldNumber(9, 1),
    ...fieldNumber(5, 40),
  ]);

  assert.equal(decodeStatusReply(bytes).dishes, 40);
});

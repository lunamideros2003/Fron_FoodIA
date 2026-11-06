import assert from "node:assert/strict";
import test from "node:test";
import { frameMessage, framePayload, TRAILER_FRAME } from "../src/lib/grpcFrames.ts";
import { encodeVarint } from "../src/lib/grpcProto.ts";
import { fetchGrpcDish, fetchGrpcStatus, GrpcError } from "../src/lib/grpcStatus.ts";

const originalFetch = globalThis.fetch;

function fieldString(field: number, value: string): number[] {
  const bytes = Array.from(new TextEncoder().encode(value));
  return [field * 8 + 2, bytes.length, ...bytes];
}

function fieldNumber(field: number, value: number): number[] {
  return [field * 8, ...encodeVarint(value)];
}

function trailers(status: number, message = ""): Uint8Array {
  const lines = [`grpc-status: ${status}\r\n`];
  if (message) lines.push(`grpc-message: ${message}\r\n`);
  return framePayload(TRAILER_FRAME, new TextEncoder().encode(lines.join("")));
}

function reply(id: number): Uint8Array {
  const message = id === 0
    ? new Uint8Array([
        ...fieldString(1, "foodmood-ia-backend"),
        ...fieldString(2, "foodmood-1.4.0"),
        ...fieldString(3, "local"),
        ...fieldNumber(4, 120),
        ...fieldNumber(5, 40),
        ...fieldNumber(6, 6),
      ])
    : new Uint8Array([
        ...fieldNumber(1, id),
        ...fieldString(2, "creamy-oat-porridge"),
        ...fieldString(3, "Avena cremosa"),
        ...fieldString(4, "Desayuno"),
        ...fieldNumber(5, 10),
        ...fieldNumber(6, 420),
        ...fieldString(7, "facil"),
      ]);
  return frameMessage(message);
}

function installResponse(body: Uint8Array, ok = true): void {
  globalThis.fetch = async () =>
    new Response(new Uint8Array(body), { status: ok ? 200 : 502 });
}

const bytes = (...chunks: Uint8Array[]) => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
};

test("fetchGrpcStatus decodes the bridge reply", async () => {
  installResponse(bytes(reply(0), trailers(0)));
  const status = await fetchGrpcStatus();

  assert.equal(status.service, "foodmood-ia-backend");
  assert.equal(status.version, "foodmood-1.4.0");
  assert.equal(status.dishes, 40);
  assert.equal(status.moods, 6);
  assert.equal(status.uptimeSeconds, 120);
});

test("fetchGrpcDish decodes a dish reply", async () => {
  installResponse(bytes(reply(1), trailers(0)));
  const dish = await fetchGrpcDish(1);

  assert.equal(dish.id, 1);
  assert.equal(dish.slug, "creamy-oat-porridge");
  assert.equal(dish.nameEs, "Avena cremosa");
  assert.equal(dish.prepMinutes, 10);
  assert.equal(dish.calories, 420);
});

test("a gRPC error code surfaces as a rejected call", async () => {
  installResponse(bytes(trailers(5, "El%20plato%20no%20existe.")));
  const error = await fetchGrpcDish(999999).catch((caught: unknown) => caught);

  assert.ok(error instanceof GrpcError);
  assert.equal(error.status, 5);
  assert.equal(error.message, "El plato no existe.");
});

test("a dead backend maps to UNAVAILABLE", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("failed to fetch");
  };
  const error = await fetchGrpcStatus().catch((caught: unknown) => caught);

  assert.ok(error instanceof GrpcError);
  assert.equal(error.status, 14);
});

globalThis.fetch = originalFetch as typeof fetch;

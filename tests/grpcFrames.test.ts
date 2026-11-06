import assert from "node:assert/strict";
import test from "node:test";
import {
  DATA_FRAME,
  TRAILER_FRAME,
  dataFrame,
  frameMessage,
  framePayload,
  parseFrames,
  readTrailers,
  trailerFrame,
} from "../src/lib/grpcFrames.ts";

test("frameMessage matches the length-prefixed gRPC-Web layout", () => {
  const payload = new Uint8Array([0x08, 0x01]);
  const framed = frameMessage(payload);

  assert.equal(framed.length, 7);
  assert.equal(framed[0], DATA_FRAME);
  assert.equal(framed[1], 0); // 4-byte big-endian length: 00 00 00 02
  assert.equal(framed[5], 0x08);
});

test("parseFrames splits a data frame plus its trailers", () => {
  const body = new Uint8Array([
    0x00, 0, 0, 0, 2, 0x08, 0x01,
    0x80, 0, 0, 0, 13,
    ...new TextEncoder().encode("grpc-status: 0\r\n"),
  ]);
  const frames = parseFrames(body);

  assert.equal(frames.length, 2);
  assert.equal(frames[0].flag, DATA_FRAME);
  assert.deepEqual(Array.from(frames[0].payload), [0x08, 0x01]);
  assert.equal(frames[1].flag, TRAILER_FRAME);
  assert.equal(readTrailers(frames[1].payload).status, 0);
});

test("parseFrames keeps trailing garbage out of the result", () => {
  const body = new Uint8Array([0x00, 0, 0, 0, 2, 0x08, 0x01, 0x80, 0, 0]);

  assert.equal(parseFrames(body).length, 1);
});

test("readTrailers reports the gRPC code and the decoded message", () => {
  const trailers = trailerFrame(parseFrames(
    framePayload(TRAILER_FRAME, new TextEncoder().encode(
      "grpc-status: 5\r\ngrpc-message: El%20plato%20no%20existe.\r\n",
    )),
  ));

  assert.ok(trailers);
  const parsed = readTrailers(trailers);
  assert.equal(parsed.status, 5);
  assert.equal(parsed.message, "El plato no existe.");
});

test("an empty body yields no frames", () => {
  assert.deepEqual(parseFrames(new Uint8Array()), []);
});

test("dataFrame and trailerFrame pick their own kind", () => {
  const frames = [
    { flag: DATA_FRAME, payload: new Uint8Array([1]) },
    { flag: TRAILER_FRAME, payload: new Uint8Array([2]) },
  ];

  assert.equal(dataFrame(frames)?.length, 1);
  assert.equal(trailerFrame(frames)?.length, 1);
});

/**
 * The gRPC-Web wire format, browser side.
 *
 * A gRPC-Web response is a sequence of length-prefixed frames, the same ones
 * the backend emits in src/routes/grpc-web.routes.ts:
 *
 *   0x00 | uint32 length | protobuf bytes     (one data frame)
 *   0x80 | uint32 length | "key: value\r\n"    (trailers, always last)
 *
 * Hand-rolled on purpose: no dependency, and the format is small enough that
 * reading it beat importing a runtime for a status badge.
 */

export const DATA_FRAME = 0x00;
export const TRAILER_FRAME = 0x80;

export interface GrpcFrame {
  flag: number;
  payload: Uint8Array;
}

export function parseFrames(bytes: Uint8Array): GrpcFrame[] {
  const frames: GrpcFrame[] = [];
  let offset = 0;
  while (offset + 5 <= bytes.length) {
    const flag = bytes[offset];
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset + 1, 4).getUint32(0, false);
    if (offset + 5 + length > bytes.length) break;
    frames.push({ flag, payload: bytes.subarray(offset + 5, offset + 5 + length) });
    offset += 5 + length;
  }
  return frames;
}

/** 5-byte prefix: frame flag plus the big-endian length of the payload. */
export function framePayload(flag: number, payload: Uint8Array): Uint8Array {
  const framed = new Uint8Array(5 + payload.length);
  framed[0] = flag;
  new DataView(framed.buffer).setUint32(1, payload.length, false);
  framed.set(payload, 5);
  return framed;
}

/** Wraps protobuf bytes in the frame a server expects for its request body. */
export function frameMessage(payload: Uint8Array): Uint8Array {
  return framePayload(DATA_FRAME, payload);
}

export interface GrpcTrailers {
  status: number;
  message: string;
}

export function readTrailers(payload: Uint8Array): GrpcTrailers {
  const text = new TextDecoder().decode(payload);
  let status = 2; // unknown, mapped from gRPC's INTERNAL
  let message = "";
  for (const line of text.split("\r\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key === "grpc-status") {
      status = Number.isFinite(Number(value)) ? Number(value) : status;
    } else if (key === "grpc-message") {
      try {
        message = decodeURIComponent(value);
      } catch {
        message = value;
      }
    }
  }
  return { status, message };
}

/** The one message the backend bridge answers per frame, for a badge at least. */
export function dataFrame(frames: GrpcFrame[]): Uint8Array | null {
  return frames.find((frame) => frame.flag === DATA_FRAME)?.payload ?? null;
}

export function trailerFrame(frames: GrpcFrame[]): Uint8Array | null {
  return frames.find((frame) => frame.flag === TRAILER_FRAME)?.payload ?? null;
}

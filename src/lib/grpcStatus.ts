import {
  dataFrame,
  parseFrames,
  frameMessage,
  readTrailers,
  trailerFrame,
} from "./grpcFrames.ts";
import { decodeDishReply, decodeStatusReply, encodeDishRequest, type GrpcDishReply, type GrpcStatusReply } from "./grpcProto.ts";
import { readAuthToken } from "./authSession.ts";

// import.meta.env only exists under Vite; node tests read `undefined`.
const BASE_URL = (
  (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ?? ""
).replace(/\/$/, "");

/**
 * The backend bridge speaks gRPC-Web over plain HTTP/1.1 at /api/grpc, so the
 * browser gets the same contract (service foodmood.v1.FoodMoodStatus) without
 * Envoy, without a protobuf runtime and without a new dependency.
 */
export const GRPC_WEB_PATH = "/api/grpc/foodmood.v1.FoodMoodStatus";

export class GrpcError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message || `gRPC status ${status}`);
    this.name = "GrpcError";
    this.status = status;
  }
}

async function call(method: string, payload: Uint8Array): Promise<Uint8Array | null> {
  const token = readAuthToken();
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${GRPC_WEB_PATH}/${method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/grpc-web+proto",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: frameMessage(payload) as unknown as BodyInit,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new GrpcError(14, "No pudimos conectar con el servidor."); // UNAVAILABLE
  }

  const frames = parseFrames(new Uint8Array(await response.arrayBuffer()));
  const trailersPayload = trailerFrame(frames);
  const trailers = trailersPayload
    ? readTrailers(trailersPayload)
    : { status: 13, message: "Respuesta sin trailers." };
  if (trailers.status !== 0) {
    throw new GrpcError(trailers.status, trailers.message);
  }
  const data = dataFrame(frames);
  if (!data) throw new GrpcError(13, "Respuesta sin mensaje.");
  return data;
}

/** Empty `StatusRequest { }`: nothing beyond the 5-byte frame header. */
export async function fetchGrpcStatus(): Promise<GrpcStatusReply> {
  const payload = await call("GetStatus", new Uint8Array());
  return decodeStatusReply(payload!);
}

export async function fetchGrpcDish(id: number): Promise<GrpcDishReply> {
  const payload = await call("GetDish", encodeDishRequest(id));
  return decodeDishReply(payload!);
}

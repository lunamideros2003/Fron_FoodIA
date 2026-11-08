import { useEffect, useState } from "react";
import { fetchGrpcStatus } from "../lib/grpcStatus.ts";
import { providerLabel, type GrpcStatusReply } from "../lib/grpcProto.ts";
import { cn } from "../lib/cn.ts";

/**
 * A quiet proof that the gRPC-Web layer works end to end: the footer asks the
 * backend for `foodmood.v1.FoodMoodStatus/GetStatus` and shows the snapshot.
 * Decorative by design — if gRPC is off (`GRPC_PORT=0`) the badge simply
 * disappears and nothing else in the app notices.
 */
export function GrpcStatusBadge({ className }: { className?: string }) {
  const [status, setStatus] = useState<GrpcStatusReply | null>(null);

  useEffect(() => {
    let alive = true;
    fetchGrpcStatus()
      .then((reply) => {
        if (alive) setStatus(reply);
      })
      .catch(() => {
        // Silent on purpose; see the component comment.
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!status) return null;

  const provider = providerLabel(status.aiProvider);

  return (
    <p
      className={cn("flex items-center gap-1.5 text-[0.7rem] text-muted", className)}
      title={`${status.service} · ${status.uptimeSeconds}s en línea`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
      <span>
        gRPC activo · {provider} · {status.version.replace("foodmood-", "v")}
      </span>
    </p>
  );
}

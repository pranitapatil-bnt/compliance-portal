import { NextResponse } from "next/server";

import { getRegistrationQueue } from "@/features/queues/services/queue-service";
import { readQueueQuery } from "@/features/queues/search-body";
import type { QueueSearchParams } from "@/features/queues/types";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = Object.fromEntries(
    new URL(request.url).searchParams.entries(),
  ) as QueueSearchParams;
  const result = await getRegistrationQueue(readQueueQuery(params));
  return NextResponse.json(result);
}

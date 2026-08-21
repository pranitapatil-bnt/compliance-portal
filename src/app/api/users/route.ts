import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { listUsers } from "@/features/users/services/user-service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await listUsers();
  return NextResponse.json({ data: users });
}

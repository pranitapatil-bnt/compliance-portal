import { proxyCompliance } from "@/lib/compliance/bff";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

async function handle(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  return proxyCompliance(request, slug ?? []);
}

export function GET(request: Request, context: RouteContext) {
  return handle(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return handle(request, context);
}

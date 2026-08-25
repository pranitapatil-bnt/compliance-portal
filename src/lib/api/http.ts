import "server-only";

import http from "node:http";
import https from "node:https";
import { gunzipSync, inflateSync } from "node:zlib";

export type RawResponse = {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  text: string;
};

const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: 32,
  maxFreeSockets: 8,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,
  maxSockets: 32,
  maxFreeSockets: 8,
});

function headerValue(value: string | string[] | undefined): string {
  if (!value) {
    return "";
  }
  return Array.isArray(value) ? value.join(", ") : value;
}

function decodeBody(buffer: Buffer, encoding: string): string {
  const enc = encoding.toLowerCase();
  try {
    if (enc.includes("gzip")) {
      return gunzipSync(buffer).toString("utf8");
    }
    if (enc.includes("deflate")) {
      try {
        return inflateSync(buffer).toString("utf8");
      } catch {
        return gunzipSync(buffer).toString("utf8");
      }
    }
  } catch {
    return buffer.toString("utf8");
  }
  return buffer.toString("utf8");
}

export function requestRaw(
  url: string,
  init: {
    method: string;
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
  },
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const request = lib.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        path: `${parsed.pathname}${parsed.search}`,
        method: init.method,
        headers: init.headers,
        agent: parsed.protocol === "https:" ? httpsAgent : httpAgent,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
        response.on("end", () => {
          const status = response.statusCode ?? 0;
          const headers: Record<string, string> = {};
          for (const [name, value] of Object.entries(response.headers)) {
            const text = headerValue(value);
            if (text) {
              headers[name.toLowerCase()] = text;
            }
          }
          resolve({
            status,
            ok: status >= 200 && status < 300,
            headers,
            text: decodeBody(
              Buffer.concat(chunks),
              headers["content-encoding"] ?? "",
            ),
          });
        });
      },
    );

    request.on("error", reject);
    request.setTimeout(init.timeoutMs ?? 45_000, () => {
      request.destroy(new Error(`Request timed out: ${url}`));
    });
    if (init.body) {
      request.write(init.body);
    }
    request.end();
  });
}

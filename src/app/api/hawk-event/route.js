import { NextResponse } from "next/server";

function getIntegrationId(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
    return decoded?.integrationId || "";
  } catch {
    return "";
  }
}

export async function POST(req) {
  try {
    const token = process.env.HAWK_TOKEN || process.env.NEXT_PUBLIC_HAWK_TOKEN || "";
    if (!token) {
      return NextResponse.json({ ok: false, error: "missing_hawk_token" }, { status: 500 });
    }

    const integrationId = getIntegrationId(token);
    if (!integrationId) {
      return NextResponse.json({ ok: false, error: "invalid_hawk_token" }, { status: 500 });
    }

    const message = await req.json();
    if (!message || typeof message !== "object") {
      return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const collectorUrl = `https://${integrationId}.k1.hawk.so:433`;
    const response = await fetch(collectorUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: "hawk_upstream_error", status: response.status, body: body.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "hawk_proxy_exception", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


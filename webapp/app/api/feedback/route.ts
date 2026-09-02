// Prototype instrumentation: every event is logged server-side (visible in
// the deployment's function logs). At product scale these become analytics
// events; the shape is the same.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = {
      t: new Date().toISOString(),
      kind: String(body.kind ?? ""),
      settled: String(body.settled ?? ""),
      action: String(body.action ?? ""),
      style_id: String(body.style_id ?? ""),
      doubt: String(body.doubt ?? ""),
    };
    console.log("FEEDBACK", JSON.stringify(event));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}

const ALLOWED_HOSTS = new Set(["api.beastfpv.ru", "beastfpv.ru", "www.beastfpv.ru"]);

function getFilenameFromUrl(fileUrl) {
  try {
    const pathname = new URL(fileUrl).pathname;
    const tail = pathname.split("/").filter(Boolean).pop();
    return tail || "manual";
  } catch {
    return "manual";
  }
}

function sanitizeFilename(value) {
  return value.replace(/[^\w.\-()\u0400-\u04FF ]+/g, "_");
}

function toAsciiFilename(value) {
  const ascii = value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_")
    .trim();
  return ascii || "manual";
}

function getExtensionFromPath(pathname = "") {
  const cleanPath = String(pathname).split(/[?#]/)[0].toLowerCase();
  const match = cleanPath.match(/\.([a-z0-9]{1,10})$/);
  return match ? `.${match[1]}` : "";
}

function hasFileExtension(name = "") {
  // Treat only extensions starting with a letter as real file extensions.
  // This avoids false positives for version-like names (e.g. "4.4.3").
  return /\.[a-z][a-z0-9]{0,9}$/i.test(String(name).trim());
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");
  const requestedFilename = searchParams.get("filename");

  if (!targetUrl) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return Response.json({ error: "Invalid url parameter" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return Response.json({ error: "Unsupported protocol" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    return Response.json({ error: "Host is not allowed" }, { status: 403 });
  }

  let upstream;
  try {
    upstream = await fetch(parsedUrl.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    return Response.json({ error: "Failed to fetch manual file" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "Manual file is unavailable" }, { status: upstream.status || 502 });
  }

  const fallbackName = getFilenameFromUrl(parsedUrl.toString());
  const filenameSource = (requestedFilename || "").trim() || fallbackName;
  const sourceExt = getExtensionFromPath(parsedUrl.pathname) || getExtensionFromPath(fallbackName);
  const filenameWithExt =
    hasFileExtension(filenameSource) || !sourceExt ? filenameSource : `${filenameSource}${sourceExt}`;
  const filename = sanitizeFilename(filenameWithExt) || "manual";
  const asciiFilename = toAsciiFilename(filename);
  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  headers.set("Cache-Control", "no-store");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}

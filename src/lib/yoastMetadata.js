const SITE_URL = "https://beastfpv.ru";

const parseAttributes = (raw = "") => {
  const attrs = {};
  const regex = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let match = regex.exec(raw);

  while (match) {
    const key = (match[1] || "").toLowerCase();
    const value = match[3] ?? match[4] ?? "";
    attrs[key] = value;
    match = regex.exec(raw);
  }

  return attrs;
};

const getMetaBy = (fullHead = "", attrName, attrValue) => {
  const metaRegex = /<meta\s+([^>]+?)\/?>/gi;
  let match = metaRegex.exec(fullHead);

  while (match) {
    const attrs = parseAttributes(match[1]);
    if (attrs[attrName] === attrValue && attrs.content) {
      return attrs.content;
    }
    match = metaRegex.exec(fullHead);
  }

  return "";
};

const getLinkHrefByRel = (fullHead = "", relName) => {
  const linkRegex = /<link\s+([^>]+?)\/?>/gi;
  let match = linkRegex.exec(fullHead);

  while (match) {
    const attrs = parseAttributes(match[1]);
    if (attrs.rel === relName && attrs.href) {
      return attrs.href;
    }
    match = linkRegex.exec(fullHead);
  }

  return "";
};

const toAbsoluteUrl = (url = "", fallbackPath = "/") => {
  const value = (url || "").trim();
  if (value && /^https?:\/\//i.test(value)) return value;

  const base = SITE_URL.replace(/\/+$/, "");
  const path = (value || fallbackPath || "/").trim();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};

const toInt = (value) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) ? num : undefined;
};

const getOgImage = (fullHead = "") => {
  const url = getMetaBy(fullHead, "property", "og:image");
  if (!url) return undefined;

  return {
    url,
    width: toInt(getMetaBy(fullHead, "property", "og:image:width")),
    height: toInt(getMetaBy(fullHead, "property", "og:image:height")),
    type: getMetaBy(fullHead, "property", "og:image:type") || undefined,
  };
};

export const extractYoastJsonLd = (fullHead = "") => {
  const scripts = [];
  const regex =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match = regex.exec(fullHead);

  while (match) {
    const payload = (match[1] || "").trim();
    if (payload) scripts.push(payload);
    match = regex.exec(fullHead);
  }

  return scripts;
};

export const buildMetadataFromYoast = (
  seo,
  {
    fallbackTitle = "",
    fallbackDescription = "",
    fallbackPath = "/",
    defaultType = "website",
  } = {}
) => {
  const fullHead = seo?.fullHead || "";
  const title = (seo?.title || fallbackTitle || "").trim();
  const description = (seo?.metaDesc || fallbackDescription || "").trim();
  const canonical = toAbsoluteUrl(
    seo?.canonical || getLinkHrefByRel(fullHead, "canonical"),
    fallbackPath
  );

  const ogTitle = getMetaBy(fullHead, "property", "og:title") || title;
  const ogDescription =
    getMetaBy(fullHead, "property", "og:description") || description;
  const ogUrl = toAbsoluteUrl(
    getMetaBy(fullHead, "property", "og:url"),
    canonical
  );
  const ogSiteName = getMetaBy(fullHead, "property", "og:site_name") || undefined;
  const ogLocale = getMetaBy(fullHead, "property", "og:locale") || "ru_RU";
  const ogType = getMetaBy(fullHead, "property", "og:type") || defaultType;
  const ogImage = getOgImage(fullHead);

  return {
    title: title || undefined,
    description: description || undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle || undefined,
      description: ogDescription || undefined,
      url: ogUrl || undefined,
      siteName: ogSiteName,
      locale: ogLocale,
      type: ogType,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: getMetaBy(fullHead, "name", "twitter:card") || (ogImage ? "summary_large_image" : "summary"),
      title: ogTitle || undefined,
      description: ogDescription || undefined,
      images: ogImage ? [ogImage.url] : undefined,
    },
  };
};


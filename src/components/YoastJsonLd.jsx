import { extractYoastJsonLd } from "../lib/yoastMetadata";

const YoastJsonLd = ({ fullHead }) => {
  const scripts = extractYoastJsonLd(fullHead || "");
  if (!scripts.length) return null;

  return (
    <>
      {scripts.map((content, index) => (
        <script
          key={`yoast-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ))}
    </>
  );
};

export default YoastJsonLd;


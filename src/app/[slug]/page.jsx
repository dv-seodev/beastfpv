import { notFound } from 'next/navigation';
import './page.scss';
import YoastJsonLd from "../../components/YoastJsonLd";
import { buildMetadataFromYoast } from "../../lib/yoastMetadata";

export const dynamicParams = false; // только пререндеренные страницы
export const revalidate = 60;

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_URL;
const RESERVED_SLUGS = new Set([
  'account',
  'actions',
  'api',
  'cart',
  'category',
  'checkout',
  'contacts',
  'favorite',
  'login',
  'news',
  'password-recovery',
  'product',
  'register',
]);

const PAGE_QUERY = `
  query PageByUri($uri: String!) {
    pageBy(uri: $uri) {
      id
      title
      content
      slug
      uri
    }
  }
`;

const PAGE_SEO_QUERY = `
  query PageSeoByUri($uri: String!) {
    pageBy(uri: $uri) {
      id
      title
      seo {
        title
        metaDesc
        canonical
        fullHead
      }
    }
  }
`;

const PAGES_QUERY = `
  query AllPages($after: String) {
    pages(first: 100, after: $after) {
      nodes {
        slug
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

async function fetchGraphQL(query, variables) {
  if (!GRAPHQL_URL) {
    throw new Error("GraphQL endpoint is not configured");
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`GraphQL error: ${res.status}`);
  }

  const json = await res.json();
  if (Array.isArray(json?.errors) && json.errors.length > 0) {
    const firstError = json.errors[0]?.message || 'Unknown GraphQL error';
    throw new Error(`GraphQL response error: ${firstError}`);
  }
  return json?.data || null;
}

async function fetchPageByUri(uri) {
  const data = await fetchGraphQL(PAGE_QUERY, { uri });
  return data?.pageBy || null;
}

async function fetchPageSeoByUri(uri) {
  try {
    const data = await fetchGraphQL(PAGE_SEO_QUERY, { uri });
    return data?.pageBy?.seo || null;
  } catch (_) {
    return null;
  }
}

async function fetchAllPageSlugs() {
  const slugs = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const data = await fetchGraphQL(PAGES_QUERY, { after });
    const connection = data?.pages;
    const nodes = connection?.nodes || [];
    const pageInfo = connection?.pageInfo;

    nodes.forEach((node) => {
      if (node?.slug && !RESERVED_SLUGS.has(node.slug)) slugs.push(node.slug);
    });

    hasNextPage = Boolean(pageInfo?.hasNextPage);
    after = pageInfo?.endCursor || null;
  }

  return slugs;
}

export async function generateStaticParams() {
  try {
    const slugs = await fetchAllPageSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    // Do not fail the whole build because of temporary GraphQL/network issues.
    console.error('[slug]/generateStaticParams failed:', error);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug || RESERVED_SLUGS.has(slug)) {
    return buildMetadataFromYoast(null, {
      fallbackTitle: 'Страница - beastfpv.ru',
      fallbackDescription: 'Страница - beastfpv.ru',
      fallbackPath: '/',
      defaultType: 'website',
    });
  }

  const uri = `/${slug}/`;
  const [page, seo] = await Promise.all([
    fetchPageByUri(uri),
    fetchPageSeoByUri(uri),
  ]);

  return buildMetadataFromYoast(seo, {
    fallbackTitle: `${page?.title || 'Страница'} - beastfpv.ru`,
    fallbackDescription: `${page?.title || 'Страница'} - beastfpv.ru`,
    fallbackPath: uri,
    defaultType: 'website',
  });
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (!slug || RESERVED_SLUGS.has(slug)) return notFound();

  const uri = `/${slug}/`;
  const [page, seo] = await Promise.all([
    fetchPageByUri(uri),
    fetchPageSeoByUri(uri),
  ]);

  if (!page) return notFound();

  return (
    <>
      <YoastJsonLd fullHead={seo?.fullHead} />
      <section className="text-page">
        <div className="container text-page__container">
          <h1 className='text-page__header'>{page.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: page.content || '' }} />
        </div>
      </section>
    </>
  );
}

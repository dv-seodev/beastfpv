import { notFound } from 'next/navigation';
import './page.scss';

export const dynamicParams = false; // только пререндеренные страницы
export const revalidate = 60;

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

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
    return json?.data || null;
}

async function fetchPageByUri(uri) {
    const data = await fetchGraphQL(PAGE_QUERY, { uri });
    return data?.pageBy || null;
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
            if (node?.slug) slugs.push(node.slug);
        });

        hasNextPage = Boolean(pageInfo?.hasNextPage);
        after = pageInfo?.endCursor || null;
    }

    return slugs;
}

export async function generateStaticParams() {
    const slugs = await fetchAllPageSlugs();
    return slugs.map((slug) => ({ slug }));
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) return notFound();

    const uri = `/${slug}/`;
    const page = await fetchPageByUri(uri);

    if (!page) return notFound();

    return (
        <section className="text-page">
            <div className="container text-page__container">
                <h1 className='text-page__header'>{page.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: page.content || '' }} />
            </div>
        </section>
    );
}

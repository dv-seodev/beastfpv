import HomePageClient from "./HomePageClient";
import YoastJsonLd from "../components/YoastJsonLd";
import { buildMetadataFromYoast } from "../lib/yoastMetadata";

export const dynamic = 'force-static';
export const revalidate = false;

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_URL;

const HOME_QUERY = `
  query HomeData($newSlug: String!, $popSlug: String!, $parentId: Int!) {
    newProducts: products(first: 10, where: { category: $newSlug }) {
      nodes {
        id
        databaseId
        name
        description
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockQuantity
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
        }
        ... on ExternalProduct {
          price
          regularPrice
          salePrice
        }
        ... on GroupProduct {
          price
          regularPrice
          salePrice
        }
        image {
          sourceUrl
        }
      }
    }
    popProducts: products(first: 8, where: { category: $popSlug }) {
      nodes {
        id
        databaseId
        name
        description
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockQuantity
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
        }
        ... on ExternalProduct {
          price
          regularPrice
          salePrice
        }
        ... on GroupProduct {
          price
          regularPrice
          salePrice
        }
        image {
          sourceUrl
        }
      }
    }
    categories: productCategories(first: 100, where: { parent: $parentId }) {
      nodes {
        id
        link
        name
        slug
        image {
          sourceUrl
        }
      }
    }
  }
`;

const HOME_SEO_QUERY = `
  query HomeSeo {
    nodeByUri(uri: "/") {
      __typename
      ... on Page {
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
  }
`;

async function fetchGraphQL(query, variables) {
  if (!GRAPHQL_URL) {
    throw new Error('Missing GraphQL endpoint. Set NEXT_PUBLIC_GRAPHQL_URL.');
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    cache: 'force-cache',
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    const message = json.errors[0]?.message || 'GraphQL error';
    throw new Error(message);
  }

  return json.data;
}

async function fetchHomeData() {
  const data = await fetchGraphQL(HOME_QUERY, {
    newSlug: 'new',
    popSlug: 'popular',
    parentId: 20,
  });

  return {
    new_products: data?.newProducts?.nodes || [],
    pop_products: data?.popProducts?.nodes || [],
    cats_list: data?.categories?.nodes || [],
  };
}

async function fetchHomeSeo() {
  try {
    const data = await fetchGraphQL(HOME_SEO_QUERY, {});
    return data?.nodeByUri?.seo || null;
  } catch (_) {
    return null;
  }
}

export async function generateMetadata() {
  try {
    const seo = await fetchHomeSeo();
    return buildMetadataFromYoast(seo, {
      fallbackTitle: "Главная - beastfpv.ru",
      fallbackDescription: "Главная - beastfpv.ru",
      fallbackPath: "/",
      defaultType: "website",
    });
  } catch (_) {
    return buildMetadataFromYoast(null, {
      fallbackTitle: "Главная - beastfpv.ru",
      fallbackDescription: "Главная - beastfpv.ru",
      fallbackPath: "/",
      defaultType: "website",
    });
  }
}

export default async function Home() {
  const [data, seo] = await Promise.all([fetchHomeData(), fetchHomeSeo()]);

  return (
    <>
      <YoastJsonLd fullHead={seo?.fullHead} />
      <HomePageClient data={data} />
    </>
  );
}

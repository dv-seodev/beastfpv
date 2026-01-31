import './page.scss';
import { Suspense } from 'react';
import CategoryPageClient from "./CategoryPageClient";

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
const PAGE_SIZE = 18;
const CATEGORY_PRODUCTS_LIMIT = 200;

const CATEGORY_QUERY = `
    query GetCategoryPage($slugId: ID!, $slugStr: String!, $first: Int!) {
        productCategory(id: $slugId, idType: SLUG) {
            id
            name
            slug
            description
            link
            count
        }
        products(first: $first, where: { category: $slugStr }) {
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
    }
`;

const CATEGORIES_QUERY = `
    query GetProductCategories {
        productCategories(first: 100, where: { hideEmpty: false, exclude: [19] }) {
            nodes {
                id
                databaseId
                name
                slug
                parent {
                    node {
                        id
                        databaseId
                        name
                        slug
                    }
                }
                children(first: 50) {
                    nodes {
                        id
                        databaseId
                        name
                        slug
                    }
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

const formatCategories = (rawCategories) => {
    return (rawCategories || [])
        .filter(cat => !cat.parent?.node)
        .map(category => {
            const subcategories = category.children?.nodes?.map(child => ({
                id: child.databaseId,
                name: child.name,
                slug: child.slug,
                href: `/category/${category.slug}/${child.slug}`,
            })) || [];

            return {
                id: category.databaseId,
                name: category.name,
                slug: category.slug,
                href: `/category/${category.slug}`,
                subcategories,
            };
        })
        .filter(cat => cat.name !== 'Misc' && cat.name !== 'Uncategorized');
};

async function fetchCategories() {
    const data = await fetchGraphQL(CATEGORIES_QUERY, {});
    return formatCategories(data?.productCategories?.nodes || []);
}

async function fetchCategoryData(slug) {
    const data = await fetchGraphQL(CATEGORY_QUERY, {
        slugId: slug,
        slugStr: slug,
        first: CATEGORY_PRODUCTS_LIMIT,
    });

    const category = data?.productCategory || null;
    const allProducts = data?.products?.nodes || [];
    const totalCount = category?.count || allProducts.length;

    return category
        ? {
            category,
            allProducts,
            totalCount,
        }
        : null;
}

export async function generateStaticParams() {
    const categories = await fetchCategories();
    const params = [{ slug: [] }];

    categories.forEach((category) => {
        if (category?.slug) {
            params.push({ slug: [category.slug] });
        }
        (category.subcategories || []).forEach((sub) => {
            if (category?.slug && sub?.slug) {
                params.push({ slug: [category.slug, sub.slug] });
            }
        });
    });

    return params;
}

export default async function Page({ params }) {
    const slugArray = params?.slug || [];
    const currentSlug = slugArray.length > 0 ? slugArray[slugArray.length - 1] : null;

    const categories = await fetchCategories();
    const data = currentSlug ? await fetchCategoryData(currentSlug) : null;

    return (
        <Suspense fallback={null}>
            <CategoryPageClient
                data={data}
                categories={categories}
                pageSize={PAGE_SIZE}
            />
        </Suspense>
    );
}

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
    query GetProductCategories($after: String) {
        productCategories(first: 100, after: $after, where: { hideEmpty: false }) {
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

const isExcludedCategory = (cat) => {
    return cat?.name === 'Misc' || cat?.name === 'Uncategorized';
};

const buildCategoryTree = (rawCategories) => {
    const bySlug = new Map();
    const childrenByParent = new Map();

    rawCategories.forEach((cat) => {
        if (!cat?.slug || isExcludedCategory(cat)) return;
        bySlug.set(cat.slug, cat);

        const parentSlug = cat.parent?.node?.slug;
        if (parentSlug) {
            if (!childrenByParent.has(parentSlug)) {
                childrenByParent.set(parentSlug, []);
            }
            childrenByParent.get(parentSlug).push(cat);
        }
    });

    const topLevel = rawCategories.filter(
        (cat) => cat?.slug && !cat.parent?.node && !isExcludedCategory(cat)
    );

    return topLevel.map((category) => {
        const subcategories = (childrenByParent.get(category.slug) || []).map((child) => ({
            id: child.databaseId,
            name: child.name,
            slug: child.slug,
            href: `/category/${category.slug}/${child.slug}`,
        }));

        return {
            id: category.databaseId,
            name: category.name,
            slug: category.slug,
            href: `/category/${category.slug}`,
            subcategories,
        };
    });
};

const buildSlugPath = (cat, bySlug) => {
    const path = [];
    const visited = new Set();
    let current = cat;

    while (current && current.slug && !visited.has(current.slug)) {
        visited.add(current.slug);
        path.unshift(current.slug);

        const parentSlug = current.parent?.node?.slug;
        current = parentSlug ? bySlug.get(parentSlug) : null;
    }

    return path;
};

async function fetchAllCategoriesRaw() {
    const all = [];
    let hasNextPage = true;
    let after = null;

    while (hasNextPage) {
        const data = await fetchGraphQL(CATEGORIES_QUERY, { after });
        const connection = data?.productCategories;
        const nodes = connection?.nodes || [];
        const pageInfo = connection?.pageInfo;

        all.push(...nodes);

        hasNextPage = Boolean(pageInfo?.hasNextPage);
        after = pageInfo?.endCursor || null;

        if (hasNextPage && !after) {
            // защита от бесконечного цикла
            hasNextPage = false;
        }
    }

    return all;
}

async function fetchCategories() {
    const raw = await fetchAllCategoriesRaw();
    return buildCategoryTree(raw);
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
    const raw = await fetchAllCategoriesRaw();
    const filtered = raw.filter((cat) => cat?.slug && !isExcludedCategory(cat));
    const bySlug = new Map(filtered.map((cat) => [cat.slug, cat]));

    const params = [{ slug: [] }];

    filtered.forEach((cat) => {
        const path = buildSlugPath(cat, bySlug);
        if (path.length > 0) {
            params.push({ slug: path });
        }
    });

    return params;
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const slugArray = resolvedParams?.slug || [];
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

import './page.scss';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductPageClient from "./ProductPageClient";
import YoastJsonLd from "../../../components/YoastJsonLd";
import { buildMetadataFromYoast } from "../../../lib/yoastMetadata";

export const dynamicParams = false;
export const dynamic = "force-static";
export const revalidate = 60;


const GRAPHQL_URL =
    process.env.NEXT_PUBLIC_PRODUCT_PAGE_GRAPHQL_URL ||
    'https://beastfpv.ru/graphql';

const PRODUCT_QUERY = `
    query GetProductBySlug($slug: ID!) {
        product(id: $slug, idType: SLUG) {
            id
            databaseId
            name
            slug
            description
            shortDescription
            sku
            averageRating
            reviewCount
            image {
                sourceUrl
                altText
            }
            galleryImages {
                nodes {
                    sourceUrl
                    altText
                }
            }
            attributes {
                nodes {
                    name
                    options
                }
            }
            productCategories {
                nodes {
                    id
                    name
                    slug
                    parent {
                        node {
                            id
                            name
                            slug
                            parent {
                                node {
                                    id
                                    name
                                    slug
                                }
                            }
                        }
                    }
                }
            }
            metaData {
                key
                value
            }
            seo {
                title
                metaDesc
                canonical
                fullHead
            }
            ... on ProductWithPricing {
                price
                regularPrice
                salePrice
            }
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
                variations {
                    nodes {
                        id
                        name
                        price
                        attributes {
                            nodes {
                                name
                                value
                            }
                        }
                    }
                }
            }
            ... on ExternalProduct {
                price
                regularPrice
                salePrice
            }
        }
    }
`;

const PRODUCT_SEO_QUERY = `
    query ProductSeoBySlug($slug: ID!) {
        product(id: $slug, idType: SLUG) {
            name
            seo {
                title
                metaDesc
                canonical
                fullHead
            }
        }
    }
`;

const MEDIA_ITEM_BY_ID_QUERY = `
    query MediaItemById($id: ID!) {
        mediaItem(id: $id, idType: DATABASE_ID) {
            id
            databaseId
            title
            sourceUrl
            mediaItemUrl
            mediaDetails {
                file
            }
        }
    }
`;

const RELATED_PRODUCTS_BY_IDS_QUERY = `
    query RelatedProductsByIds($ids: [Int]) {
        products(first: 20, where: { include: $ids }) {
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

const PRODUCT_BY_DATABASE_ID_QUERY = `
    query ProductByDatabaseId($id: ID!) {
        product(id: $id, idType: DATABASE_ID) {
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
`;

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
        categories: productCategories(first: 12, where: { parent: $parentId }) {
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

const PRODUCT_SLUGS_QUERY = `
    query ProductSlugs($after: String) {
        products(
            first: 300,
            after: $after,
            where: { orderby: [{ field: DATE, order: ASC }] }
        ) {
            nodes {
                slug
            }
            pageInfo {
                hasNextPage
                endCursor
            }
            found
        }
    }
`;

async function fetchGraphQL(query, variables, fetchOptions = {}) {
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
        ...fetchOptions,
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

const parsePriceToNumber = (priceString) => {
    if (!priceString) return 0;
    if (typeof priceString === 'number') return priceString;

    const cleanPrice = priceString
        .replace(/&nbsp;/g, '')
        .replace(/\s/g, '')
        .replace(/[^\d,]/g, '')
        .replace(',', '.');

    return parseFloat(cleanPrice) || 0;
};

const parseCharacteristics = (htmlString) => {
    if (!htmlString) return [];

    let cleanText = htmlString
        .replace(/<span[^>]*>/g, '')
        .replace(/<\/span>/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/\r\n/g, '\n')
        .trim();

    const lines = cleanText.split('\n').filter(line => line.trim().length > 0);

    const characteristics = [];

    for (let i = 0; i < lines.length - 1; i += 2) {
        const name = lines[i].trim();
        const value = lines[i + 1].trim();

        if (name && value) {
            characteristics.push({
                naimenovanie: name,
                znachenie: value
            });
        }
    }

    return characteristics;
};

const MANUAL_META_KEYS = [
    'manual_file',
    'manual_file2',
    'manual_file3',
    'manual_file4',
    'manual_file5',
    'manual_file_2',
    'manual_file_3',
    'manual_file_4',
    'manual_file_5',
];

const RELATED_PRODUCTS_META_KEYS = [
    'related_products_ids',
    'related_product_ids',
    'related_products',
    'related_products_id',
];

const uniqPositiveInts = (values = []) => {
    const result = [];
    for (const value of values) {
        const id = Number.parseInt(value, 10);
        if (Number.isFinite(id) && id > 0 && !result.includes(id)) {
            result.push(id);
        }
    }
    return result;
};

const parseSerializedRelationshipIds = (rawValue = '') => {
    // ACF Relationship is often stored as serialized PHP array.
    // Example: a:2:{i:0;s:3:"347";i:1;s:3:"707";}
    if (typeof rawValue !== 'string' || !rawValue.startsWith('a:')) return [];

    const tokens = [...rawValue.matchAll(/i:\d+;|s:\d+:"[^"]*";/g)].map((match) => match[0]);
    if (!tokens.length || tokens.length % 2 !== 0) return [];

    const valueTokens = tokens.filter((_, index) => index % 2 === 1);
    const ids = [];

    valueTokens.forEach((token) => {
        const intMatch = token.match(/^i:(\d+);$/);
        if (intMatch) {
            ids.push(intMatch[1]);
            return;
        }

        const strMatch = token.match(/^s:\d+:"(\d+)";$/);
        if (strMatch) {
            ids.push(strMatch[1]);
        }
    });

    return uniqPositiveInts(ids);
};

const extractManualIds = (metaDataArray = []) => {
    if (!Array.isArray(metaDataArray)) return [];

    const ids = [];
    for (const key of MANUAL_META_KEYS) {
        const value = metaDataArray.find((item) => item?.key === key)?.value;
        const id = Number.parseInt(value, 10);
        if (Number.isFinite(id) && id > 0 && !ids.includes(id)) {
            ids.push(id);
        }
    }

    return ids;
};

async function fetchManualFilesByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const files = await Promise.all(
        ids.map(async (id) => {
            try {
                const data = await fetchGraphQL(MEDIA_ITEM_BY_ID_QUERY, { id });
                const media = data?.mediaItem;
                const url = media?.sourceUrl || media?.mediaItemUrl;

                if (!url) return null;

                const filePath = media?.mediaDetails?.file || '';
                const fileName = filePath ? filePath.split('/').pop() : '';

                return {
                    id: media?.databaseId || id,
                    title: media?.title || fileName || `Инструкция ${id}`,
                    url,
                    fileName,
                };
            } catch (error) {
                return null;
            }
        })
    );

    return files.filter(Boolean);
}

const parseAnyIdsFromValue = (rawValue) => {
    if (rawValue === null || rawValue === undefined) return [];

    if (Array.isArray(rawValue)) {
        return uniqPositiveInts(rawValue);
    }

    if (typeof rawValue === 'number') {
        return uniqPositiveInts([rawValue]);
    }

    const valueString = String(rawValue).trim();
    if (!valueString) return [];

    try {
        const parsed = JSON.parse(valueString);
        if (Array.isArray(parsed)) {
            return uniqPositiveInts(parsed);
        }
    } catch (_) {
        // Not JSON. Continue.
    }

    const serializedIds = parseSerializedRelationshipIds(valueString);
    if (serializedIds.length) {
        return serializedIds;
    }

    // Fallback for simple text formats: "347,707" / multiline / spaces.
    const idMatches = valueString.match(/\d+/g) || [];
    return uniqPositiveInts(idMatches);
};

const extractRelatedProductIds = (metaDataArray = []) => {
    if (!Array.isArray(metaDataArray)) return [];

    const explicitKeyEntry = metaDataArray.find((item) =>
        RELATED_PRODUCTS_META_KEYS.includes(item?.key)
    );
    if (explicitKeyEntry) {
        return parseAnyIdsFromValue(explicitKeyEntry.value);
    }

    // Backup strategy for slight key variations in ACF/DB.
    const fuzzyEntries = metaDataArray.filter((item) => {
        const key = item?.key || '';
        return Boolean(key) && !key.startsWith('_') && key.includes('related_products');
    });

    if (!fuzzyEntries.length) return [];

    const mergedIds = [];
    fuzzyEntries.forEach((entry) => {
        const ids = parseAnyIdsFromValue(entry?.value);
        ids.forEach((id) => {
            if (!mergedIds.includes(id)) {
                mergedIds.push(id);
            }
        });
    });

    return mergedIds;
};

const parseProductNode = (product) => {
    if (!product) return null;

    return {
        id: product.id,
        databaseId: product.databaseId,
        name: product.name,
        description: product.description,
        slug: product.slug,
        price: product.price,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        stockQuantity: product.stockQuantity ?? null,
        stockStatus: product.stockStatus ?? null,
        image: product.image || null,
    };
};

async function fetchRelatedProductsByIds(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    try {
        const data = await fetchGraphQL(RELATED_PRODUCTS_BY_IDS_QUERY, { ids });
        const products = (data?.products?.nodes || []).map(parseProductNode).filter(Boolean);

        if (products.length > 0) {
            const byId = new Map(products.map((product) => [product.databaseId, product]));
            const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
            return ordered;
        }
    } catch (_) {
        // Fallback below.
    }

    // Fallback for unstable WooGraphQL schema/plugins:
    // fetch related products one by one by DATABASE_ID.
    const resolved = await Promise.all(
        ids.map(async (id) => {
            try {
                const data = await fetchGraphQL(PRODUCT_BY_DATABASE_ID_QUERY, { id });
                return parseProductNode(data?.product);
            } catch (_) {
                return null;
            }
        })
    );

    return resolved.filter(Boolean);
}

const formatProductData = (rawData, manualFiles = [], relatedProducts = []) => {
    if (!rawData?.product) return null;

    const product = rawData.product;

    const metaData = {};
    if (product.metaData && Array.isArray(product.metaData)) {
        product.metaData.forEach(meta => {
            metaData[meta.key] = meta.value;
        });
    }

    const opisanieTovara = metaData['opisanie_tovara'] || '';
    const characteristics = parseCharacteristics(opisanieTovara);

    const priceNum = parsePriceToNumber(product.price);
    const regularPriceNum = parsePriceToNumber(product.regularPrice);
    const salePriceNum = parsePriceToNumber(product.salePrice);

    const hasDiscount = salePriceNum > 0 && regularPriceNum > 0 &&
        salePriceNum < regularPriceNum;

    let discountPercent = 0;
    if (hasDiscount) {
        discountPercent = Math.round(((regularPriceNum - salePriceNum) / regularPriceNum) * 100);
    }

    return {
        id: product.id,
        productType: product.__typename,
        name: product.name,
        slug: product.slug,
        databaseId: product.databaseId,
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        price: product.price,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        priceNum: priceNum,
        regularPriceNum: regularPriceNum,
        salePriceNum: salePriceNum,
        stockStatus: product.stockStatus,
        stockQuantity: product.stockQuantity,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
        image: product.image,
        galleryImages: product.galleryImages?.nodes || [],
        attributes: product.attributes?.nodes || [],
        categories: product.productCategories?.nodes || [],
        variations: product.variations?.nodes || [],
        characteristics: characteristics,
        metaData: metaData,
        hasDiscount: hasDiscount,
        discountPercent: discountPercent,
        seo: product.seo || null,
        manualFiles,
        relatedProducts,
    };
};

async function fetchProductBySlug(slug) {
    const data = await fetchGraphQL(PRODUCT_QUERY, { slug });
    const manualIds = extractManualIds(data?.product?.metaData || []);
    const manualFiles = await fetchManualFilesByIds(manualIds);
    const relatedProductIds = extractRelatedProductIds(data?.product?.metaData || []);
    const relatedProducts = await fetchRelatedProductsByIds(relatedProductIds);

    if (process.env.NODE_ENV === 'development') {
        console.log('[ProductPage][related]', {
            slug,
            graphqlUrl: GRAPHQL_URL,
            relatedProductIds,
            relatedProductsCount: relatedProducts.length,
            relatedProductsDbIds: relatedProducts.map((product) => product?.databaseId).filter(Boolean),
        });
    }

    return formatProductData(data, manualFiles, relatedProducts);
}

async function fetchHomeData() {
    const data = await fetchGraphQL(HOME_QUERY, {
        newSlug: '10-inch',
        popSlug: 'akkumulyatory',
        parentId: 20,
    });

    return {
        new_products: data?.newProducts?.nodes || [],
        pop_products: data?.popProducts?.nodes || [],
        cats_list: data?.categories?.nodes || [],
    };
}

async function fetchAllProductSlugs() {
    const slugs = [];
    let hasNextPage = true;
    let after = null;
    let page = 0;

    while (hasNextPage) {
        page += 1;
        const data = await fetchGraphQL(PRODUCT_SLUGS_QUERY, { after }, { cache: 'no-store' });
        const connection = data?.products;
        const nodes = connection?.nodes || [];
        const pageInfo = connection?.pageInfo;
        const found = connection?.found;

        const pageSlugs = nodes.map((node) => node?.slug).filter(Boolean);
        nodes.forEach((node) => {
            if (node?.slug) slugs.push(node.slug);
        });

        hasNextPage = Boolean(pageInfo?.hasNextPage);
        after = pageInfo?.endCursor || null;
    }

    const uniqueCount = new Set(slugs).size;
    return slugs;
}

export async function generateStaticParams() {
    const slugs = await fetchAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const slugParam = resolvedParams?.slug;
    const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam;

    if (!slug) {
        return buildMetadataFromYoast(null, {
            fallbackTitle: 'Товар - beastfpv.ru',
            fallbackDescription: 'Товар - beastfpv.ru',
            fallbackPath: '/product/',
            defaultType: 'article',
        });
    }

    try {
        const data = await fetchGraphQL(PRODUCT_SEO_QUERY, { slug });
        const product = data?.product;

        return buildMetadataFromYoast(product?.seo, {
            fallbackTitle: `${product?.name || 'Товар'} - beastfpv.ru`,
            fallbackDescription: `${product?.name || 'Товар'} - beastfpv.ru`,
            fallbackPath: `/product/${slug}/`,
            defaultType: 'article',
        });
    } catch (_) {
        return buildMetadataFromYoast(null, {
            fallbackTitle: 'Товар - beastfpv.ru',
            fallbackDescription: 'Товар - beastfpv.ru',
            fallbackPath: `/product/${slug}/`,
            defaultType: 'article',
        });
    }
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const slugParam = resolvedParams?.slug;
    const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam;

    const product = await fetchProductBySlug(slug);
    if (!product) {
        return <div>Товар не найден</div>;
    }

    const homeData = await fetchHomeData();
    if (!homeData) {
        return <div>Данные не найдены</div>;
    }

    return (
        <>
            <YoastJsonLd fullHead={product?.seo?.fullHead} />
            <ProductPageClient product={product} homeData={homeData} />
        </>
    );
}

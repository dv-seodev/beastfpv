import './page.scss';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductPageClient from "./ProductPageClient";

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

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
                }
            }
            metaData {
                key
                value
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
        products(first: 100, after: $after) {
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

const formatProductData = (rawData) => {
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
    };
};

async function fetchProductBySlug(slug) {
    const data = await fetchGraphQL(PRODUCT_QUERY, { slug });
    return formatProductData(data);
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

    while (hasNextPage) {
        const data = await fetchGraphQL(PRODUCT_SLUGS_QUERY, { after });
        const connection = data?.products;
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
    const slugs = await fetchAllProductSlugs();
    return slugs.map((slug) => ({ slug }));
}

export default async function Page({ params }) {
    const slugParam = params?.slug;
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
        <ProductPageClient product={product} homeData={homeData} />
    );
}

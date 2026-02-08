import Link from "next/link";
import { notFound } from "next/navigation";
import "./page.scss";
import NewItems from "../../../components/New_items";

export const revalidate = 60;

const GRAPHQL_URL = "https://beastfpv.ru/graphql";

const HOME_QUERY = `
  query HomeData($newSlug: String!) {
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
  }
`;

const POST_QUERY = `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      date
      content
      slug
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
`;

const POSTS_QUERY = `
  query LatestPosts($after: String, $categoryName: String!) {
    posts(
      first: 8
      after: $after
      where: { orderby: { field: DATE, order: DESC }, categoryName: $categoryName }
    ) {
      nodes {
        id
        title
        date
        slug
        featuredImage {
          node {
            sourceUrl
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
    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 60 },
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
        const message = json.errors[0]?.message || "GraphQL error";
        throw new Error(message);
    }

    return json.data;
}

function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

async function fetchPost(slug) {
    const data = await fetchGraphQL(POST_QUERY, { slug });
    return data?.post || null;
}

async function fetchLatestPosts() {
    const data = await fetchGraphQL(POSTS_QUERY, {
        after: null,
        categoryName: "news",
    });
    return data?.posts?.nodes || [];
}

async function fetchHomeData() {
    const data = await fetchGraphQL(HOME_QUERY, {
        newSlug: "10-inch",
    });

    return {
        new_products: data?.newProducts?.nodes || [],
    };
}

export default async function NewsDetail({ params }) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) return notFound();

    const [post, latestPosts, homeData] = await Promise.all([
        fetchPost(slug),
        fetchLatestPosts(),
        fetchHomeData(),
    ]);

    if (!post) return notFound();

    const otherPosts = latestPosts.filter((item) => item.slug !== slug).slice(0, 3);
    const bannerImage = post.featuredImage?.node?.sourceUrl || "/images/newdetail_banner.png";

    return (
        <section className="newsdetail">
            <div className="container newsdetail__container">
                <div className="breadcrumbs">
                    <ul className="breadcrumbs__bread-ul">
                        <li>
                            <Link href="/">Главная</Link>
                        </li>
                        <li>
                            <Link href="/news/">Новости</Link>
                        </li>
                  <li>
                    <span className="current">{post.title}</span>
                  </li>
                    </ul>
                </div>
                <h1 className="newsdetail__header">{post.title}</h1>
                <p className="newsdetail__date">{formatDate(post.date)}</p>
                <div className="newsdetail__wrapper">
                    <div className="newsdetail__leftarea">
                        <div className="newsdetail__banner">
                            <img src={bannerImage} alt={post.title || "news"} />
                        </div>
                        <div
                            className="newsdetail__textarea"
                            dangerouslySetInnerHTML={{ __html: post.content || "" }}
                        />
                    </div>
                    <div className="newsdetail__rightarea">
                        <h3 className="">Другие новости</h3>
                        <div className="newsdetail__other-wrapper">
                            {otherPosts.map((item) => (
                                <div key={item.id} className="newsdetail__card">
                                    <div className="newsdetail__card-image">
                                        <Link href={`/news/${item.slug}`}>
                                            <img
                                                className="newsdetail__card-image-img"
                                                src={item.featuredImage?.node?.sourceUrl || "/images/news/news_2.jpg"}
                                                alt={item.title || "news"}
                                            />
                                        </Link>
                                    </div>
                                    <div className="newsdetail__card-text">
                                        <Link href={`/news/${item.slug}`}>
                                            <div className="newsdetail__card-header">{item.title}</div>
                                        </Link>
                                        <div className="newsdetail__card-date">{formatDate(item.date)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <NewItems products={homeData.new_products} />
        </section>
    );
}

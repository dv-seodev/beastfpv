import Link from "next/link";
import "./page.scss";
import Breadcrumbs from "../category/[[...slug]]/Breadcrumbs";

export const revalidate = 60;

const GRAPHQL_URL = "https://api.beastfpv.ru/graphql";
const NEWS_CATEGORY_SLUG = "news";

export const metadata = {
    title: "Новости - beastfpv.ru",
    description: "Новости - beastfpv.ru",
    alternates: {
        canonical: "https://beastfpv.ru/news/",
    },
    openGraph: {
        title: "Новости - beastfpv.ru",
        description: "Новости - beastfpv.ru",
        url: "https://beastfpv.ru/news/",
        siteName: "beastfpv.ru",
        locale: "ru_RU",
        type: "website",
    },
};

const POSTS_QUERY = `
  query LatestPosts($after: String, $categoryName: String!) {
    posts(
      first: 100
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

async function fetchAllPosts() {
    const collected = [];
    let after = null;
    let hasNextPage = true;
    let guard = 0;

    while (hasNextPage && guard < 20) {
        const data = await fetchGraphQL(POSTS_QUERY, {
            after,
            categoryName: NEWS_CATEGORY_SLUG,
        });

        const connection = data?.posts;
        const nodes = connection?.nodes || [];

        collected.push(...nodes);

        hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
        after = connection?.pageInfo?.endCursor || null;
        guard += 1;
    }

    return collected;
}

const NewsPage = async () => {
    const posts = await fetchAllPosts();

    return (
        <section className="newspage">
            <div className="container newspage__container">
                <div className="breadcrumbs">
                    <ul className="breadcrumbs__bread-ul">
                        <li>
                            <Link href="/">Главная</Link>
                        </li>
                        <li>
                            <span className="current">Новости</span>
                        </li>
                    </ul>
                </div>

                <h1 className="newspage__header">Новости</h1>

                {posts.length > 0 ? (
                    <div className="newspage__wrapper">

                        {posts.map((post) => (
                            <div key={post.id} className="newspage__card">
                                <div className="newspage__card-image">
                                    <Link href={`/news/${post.slug}`}>
                                        <img
                                            className="newspage__card-image-img"
                                            src={post.featuredImage?.node?.sourceUrl || "/images/news/news_2.jpg"}
                                            alt={post.title || "news"}
                                        />
                                    </Link>
                                </div>
                                <div className="newspage__card-text">
                                    <Link href={`/news/${post.slug}`}>
                                        <div className="newspage__card-header">{post.title}</div>
                                    </Link>
                                    <div className="newspage__card-date">{formatDate(post.date)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                ) : (
                    <div className="newspage__wrapper">
                        <div className="newspage__item">
                            <div className="newspage__card">
                                <div className="newspage__card-text">
                                    <div className="newspage__card-header">Новостей пока нет</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default NewsPage;

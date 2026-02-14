"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./News.scss";

const GRAPHQL_URL = "https://api.beastfpv.ru/graphql";
const NEWS_CATEGORY_SLUG = "news";

const POSTS_QUERY = `
  query LatestPosts($after: String, $categoryName: String!) {
    posts(
      first: 50
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

const News = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            try {
                const data = await fetchAllPosts();
                if (isActive) {
                    setPosts(data);
                }
            } catch (err) {
                console.error("Ошибка при загрузке новостей:", err);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        load();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <section className="news">
            <div className="container news__container">
                <div className="news__header">
                    <h2>Новости</h2>
                    <Link className="link__show-all desktop-show" href="/news/">
                        <span>Все новости</span>
                    </Link>
                </div>

                <div className="news__wrapper">
                    {!loading && posts.length === 0 && (
                        <div className="news__card">
                            <div className="news__card-text">
                                <div className="news__card-header">Новостей пока нет</div>
                            </div>
                        </div>
                    )}

                    {posts.slice(0, 4).map((post) => (
                        <div key={post.id} className="news__card">
                            <div className="news__card-image">
                                <Link href={`/news/${post.slug}`}>
                                    <img
                                        className="news__card-image-img"
                                        src={post.featuredImage?.node?.sourceUrl || "/images/news/news_2.jpg"}
                                        alt={post.title || "news"}
                                    />
                                </Link>
                            </div>
                            <div className="news__card-text">
                                <Link href={`/news/${post.slug}`}>
                                    <div className="news__card-header">{post.title}</div>
                                </Link>
                                <div className="news__card-date">{formatDate(post.date)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="link__show-all mobile-show">
                    <Link href="/news/">
                        <span className="show-all">Все новости</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default News;

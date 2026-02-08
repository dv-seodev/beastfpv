"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./Actions.scss";

const GRAPHQL_URL = "https://beastfpv.ru/graphql";
const ACTIONS_CATEGORY_SLUG = "actions";

const ACTIONS_QUERY = `
  query LatestActions($categoryName: String!) {
    posts(
      first: 3
      where: { orderby: { field: DATE, order: DESC }, categoryName: $categoryName }
    ) {
      nodes {
        id
        title
        slug
        featuredImage {
          node {
            sourceUrl
          }
        }
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

const Actions = () => {
    const [actions, setActions] = useState([]);

    useEffect(() => {
        let isActive = true;

        const load = async () => {
            try {
                const data = await fetchGraphQL(ACTIONS_QUERY, {
                    categoryName: ACTIONS_CATEGORY_SLUG,
                });
                if (isActive) {
                    setActions(data?.posts?.nodes || []);
                }
            } catch (err) {
                console.error("Ошибка при загрузке акций:", err);
            }
        };

        load();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <section className="actions">
            <div className="container actions__container">
                <div className="actions__header">
                    <h2>Акции</h2>
                    <Link className="link__show-all desktop-show" href="/actions/">
                        <span>Все акции</span>
                    </Link>
                </div>

                <div className="actions__wrapper">
                    {actions.map((item) => (
                        <Link href={`/actions/${item.slug}`}>
                            <div key={item.id} className="actions__item">
                                <img
                                    src={item.featuredImage?.node?.sourceUrl || "/images/actions/action_1.png"}
                                    alt={item.title || "action"}
                                />

                                {/* <div className="actions__text">{item.title}</div> */}

                            </div>
                        </Link>
                    ))}
                </div>
                <div className="link__show-all mobile-show">
                    <Link href="/actions/">
                        <span className="show-all">Все акции</span>
                    </Link>
                </div>
            </div >
        </section >
    );
}

export default Actions;

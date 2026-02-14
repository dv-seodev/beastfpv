import Link from "next/link";
import '../../components/Actions.scss'
import Breadcrumbs from "../category/[[...slug]]/Breadcrumbs";

export const revalidate = 60;

const GRAPHQL_URL = "https://api.beastfpv.ru/graphql";
const ACTIONS_CATEGORY_SLUG = "actions";

export const metadata = {
    title: "Акции - beastfpv.ru",
    description: "Акции - beastfpv.ru",
    alternates: {
        canonical: "https://beastfpv.ru/actions/",
    },
    openGraph: {
        title: "Акции - beastfpv.ru",
        description: "Акции - beastfpv.ru",
        url: "https://beastfpv.ru/actions/",
        siteName: "beastfpv.ru",
        locale: "ru_RU",
        type: "website",
    },
};

const POSTS_QUERY = `
  query LatestActions($after: String, $categoryName: String!) {
    posts(
      first: 100
      after: $after
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

async function fetchAllActions() {
    const collected = [];
    let after = null;
    let hasNextPage = true;
    let guard = 0;

    while (hasNextPage && guard < 20) {
        const data = await fetchGraphQL(POSTS_QUERY, {
            after,
            categoryName: ACTIONS_CATEGORY_SLUG,
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

export default async function ActionsPage() {
    const actions = await fetchAllActions();

    return (
        <section className="actions">
            <div className="container actions__container" style={{ paddingTop: "0px", paddingBottom: "50px" }}>
                <div className="breadcrumbs">
                    <ul className="breadcrumbs__bread-ul">
                        <li>
                            <Link href="/">Главная</Link>
                        </li>
                        <li>
                            <span className="current">Акции</span>
                        </li>
                    </ul>
                </div>
                <div className="actions__header">
                    <h2>Акции</h2>
                </div>

                <div className="actions__wrapper">
                    {actions.length === 0 && (
                        <div className="actions__item">
                            <div className="actions__text">Акций пока нет</div>
                        </div>
                    )}

                    {actions.map((item) => (
                        <div key={item.id} className="actions__item">
                            <Link href={`/actions/${item.slug}`}>
                                <img
                                    src={item.featuredImage?.node?.sourceUrl || "/images/actions/action_1.png"}
                                    alt={item.title || "action"}
                                />
                                <div className="actions__text">{item.title}</div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="link__show-all mobile-show">
                    <Link href="/actions/">
                        <span className="show-all">Все акции</span>
                    </Link>
                </div>
            </div>
        </section >
    );
}

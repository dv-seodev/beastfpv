import Link from "next/link";
import { notFound } from "next/navigation";
import NewItems from "../../../components/New_items";
import "./page.scss";
import Breadcrumbs from "../../category/[[...slug]]/Breadcrumbs";

export const revalidate = 60;

const GRAPHQL_URL = "https://beastfpv.ru/graphql";
const ACTIONS_CATEGORY_SLUG = "actions";

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

const ACTIONS_QUERY = `
  query LatestActions($after: String, $categoryName: String!) {
    posts(
      first: 8
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

async function fetchPost(slug) {
    const data = await fetchGraphQL(POST_QUERY, { slug });
    return data?.post || null;
}

async function fetchLatestActions() {
    const data = await fetchGraphQL(ACTIONS_QUERY, {
        after: null,
        categoryName: ACTIONS_CATEGORY_SLUG,
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

const ActionsDetail = async ({ params }) => {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) return notFound();

    const [post, latestActions, homeData] = await Promise.all([
        fetchPost(slug),
        fetchLatestActions(),
        fetchHomeData(),
    ]);

    if (!post) return notFound();

    const otherActions = latestActions.filter((item) => item.slug !== slug).slice(0, 3);
    const bannerImage = post.featuredImage?.node?.sourceUrl || "/images/newdetail_banner.png";

    return (
        <section className="actionsdetail">
            <div className="container actionsdetail__container">
                <div className="breadcrumbs">
                    <ul className="breadcrumbs__bread-ul">
                        <li>
                            <Link href="/">Главная</Link>
                        </li>
                        <li>
                            <Link href="/actions/">Акции</Link>
                        </li>
                        <li>
                            <span className="current">{post.title}</span>
                        </li>
                    </ul>
                </div>
                <h1 className="actionsdetail__header">{post.title}</h1>
                <div className="actionsdetail__wrapper">
                    <div className="actionsdetail__leftarea">
                        <div className="actionsdetail__banner">
                            <img src={bannerImage} alt={post.title || "action"} />
                        </div>
                        <div
                            className="actionsdetail__textarea"
                            dangerouslySetInnerHTML={{ __html: post.content || "" }}
                        />
                    </div>
                    <div className="actionsdetail__rightarea">
                        <h3 className="">Другие акции</h3>
                        <div className="actionsdetail__other-wrapper">
                            {otherActions.map((item) => (
                                <div key={item.id} className="actions__item">
                                    <Link href={`/actions/${item.slug}`}><img
                                        src={item.featuredImage?.node?.sourceUrl || "/images/actions/action_1.png"}
                                        alt={item.title || "action"}
                                    />
                                        {/* <Link href={`/actions/${item.slug}`}>
                                        <div className="actions__text">{item.title}</div>
                                    </Link> */}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <NewItems products={homeData.new_products} />
        </section>
    );
};

export default ActionsDetail;

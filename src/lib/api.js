'use client'

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const api = {
    fetchProducts: (limit, cat_name) => {
        return gql`
      query GetProducts {
        productCategory(id: "${cat_name}", idType: SLUG) {
          id
          name
          slug
          description
          link
          count          # всего товаров в категории
        }
        products(
          first: ${limit}        # берем "много", чтобы хватило на все страницы
          where: { category: "${cat_name}" }
          includeChildren: true
        ) {
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
    },
    fetchProductBySlug: (slug) => {
        return gql`
            query GetProductBySlug {
                product(id: "${slug}", idType: SLUG) {
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
    },

    fetchCategories: (limit, parentID) => {
        return gql`
query GetCategories {
    productCategories(first: ${limit}, where: {parent: ${parentID}}) {
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
    },

    fetchShippingMethods: () => {
        return gql`
          query GetShippingMethods {
            shippingMethods {
              nodes {
                id
                title
                description
              }
            }
          }
        `;
    },

    createOrderMutation: () => {
        return gql`
          mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      clientMutationId
      order {
        id
        databaseId
        orderNumber
        status
        total
        lineItems {
          nodes {
            productId
            quantity
            total
          }
        }
      }
    }
  }
`;
    },

    fetchSearchingProducts: () => {
        return gql`
query SearchProducts {
    products(first: 5000) {
      nodes {
        id
        databaseId
        name
        slug
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price
        }
        ... on VariableProduct {
          price
        }
      }
    }
  }
`;
    },

    fetchPaymentMethods: () => {
        return gql`
    query GetPaymentMethods {
      paymentGateways {
        nodes {
          id
          title
          description
        }
      }
    }
  `;
    },

    fetchProductCategories: () => {
        return gql`
    query GetProductCategories {
        productCategories(first: 100,  
        where: { 
      hideEmpty: false
      exclude: [19]
    }) {
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
    },

}

export default api;
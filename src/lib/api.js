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
        query GetAllShippingMethods {
        shippingMethods(first: 100) {
            nodes {
                id
                databaseId
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
            paymentGateways(first: 100) {
                nodes {
                    id
                    title
                    description
                }
            }
        }
  `;
  },

  applyCoupon: (couponCode) => {
    return gql`
    query ApplyCoupon($code: String!) {
        coupon(code: $code) {
            id
            code
            discountType
            amount
            description
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

  // ✅ ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  getCurrentCustomer: () => {
    return gql`
            query GetCurrentCustomer {
                viewer {
                    id
                    email
                    name
                }
            }
        `;
  },

  // ✅ ПОЛУЧИТЬ ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ
  getCustomerOrders: () => {
    return gql`
            query GetCustomerOrders($first: Int!) {
                orders(first: $first) {
                    nodes {
                        id
                        databaseId
                        orderNumber
                        date
                        status
                        total
                        lineItems(first: 10) {
                            nodes {
                                id
                                product {
                                    name
                                }
                                quantity
                            }
                        }
                    }
                }
            }
        `;
  },

  AddToCart: () => {
    return gql`
mutation ($input: AddToCartInput!) {
    addToCart(input: $input) {
      cartItem {
        key
        product {
          node {
            id
            databaseId
            name
            description
            type
            onSale
            slug
            averageRating
            reviewCount
            image {
              id
              sourceUrl
              altText
            }
            galleryImages {
              nodes {
                id
                sourceUrl
                altText
              }
            }
          }
        }
        variation {
          node {
            id
            databaseId
            name
            description
            type
            onSale
            price
            regularPrice
            salePrice
            image {
              id
              sourceUrl
              altText
            }
            attributes {
              nodes {
                id
                attributeId
                name
                value
              }
            }
          }
        }
        quantity
        total
        subtotal
        subtotalTax
      }
    }
  }
`;
  },

  getProductsByIds: (productIds) => {
    return gql`
        query GetProductsByIds($include: [Int!]) {
            products(where: { include: $include, typeIn: SIMPLE }) {
                nodes {
                    ... on SimpleProduct {
                        id
                        databaseId
                        name
                        slug
                        description
                        onSale
                        price
                        regularPrice
                        salePrice
                        image {
                            id
                            sourceUrl
                            srcSet
                            altText
                            title
                        }
                        galleryImages {
                            nodes {
                                id
                                sourceUrl
                                srcSet
                                altText
                                title
                            }
                        }
                        stockStatus
                        stockQuantity
                        attributes {
                            nodes {
                                id
                                name
                                label
                            }
                        }
                    }
                    ... on VariableProduct {
                        id
                        databaseId
                        name
                        slug
                        description
                        onSale
                        price
                        image {
                            id
                            sourceUrl
                            srcSet
                            altText
                            title
                        }
                        stockStatus
                        attributes {
                            nodes {
                                id
                                name
                                label
                            }
                        }
                    }
                }
            }
        }
    `;
  },

  loginAuth: () => {
    return gql`
        mutation LoginUser($username: String!, $password: String!) {
            login(input: {
                username: $username,
                password: $password
            }) {
                authToken
                refreshToken
                user {
                    id
                    databaseId
                    name
                    email
                }
            }
        }
    `;
  },

  emptyCart: () => {
    return gql`
    mutation EMPTY_CART {
      emptyCart(input: {}) {
        cart {
          contents {
            nodes {
              key
              quantity
            }
          }
          subtotal
          total
          discountTotal
        }
      }
    }
  `;
  },

  getCart: () => {
    return gql`
    query GET_CART {
      cart {
        contents {
          nodes {
            key
            product {
              node {
                id
                databaseId
                name
                description
                type
                onSale
                slug
                averageRating
                reviewCount
                image {
                  id
                  sourceUrl
                  srcSet
                  altText
                  title
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
                galleryImages {
                  nodes {
                    id
                    sourceUrl
                    srcSet
                    altText
                    title
                  }
                }
              }
            }
            variation {
              node {
                id
                databaseId
                name
                description
                type
                onSale
                price
                regularPrice
                salePrice
                image {
                  id
                  sourceUrl
                  srcSet
                  altText
                  title
                }
                attributes {
                  nodes {
                    id
                    name
                    value
                  }
                }
              }
            }
            quantity
            total
            subtotal
            subtotalTax
          }
        }
        isEmpty
        subtotal
        subtotalTax
        shippingTax
        shippingTotal
        total
        totalTax
        feeTax
        feeTotal
        discountTax
        discountTotal
        chosenShippingMethods
        appliedCoupons {
          code
          description
          discountAmount
          discountTax
        }
        availableShippingMethods {
          rates {
            cost
            id
            label
          }
        }
      }
      viewer {
        id
        databaseId
        username
        email
        firstName
        lastName
        nicename
        wooSessionToken
      }
      paymentGateways(first: 100) {
        nodes {
          id
          title
          description
        }
      }
    }
  `;
  },

  updateItemQuantities: () => {
    return gql`
    mutation UpdateItemQuantities($input: UpdateItemQuantitiesInput!) {
      updateItemQuantities(input: $input) {
        cart {
          contents {
            nodes {
              key
              quantity
              total
              subtotal
              product {
                node {
                  id
                  databaseId
                  name
                  description
                  type
                  onSale
                  slug
                  image {
                    id
                    sourceUrl
                    altText
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
                }
              }
            }
          }
          isEmpty
          total
          subtotal
          subtotalTax
          discountTotal
          shippingTotal
        }
      }
    }
  `;
  },

  removeItemsFromCart: () => {
    return gql`
    mutation RemoveItemsFromCart($input: RemoveItemsFromCartInput!) {
      removeItemsFromCart(input: $input) {
        cart {
          contents {
            nodes {
              key
              quantity
              total
              subtotal
              product {
                node {
                  id
                  databaseId
                  name
                  description
                  type
                  onSale
                  slug
                  image {
                    id
                    sourceUrl
                    altText
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
                }
              }
            }
          }
          isEmpty
          total
          subtotal
          subtotalTax
          discountTotal
          shippingTotal
        }
      }
    }
  `;
  },

  applyCouponMutation: () => {
    return gql`
    mutation ApplyCoupon($input: ApplyCouponInput!) {
      applyCoupon(input: $input) {
        cart {
          contents {
            nodes {
              key
              quantity
              total
              product {
                node {
                  id
                  name
                  ... on SimpleProduct {
                    price
                  }
                  ... on VariableProduct {
                    price
                  }
                  ... on ExternalProduct {
                    price
                  }
                  ... on GroupProduct {
                    price
                  }
                }
              }
            }
          }
          total
          subtotal
          discountTotal
          appliedCoupons {
            code
            description
            discountAmount
            discountTax
          }
        }
      }
    }
  `;
  },

  updateShippingAddress: () => {
    return gql`
        mutation UpdateShippingAddress($input: UpdateShippingAddressInput!) {
            updateShippingAddress(input: $input) {
                cart {
                    chosenShippingMethods
                    availableShippingMethods {
                        rates {
                            id
                            label
                            cost
                        }
                    }
                    subtotal
                    total
                    shippingTotal
                }
            }
        }
    `;
  },

  removeCouponMutation: () => {
    return gql`
    mutation RemoveCoupons($input: RemoveCouponsInput!) {
      removeCoupons(input: $input) {
        cart {
          contents {
            nodes {
              key
              quantity
              total
              product {
                node {
                  id
                  name
                  ... on SimpleProduct {
                    price
                  }
                  ... on VariableProduct {
                    price
                  }
                  ... on ExternalProduct {
                    price
                  }
                  ... on GroupProduct {
                    price
                  }
                }
              }
            }
          }
          total
          subtotal
          discountTotal
          appliedCoupons {
            code
            description
            discountAmount
          }
        }
      }
    }
  `;
  }


  // getCart: () => {
  //   return gql`
  //   query GET_CART {
  //     cart {
  //       contents {
  //         nodes {
  //           key
  //           product {
  //             node {
  //               id
  //               databaseId
  //               name
  //               description
  //               type
  //               onSale
  //               slug
  //               averageRating
  //               reviewCount
  //               image {
  //                 id
  //                 sourceUrl
  //                 srcSet
  //                 altText
  //                 title
  //               }
  //                 ... on SimpleProduct {
  //               price
  //               regularPrice
  //               salePrice
  //               stockQuantity
  //               stockStatus
  //             }
  //             ... on VariableProduct {
  //               price
  //               regularPrice
  //               salePrice
  //             }
  //             ... on ExternalProduct {
  //               price
  //               regularPrice
  //               salePrice
  //             }
  //             ... on GroupProduct {
  //               price
  //               regularPrice
  //               salePrice
  //             }
  //               galleryImages {
  //                 nodes {
  //                   id
  //                   sourceUrl
  //                   srcSet
  //                   altText
  //                   title
  //                 }
  //               }
  //             }
  //           }
  //           variation {
  //             node {
  //               id
  //               databaseId
  //               name
  //               description
  //               type
  //               onSale
  //               price
  //               regularPrice
  //               salePrice
  //               image {
  //                 id
  //                 sourceUrl
  //                 srcSet
  //                 altText
  //                 title
  //               }
  //               attributes {
  //                 nodes {
  //                   id
  //                   name
  //                   value
  //                 }
  //               }
  //             }
  //           }
  //           quantity
  //           total
  //           subtotal
  //           subtotalTax
  //         }
  //       }

  //       subtotal
  //       subtotalTax
  //       shippingTax
  //       shippingTotal
  //       total
  //       totalTax
  //       feeTax
  //       feeTotal
  //       discountTax
  //       discountTotal
  //     }
  //   }
  // `;
  // }
}

export default api;
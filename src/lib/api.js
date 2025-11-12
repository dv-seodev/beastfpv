'use client'

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const api = {
    fetchProducts: (limit, cat_name) => {
        return gql`
query GetProducts {
    products(first: ${limit}, where: {category: "${cat_name}"}) {
      nodes {
        id
        name
        description
        slug
        ... on ProductWithPricing {
          price
        }
        image {
          sourceUrl
        }
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
    }

}

export default api;
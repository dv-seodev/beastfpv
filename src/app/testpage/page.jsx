'use client'

// Import everything needed to use the `useQuery` hook
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const api = {
    fetchProducts: (limit) => {
        return gql`
  query GetProducts {
    products(first: ${limit}) {
      nodes {
        id
        name
        description
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
    }
}

// const GET_PRODUCTS = gql`
//   query GetProducts {
//     products(first: 10) {
//       nodes {
//         id
//         name
//         description
//         ... on ProductWithPricing {
//           price
//         }
//         image {
//           sourceUrl
//         }
//       }
//     }
//   }
// `;

const Testpage = () => {
    const asd = api.fetchProducts(3);
    const { loading, error, data } = useQuery(asd, {
        fetchPolicy: 'no-cache',
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    return (
        <div>
            {data.products.nodes.map((product) => (
                <div key={product.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                    <h3>{product.name}</h3>
                    <p><strong>ID:</strong> {product.id}</p>
                    <p><strong>Description:</strong>
                        <span dangerouslySetInnerHTML={{ __html: product.description }} />
                    </p>
                    <p><strong>Price:</strong> ${product.price || 'N/A'}</p>
                    {product.image && (
                        <img
                            width="400"
                            height="250"
                            alt={product.image.altText || product.name}
                            src={product.image.sourceUrl}
                            style={{ objectFit: 'cover' }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default Testpage;

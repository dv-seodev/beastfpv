import { ApolloClient, InMemoryCache } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";

const WP_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

const client = new ApolloClient({
    connectToDevTools: true,
    link: new BatchHttpLink({
        uri: WP_GRAPHQL_ENDPOINT,
        batchMax: 10,
        batchInterval: 20, // Уменьшил для быстрого батчинга
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            // типично для UI с списками/деталками
            // fetchPolicy: "cache-and-network",
            // nextFetchPolicy: "cache-first",
        },
        query: {
            // fetchPolicy: "network-only", // разовые client.query, если используешь
        },
    },
});

export default client; // Экспортируем КЛИЕНТ, не функцию
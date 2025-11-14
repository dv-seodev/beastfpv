import { ApolloClient, InMemoryCache } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";

const WP_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

// Создаем клиент ОДИН РАЗ (не функцию!)
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
            fetchPolicy: 'no-cache',
        },
        query: {
            fetchPolicy: 'no-cache',
        },
    }
});

export default client; // Экспортируем КЛИЕНТ, не функцию
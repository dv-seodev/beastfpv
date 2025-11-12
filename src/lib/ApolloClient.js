import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from '@apollo/client/link/context';

const WP_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

console.log('GraphQL Endpoint:', WP_GRAPHQL_ENDPOINT);
console.log('Username set:', !!process.env.NEXT_PUBLIC_GRAPHQL_API_USERNAME);
console.log('Password set:', !!process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET);

const httpLink = new HttpLink({
    uri: WP_GRAPHQL_ENDPOINT,
    credentials: 'same-origin',
});

// Создаем контекст для аутентификации
const authLink = setContext((_, { headers }) => {
    // Получаем логин и пароль из переменных окружения
    const username = process.env.NEXT_PUBLIC_GRAPHQL_API_USERNAME;
    const password = process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET;

    // Если нет учетных данных, пропускаем аутентификацию
    if (!username || !password) {
        console.warn('GraphQL API credentials not set - proceeding without authentication');
        return { headers };
    }

    // Создаем Basic Auth токен
    const token = Buffer.from(`${username}:${password}`).toString('base64');

    console.log('Adding Basic Auth header');

    return {
        headers: {
            ...headers,
            authorization: `Basic ${token}`,
        }
    };
});

const client = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
});

export default client;
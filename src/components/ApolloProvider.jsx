'use client';

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from "@apollo/client/react";

export default function ApolloProviderWrapper({ children }) {
    // Временно для теста - замените на реальные значения
    const WP_GRAPHQL_ENDPOINT = 'https://test.beastfpv.ru/graphql';
    const username = 'ck_f0f176f02e9c64a817b1ca07264b7637540cdde2'; // Замените на реальный
    const password = 'cs_f35943b3fab21adecf3c2d178956515456b717d8'; // Замените на реальный

    console.log('Using hardcoded credentials for testing');

    const httpLink = new HttpLink({
        uri: WP_GRAPHQL_ENDPOINT,
        credentials: 'same-origin',
    });

    const authLink = setContext((_, { headers }) => {
        if (!username || !password) {
            console.warn('Credentials not set - proceeding without authentication');
            return { headers };
        }

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

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
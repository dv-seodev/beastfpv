'use client';

import { InMemoryCache, HttpLink, from } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import client from "../lib/ApolloClient";


export default function ApolloProviderWrapper({ children }) {

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
'use client';

import { InMemoryCache, HttpLink, from } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import client from "../lib/ApolloClient";
import { useEffect } from "react";


export default function ApolloProviderWrapper({ children }) {

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
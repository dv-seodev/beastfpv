'use client'

import './styles/globals.scss';
import './styles/typography.scss';

import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import SwipeSlider from '../components/Slider';
import PopularProducts from '../components/Popular_products';
import NewItems from '../components/New_items';
import Advantages from '../components/Advantages';
import News from '../components/News';
import WhyUs from '../components/WhyUs';
import Brands from '../components/Brands';
import Contact_us from '../components/Contact_us';
import MobileMenu from '../components/header/MobileMenu';
import Actions from '../components/Actions';
import Categories from '../components/Categories';
import client from "../lib/ApolloClient";
import { ApolloProvider } from '@apollo/client/react';
import ApolloProviderWrapper from '../components/ApolloProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
      </head>
      <body className={``}>
        <ApolloProviderWrapper>
          <div className="app_wrapper">
            <div className="app_header">
              <Header />
              <MobileMenu />
            </div>
            <div className="app_content">
              {children}
            </div>
            <div className="app_footer">
              <Footer />
            </div>
          </div>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}

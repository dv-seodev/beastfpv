"use client";

import "./styles/globals.scss";
import "./styles/typography.scss";
import Script from "next/script";

import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import SwipeSlider from "../components/Slider";
import PopularProducts from "../components/Popular_products";
import NewItems from "../components/New_items";
import Advantages from "../components/Advantages";
import News from "../components/News";
import WhyUs from "../components/WhyUs";
import Brands from "../components/Brands";
import Contact_us from "../components/Contact_us";
import MobileMenu from "../components/header/MobileMenu";
import Actions from "../components/Actions";
import Categories from "../components/Categories";
import ScrollToTop from "../components/ScrollToTop";
import client from "../lib/ApolloClient";
import { ApolloProvider } from "@apollo/client/react";
import ApolloProviderWrapper from "../components/ApolloProvider";
import { useRestCart } from "../lib/hooks/useRestCart";
import { useEffect } from "react";
import YandexMetrika from "../components/YandexMetrika";
import { Suspense } from "react";
import DesignUpdateNotice from "../components/DesignUpdateNotice";

export default function RootLayout({ children }) {
  const { fetchCart, cartInitialized } = useRestCart();

  useEffect(() => {
    if (!cartInitialized) {
      fetchCart();
    }
  }, [cartInitialized, fetchCart]);

  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />

        {/* <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3" charSet="utf-8"></script> */}
      </head>
      <body className={``}>
        <Script src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3" charSet="utf-8" strategy="beforeInteractive" />
        <Script id="metrika-counter" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)     })
          (window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');      ym(96745068, 'init', {webvisor:true, trackHash:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
        `}
        </Script>
        <Script id="bitrix24-site-button" strategy="afterInteractive">
          {`(function(w,d,u){
                var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/60000|0);
                var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);
        })(window,document,'https://cdn-ru.bitrix24.ru/b26010968/crm/site_button/loader_3_731ygu.js');`}
        </Script>
        <Suspense fallback={<></>}>
          <YandexMetrika />
        </Suspense>
        <ApolloProviderWrapper>
          <div className="app_wrapper">
            <div className="app_header">
              <Header />
              {/* <MobileMenu /> */}
            </div>
            <div className="app_content">{children}</div>
            <div className="app_footer">
              <Footer />
            </div>
            <ScrollToTop />
            <DesignUpdateNotice />
          </div>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}

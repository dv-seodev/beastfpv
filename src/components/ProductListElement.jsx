"use client";

import Link from "next/link";
import { useProductsList } from "../lib/ProductsListController";
import { useCartStore } from "../stores/cartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import client from "../lib/ApolloClient";
import { useCustomGql } from "../lib/useCustomGql";
import restApi from "../lib/woo_rest_api/rest_api";
import { useRestCart } from "../lib/hooks/useRestCart";

function ProductListItem({ product, onAddCart, onOneClick }) {
  const router = useRouter();
  const { formatPrice } = useProductsList();
  const { updateCart } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [inCart, setInCart] = useState(false); // ✅ ЛОКАЛЬНОЕ СОСТОЯНИЕ

  const restCart = useRestCart();

  // Проверяем hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ НОВЫЙ USEEFFECT: следим за изменениями корзины
  useEffect(() => {
    if (isMounted) {
      const cartItems = useCartStore.getState().items;
      const isProductInCart = cartItems.some(
        (item) =>
          item.product?.node?.id === product.id ||
          item.id === product.databaseId ||
          item.id === product.id
      );
      setInCart(isProductInCart);
    }
  }, [isMounted, product.id, product.databaseId]);

  // ✅ СЛУШАЕМ ИЗМЕНЕНИЯ ZUSTAND STORE
  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = useCartStore.subscribe(
      (state) => state.items,
      (items) => {
        const isProductInCart = items.some(
          (item) =>
            item.product?.node?.id === product.id ||
            item.id === product.databaseId ||
            item.id === product.id
        );
        setInCart(isProductInCart);
      }
    );

    return () => unsubscribe();
  }, [isMounted, product.id, product.databaseId, product.name]);

  // ✨ НОВАЯ ПРОВЕРКА: товар в наличии или нет
  const isOutOfStock =
    product.stockStatus === "OUT_OF_STOCK" || product.stockQuantity === 0;

  // Используем изображение или плейсхолдер
  const imageUrl = product?.image?.sourceUrl || "/images/placeholder.jpg";

  // ✅ НОВЫЙ МЕТОД: добавление товара в корзину через GraphQL
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);

      // Add to cart via REST API
      const newCart = await restApi.addToCart({
        id: product.databaseId,
        quantity: 1,
      });
      restCart.updateCart(newCart);

      // ✅ Получаем обновленную корзину
      const { fetchCart } = useCustomGql();
      const { data: cartData } = fetchCart();

      if (cartData?.cart) {
        updateCart(cartData.cart);
        setInCart(true); // ✅ ОБНОВЛЯЕМ ЛОКАЛЬНОЕ СОСТОЯНИЕ
        console.log("✅ Товар успешно добавлен в корзину");
      }
    } catch (err) {
      console.error("❌ Ошибка при добавлении в корзину:", err);
      alert("❌ Ошибка при добавлении товара в корзину");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ✅ ПЕРЕХОД В КОРЗИНУ
  const handleGoToCart = () => {
    router.push("/cart/");
  };

  // ✅ ОБРАБОТЧИК КЛИКА ПО КНОПКЕ КОРЗИНЫ
  const handleCartButtonClick = () => {
    if (inCart) {
      // Если товар в корзине - переходим на страницу корзины
      handleGoToCart();
    } else {
      // Если товара нет - добавляем его
      handleAddToCart();
    }
  };

  // ✨ ОБРАБОТЧИК ДЛЯ ПРЕДЗАКАЗА
  const handlePreOrder = () => {
    onOneClick(product);
  };

  return (
    <div key={product.id} className="new-items__item popular-products__item">
      <Link href={`/product/${product.slug}`}>
        <img src={imageUrl} alt={product.name} />
      </Link>

      <Link href={`/product/${product.slug}`}>
        <div className="new-items__name new-slider">{product.name}</div>
      </Link>

      <div className="new-items__price-wrapper">
        <span className="new-items__price">{formatPrice(product.price)}</span>

        {/* ✨ УСЛОВНЫЙ РЕНДЕРИНГ: КНОПКА КОРЗИНЫ или НАДПИСЬ */}
        {isOutOfStock ? (
          <div className="new-items__out-of-stock-text">Нет в наличии</div>
        ) : (
          <button
            className={`new-items__cart-button button ${
              inCart ? "cart-added" : ""
            }`}
            onClick={handleCartButtonClick}
            disabled={isAddingToCart}
            type="button"
            title={inCart ? "Товар в корзине" : "Добавить в корзину"}
            style={{
              opacity: isAddingToCart ? 0.6 : 1,
              cursor: isAddingToCart ? "not-allowed" : "pointer",
            }}
          >
            {isAddingToCart ? "⏳" : ""}
          </button>
        )}
      </div>

      {/* ✨ УСЛОВНЫЙ ТЕКСТ И ОБРАБОТЧИК */}
      <button
        className="new-items__one-click button"
        type="button"
        onClick={handlePreOrder}
        disabled={isOutOfStock}
        style={{
          opacity: isOutOfStock ? 0.5 : 1,
          cursor: isOutOfStock ? "not-allowed" : "pointer",
        }}
      >
        {isOutOfStock ? "Оформить предзаказ" : "Купить в один клик"}
      </button>
    </div>
  );
}

export default ProductListItem;

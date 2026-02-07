"use client";

import Link from "next/link";
import { useProductsList } from "../lib/ProductsListController";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import restApi from "../lib/woo_rest_api/rest_api";
// ✅ ИЗМЕНЕНИЕ: Заменяем старый useCartStore на новый useRestCart
import { useRestCart } from "../lib/hooks/useRestCart";
import { isInFavorites, toggleFavorite } from "../stores/favoriteStore";

// ✅ ИЗМЕНЕНИЕ: Добавляем пропс isInCart (вычисляется в родителе)
function ProductListItem({ product, isInCart, onAddCart, onOneClick }) {
  const router = useRouter();
  const { formatPrice } = useProductsList();
  const [isMounted, setIsMounted] = useState(false);
  // ✅ ИЗМЕНЕНИЕ: Локальное состояние inCart инициализируется пропсом
  const [inCart, setInCart] = useState(isInCart);
  const [isFavorite, setIsFavorite] = useState(false);
  const addInFlightRef = useRef(false);
  const favoriteProductId = product.databaseId || product.id;
  const favoriteProduct = { ...product, databaseId: favoriteProductId };

  // ✅ ИЗМЕНЕНИЕ: Используем новый useRestCart вместо старого useCartStore
  const { updateCart } = useRestCart();

  // Проверяем hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ ИЗМЕНЕНИЕ: Синхронизируем локальное состояние с пропсом isInCart
  useEffect(() => {
    setInCart(isInCart);
  }, [isInCart]);

  useEffect(() => {
    const updateFavorite = () => {
      setIsFavorite(isInFavorites(favoriteProductId));
    };

    updateFavorite();
    if (typeof window !== "undefined") {
      window.addEventListener("favoritesChanged", updateFavorite);
      return () => {
        window.removeEventListener("favoritesChanged", updateFavorite);
      };
    }
  }, [favoriteProductId]);

  // ✨ Проверка: товар в наличии или нет
  const isOutOfStock =
    product.stockStatus === "OUT_OF_STOCK" || product.stockQuantity === 0;

  // Используем изображение или плейсхолдер
  const imageUrl = product?.image?.sourceUrl || "/images/placeholder.jpg";

  // ✅ ИЗМЕНЕНИЕ: Переделан метод добавления товара в корзину с использованием REST API
  const commitAddToCart = async () => {
    if (addInFlightRef.current) return;
    addInFlightRef.current = true;

    try {
      // ✅ Добавляем товар в корзину через REST API
      const newCart = await restApi.addToCart({
        id: product.databaseId,
        quantity: 1,
      });

      // ✅ ИЗМЕНЕНИЕ: Обновляем состояние REST корзины
      updateCart(newCart);

      // ✅ ИЗМЕНЕНИЕ: Устанавливаем состояние товара в корзине
      setInCart(true);

      console.log("✅ Товар успешно добавлен в корзину листинга");
    } catch (err) {
      console.error("❌ Ошибка при добавлении в корзину:", err);
      setInCart(false);
      alert("❌ Ошибка при добавлении товара в корзину");
    } finally {
      addInFlightRef.current = false;
    }
  };

  const handleAddToCart = () => {
    setInCart(true); // мгновенно показываем "в корзине"
    void commitAddToCart();
  };

  // ✅ Переход в корзину
  const handleGoToCart = () => {
    router.push("/cart/");
  };

  // ✅ Обработчик клика по кнопке корзины
  const handleCartButtonClick = () => {
    if (inCart) {
      // Если товар в корзине - переходим на страницу корзины
      handleGoToCart();
    } else {
      // Если товара нет - добавляем его
      handleAddToCart();
    }
  };

  // ✨ Обработчик для предзаказа
  const handlePreOrder = () => {
    onOneClick(product);
  };

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(favoriteProduct);
    setIsFavorite(isInFavorites(favoriteProductId));
  };

  return (
    <div key={product.id} className="new-items__item popular-products__item">
      <button
        type="button"
        className={`product-favorite-button ${isFavorite ? "is-favorite" : ""}`}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
        onClick={handleFavoriteClick}
      >
        <img
          src={isFavorite ? "/icons-header/heart-red.svg" : "/images/favorites.svg"}
          alt=""
        />
      </button>
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
            // ✅ ИЗМЕНЕНИЕ: Класс меняется в зависимости от состояния inCart
            className={`new-items__cart-button button ${inCart ? "cart-added" : ""
              }`}
            onClick={handleCartButtonClick}
            type="button"
            // ✅ ИЗМЕНЕНИЕ: Подсказка меняется в зависимости от состояния
            title={inCart ? "Перейти в корзину" : "Добавить в корзину"}
          >
          </button>
        )}
      </div>

      {/* ✨ КНОПКА ПРЕДЗАКАЗА */}
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

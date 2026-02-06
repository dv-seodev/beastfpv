"use client";

import Link from "next/link";
import { useProductsList } from "../lib/ProductsListController";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import restApi from "../lib/woo_rest_api/rest_api";
// ✅ ИЗМЕНЕНИЕ: Заменяем старый useCartStore на новый useRestCart
import { useRestCart } from "../lib/hooks/useRestCart";

// ✅ ИЗМЕНЕНИЕ: Добавляем пропс isInCart (вычисляется в родителе)
function ProductListItem({ product, isInCart, onAddCart, onOneClick }) {
  const router = useRouter();
  const { formatPrice } = useProductsList();
  const [isMounted, setIsMounted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  // ✅ ИЗМЕНЕНИЕ: Локальное состояние inCart инициализируется пропсом
  const [inCart, setInCart] = useState(isInCart);
  const addToCartTimerRef = useRef(null);
  const pendingAddRef = useRef(false);

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
    return () => {
      if (addToCartTimerRef.current) {
        clearTimeout(addToCartTimerRef.current);
      }
      pendingAddRef.current = false;
    };
  }, []);

  // ✨ Проверка: товар в наличии или нет
  const isOutOfStock =
    product.stockStatus === "OUT_OF_STOCK" || product.stockQuantity === 0;

  // Используем изображение или плейсхолдер
  const imageUrl = product?.image?.sourceUrl || "/images/placeholder.jpg";

  // ✅ ИЗМЕНЕНИЕ: Переделан метод добавления товара в корзину с использованием REST API
  const commitAddToCart = async () => {
    if (!pendingAddRef.current) return;
    pendingAddRef.current = false;

    if (addToCartTimerRef.current) {
      clearTimeout(addToCartTimerRef.current);
      addToCartTimerRef.current = null;
    }

    try {
      setIsAddingToCart(true);

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
      setIsAddingToCart(false);
    }
  };

  const scheduleAddToCart = () => {
    pendingAddRef.current = true;
    if (addToCartTimerRef.current) {
      clearTimeout(addToCartTimerRef.current);
    }
    addToCartTimerRef.current = setTimeout(() => {
      commitAddToCart();
    }, 1000);
  };

  const handleAddToCart = () => {
    setInCart(true); // мгновенно показываем "в корзине"
    scheduleAddToCart();
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
            // ✅ ИЗМЕНЕНИЕ: Класс меняется в зависимости от состояния inCart
            className={`new-items__cart-button button ${inCart ? "cart-added" : ""
              }`}
            onClick={handleCartButtonClick}
            onBlur={commitAddToCart}
            disabled={isAddingToCart}
            type="button"
            // ✅ ИЗМЕНЕНИЕ: Подсказка меняется в зависимости от состояния
            title={inCart ? "Перейти в корзину" : "Добавить в корзину"}
            style={{
              opacity: isAddingToCart ? 0.6 : 1,
              cursor: isAddingToCart ? "not-allowed" : "pointer",
            }}
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

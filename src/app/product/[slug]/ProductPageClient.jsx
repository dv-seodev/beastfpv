'use client';

import { useRouter } from 'next/navigation';
import NewItems from "../../../components/New_items";
import Breadcrumbs from "../../category/[[...slug]]/Breadcrumbs";
import { useState, useEffect, useRef } from "react";
import Tabs from "./Tabs";
import { useProductsList } from '../../../lib/ProductsListController';
import { useFavoriteStore } from '../../../stores/favoriteStore';
// ✅ ИЗМЕНЕНИЕ: Заменяем старый useCartStore на новый useRestCart
import { useRestCart } from '../../../lib/hooks/useRestCart';
import ProductGallery from "./ProductGallery";
import restApi from "../../../lib/woo_rest_api/rest_api";
import OneClickModal from "../../../components/OneClickModal";


const Product_cart = ({ product, homeData }) => {
    const [quantity, setQuantity] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [isPreorderModalOpen, setIsPreorderModalOpen] = useState(false);
    const router = useRouter();

    const debounceTimerRef = useRef(null);
    const pendingActionRef = useRef(null);
    const isUpdatingRef = useRef(false);
    const DEBOUNCE_MS = 2000;

    // ✅ ИЗМЕНЕНИЕ: Используем новый useRestCart hook вместо старого useCartStore
    const {
        cart,
        fetchCart,
        handleQuantityChange,
        handleRemoveItem,
    } = useRestCart();

    const { formatPrice } = useProductsList();

    // ✅ ИЗМЕНЕНИЕ: Используем только методы получения и удаления из избранного
    const { addItem: addToFavorites, removeItem: removeFromFavorites, isInFavorites } = useFavoriteStore;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        isUpdatingRef.current = isUpdating;
    }, [isUpdating]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // ✅ ИЗМЕНЕНИЕ: Загружаем корзину при монтировании
    useEffect(() => {
        if (isMounted) {
            fetchCart();
        }
    }, [isMounted, fetchCart]);

    // ✅ ИЗМЕНЕНИЕ: Проверяем наличие товара в корзине через REST данные
    useEffect(() => {
        if (isMounted && product?.databaseId && cart?.items) {
            const foundItem = cart.items.find(item =>
                item.product_id === product.databaseId ||
                item.id === product.databaseId
            );

            const itemQuantity = foundItem?.quantity || 0;
            setIsInCart(itemQuantity > 0);
            setQuantity(itemQuantity > 0 ? itemQuantity : 1);

            console.log(`📦 Товар ${product.name} в корзине:`, itemQuantity > 0, 'количество:', itemQuantity);
        }
    }, [isMounted, product?.databaseId, product?.name, cart?.items]);

    // ✅ ИЗМЕНЕНИЕ: Подписываемся на изменения корзины через Zustand store
    useEffect(() => {
        if (!isMounted || !product?.databaseId) return;

        const updateCartState = () => {
            const cartItems = useRestCart.getState().cart?.items || [];
            const foundItem = cartItems.find(item =>
                item.product_id === product.databaseId ||
                item.id === product.databaseId
            );

            const itemQuantity = foundItem?.quantity || 0;
            setIsInCart(itemQuantity > 0);
            setQuantity(itemQuantity > 0 ? itemQuantity : 1);

            console.log(`🛒 Товар ${product.name} в корзине (обновлено):`, itemQuantity > 0);
        };

        const unsubscribe = useRestCart.subscribe(
            (state) => state.cart?.items,
            () => {
                updateCartState();
            }
        );

        return () => unsubscribe();
    }, [isMounted, product?.databaseId, product?.name]);

    // ✅ ИЗМЕНЕНИЕ: Используем существующую логику для избранного (без изменений)
    useEffect(() => {
        if (isMounted && product?.databaseId) {
            const favoriteStatus = isInFavorites(product.databaseId);
            setIsFavorite(favoriteStatus);

            const handleFavoritesUpdate = () => {
                setIsFavorite(isInFavorites(product.databaseId));
            };

            window.addEventListener('favoritesChanged', handleFavoritesUpdate);
            return () => window.removeEventListener('favoritesChanged', handleFavoritesUpdate);
        }
    }, [isMounted, product?.databaseId, isInFavorites]);

    if (!product) return <div>Товар не найден</div>;
    if (!homeData) return <div>Данные не найдены</div>;

    const { new_products } = homeData;

    const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK' || product.stockQuantity === 0;

    const buildCategoryChain = (categories) => {
        if (!Array.isArray(categories) || categories.length === 0) return [];

        const chains = categories.map((category) => {
            const chain = [];
            const seen = new Set();
            let current = category;

            while (current && current.slug && !seen.has(current.slug)) {
                seen.add(current.slug);
                chain.unshift({ name: current.name, slug: current.slug });
                current = current.parent?.node;
            }

            return chain;
        });

        chains.sort((a, b) => b.length - a.length);
        return chains[0] || [];
    };

    const categoryChain = buildCategoryChain(product?.categories);

    const breadcrumbPath = [
        { name: 'Главная', href: '/' },
        ...categoryChain.map((category, index) => ({
            name: category.name,
            href: `/category/${categoryChain.slice(0, index + 1).map((item) => item.slug).join('/')}`,
        })),
        { name: product?.name, href: null, isCurrent: true },
    ];

    const handleToggleFavorite = () => {
        if (isFavorite) {
            removeFromFavorites(product.databaseId);
            setIsFavorite(false);
        } else {
            addToFavorites(product);
            setIsFavorite(true);
        }
    };

    const handleAddToCart = async () => {
        if (isAddingToCart || isInCart) return;

        // Оптимистично меняем состояние сразу
        setIsInCart(true);
        setQuantity(1);
        setIsAddingToCart(true);

        try {
            const newCart = await restApi.addToCart({
                id: product.databaseId,
                quantity: 1,
            });

            useRestCart.getState().updateCart(newCart);
            console.log("✅ Товар успешно добавлен в корзину");
        } catch (err) {
            console.error("❌ Ошибка при добавлении в корзину:", err);
            setIsInCart(false);
            alert("❌ Ошибка при добавлении товара в корзину");
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleGoToCart = () => {
        router.push('/cart/');
    };

    const handlePreorderClick = () => {
        setIsPreorderModalOpen(true);
    };

    const getCartItemForProduct = () => {
        const cartItems = useRestCart.getState().cart?.items || [];
        return cartItems.find(item =>
            item.product_id === product.databaseId ||
            item.id === product.databaseId
        );
    };

    const normalizeQuantity = (value) => {
        if (!Number.isFinite(value)) return 1;
        return Math.max(1, Math.floor(value));
    };

    const commitPendingAction = async () => {
        if (isUpdatingRef.current) {
            debounceTimerRef.current = setTimeout(commitPendingAction, 300);
            return;
        }

        const action = pendingActionRef.current;
        if (!action) return;

        pendingActionRef.current = null;

        if (action.type === 'remove') {
            await handleRemoveFromCart();
            return;
        }

        await updateQuantity(action.quantity);
    };

    const scheduleAction = (action) => {
        pendingActionRef.current = action;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            commitPendingAction();
        }, DEBOUNCE_MS);
    };

    const updateQuantity = async (nextQuantity) => {
        if (isUpdatingRef.current) return;

        setIsUpdating(true);

        try {
            const cartItem = getCartItemForProduct();
            if (!cartItem?.key) {
                console.warn('⚠️ Товар не найден в корзине');
                setIsUpdating(false);
                return;
            }

            await handleQuantityChange(cartItem.key, nextQuantity);
        } catch (err) {
            console.error("❌ Ошибка при изменении количества:", err);
            alert('❌ Ошибка при изменении количества');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleQuantityInputChange = (e) => {
        const rawValue = e.target.value;
        const parsed = parseInt(rawValue, 10);
        const nextQuantity = normalizeQuantity(parsed);

        setQuantity(nextQuantity);
        scheduleAction({ type: 'update', quantity: nextQuantity });
    };

    const handleQuantityCommit = () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!pendingActionRef.current) {
            const current = normalizeQuantity(Number(quantity));
            pendingActionRef.current = { type: 'update', quantity: current };
        }

        commitPendingAction();
    };

    const handleQuantityKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleQuantityCommit();
        }
    };

    const handleIncreaseQuantity = () => {
        const newQuantity = normalizeQuantity(quantity + 1);
        setQuantity(newQuantity);
        scheduleAction({ type: 'update', quantity: newQuantity });
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            const newQuantity = normalizeQuantity(quantity - 1);
            setQuantity(newQuantity);
            scheduleAction({ type: 'update', quantity: newQuantity });
        } else {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            pendingActionRef.current = null;
            void handleRemoveFromCart();
        }
    };

    const handleRemoveFromCart = async () => {
        if (isUpdatingRef.current) return;

        setIsUpdating(true);
        // Optimistic UI: сразу показываем, что товара нет в корзине
        setIsInCart(false);
        setQuantity(1);

        try {
            const cartItem = getCartItemForProduct();

            if (!cartItem?.key) {
                console.warn('⚠️ Товар не найден в корзине или нет key');
                setIsUpdating(false);
                return;
            }

            await handleRemoveItem(cartItem.key);

        } catch (err) {
            console.error("❌ Ошибка при удалении товара:", err);

            try {
                await fetchCart();

                const cartItems = useRestCart.getState().cart?.items || [];
                const stillInCart = cartItems.find(item =>
                    item.product_id === product.databaseId ||
                    item.id === product.databaseId
                );

                setIsInCart(!!stillInCart);
                setQuantity(stillInCart?.quantity || 1);
            } catch (refreshErr) {
                console.error("❌ Ошибка при обновлении корзины:", refreshErr);
                alert('❌ Ошибка при удалении товара');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    console.log('DEBUG:', {
        'product.id': product?.id,
        'product.databaseId': product?.databaseId,
        'isInCart': isInCart,
        'quantity': quantity,
        'isUpdating': isUpdating,
        'cartItems': cart?.items?.length || 0,
    });

    return (
        <section className="product-card">
            <div className="container product-card__container">
                <Breadcrumbs categoryPath={breadcrumbPath} />
                <div className="product-card__main">
                    <ProductGallery
                        galleryImages={product.galleryImages}
                        productName={product.name}
                        productImage={product.image?.sourceUrl}
                    />
                    <div className="product-card__descr">
                        <div className="product-card__descr-art">Артикул: {product.sku || '123124'}</div>
                        <div className="product-card__descr-main">{product.name}</div>

                        <div className="product-card__descr-price">
                            <span>Цена:</span>
                            <div className="price-action-wr">
                                <div className="price-wrapper">
                                    <div className="action-price">{formatPrice(product.price)}</div>
                                    {product.hasDiscount && (
                                        <div className="old-price">{formatPrice(product.regularPrice)}</div>
                                    )}
                                </div>
                                {product.hasDiscount && (
                                    <div className="price-action-percent">
                                        -{product.discountPercent}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {isOutOfStock && (
                            <span className="product-card__out-of-stock-inline">Временно нет в наличии</span>
                        )}

                        {isOutOfStock ? (
                            <button
                                className="new-items__one-click button"
                                type="button"
                                onClick={handlePreorderClick}
                            >
                                Оформить предзаказ
                            </button>
                        ) : !isInCart ? (
                            <button
                                className="product-card__order-button button"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                style={{
                                    opacity: isAddingToCart ? 0.6 : 1,
                                    cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {isAddingToCart ? 'Обновляем' : 'Купить'}
                            </button>
                        ) : (
                            <div className="product-card__incart-wrapper">
                                <button
                                    className="product-card__order-button-incart button"
                                    onClick={handleGoToCart}
                                    disabled={isUpdating}
                                >
                                    Товар в корзине
                                </button>
                                <div className="product-card__product-quantity">
                                    <button
                                        className="button product-card__product-minus"
                                        onClick={handleDecreaseQuantity}
                                        disabled={isUpdating}
                                        title={isUpdating ? "Обновление..." : "Уменьшить количество"}
                                    >
                                        <img src="/images/minus.svg" alt="minus" />
                                    </button>
                                    <input
                                        className="product-card__product-count"
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={handleQuantityInputChange}
                                        onBlur={handleQuantityCommit}
                                        onKeyDown={handleQuantityKeyDown}
                                        disabled={isUpdating}
                                    />
                                    <button
                                        className="button product-card__product-plus"
                                        onClick={handleIncreaseQuantity}
                                        disabled={isUpdating}
                                        title={isUpdating ? "Обновление..." : "Увеличить количество"}
                                    >
                                        <img src="/images/plus.svg" alt="plus" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="product-card__descr-favourite">
                            <button
                                className="product-card__descr-favourite-icon"
                                onClick={handleToggleFavorite}
                                disabled={isUpdating}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    padding: 0,
                                    opacity: isUpdating ? 0.6 : 1,
                                }}
                            >
                                <img
                                    src={isFavorite ? "/icons-header/heart-red.svg" : "/images/favorites.svg"}
                                    alt={isFavorite ? "favorite" : "add to favourite"}
                                />
                            </button>
                            <button
                                className="product-card__descr-favourite-name"
                                onClick={handleToggleFavorite}
                                disabled={isUpdating}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    color: isFavorite ? '#e74c3c' : '#333',
                                    textDecoration: 'none',
                                    fontSize: 'inherit',
                                    fontWeight: 'inherit',
                                    padding: 0,
                                    opacity: isUpdating ? 0.6 : 1,
                                }}
                            >
                                {isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                            </button>
                        </div>

                        {product.characteristics && product.characteristics.length > 0 ? (
                            <div className="product-card__descr-char">
                                {product.characteristics.map((char, idx) => (
                                    <div key={idx} className="char-row">
                                        <div className="char-name">
                                            {char.naimenovanie || char.name || char.label}
                                        </div>
                                        <div className="char-value">
                                            {char.znachenie || char.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : product.attributes && product.attributes.length > 0 ? (
                            <div className="product-card__descr-char">
                                {product.attributes.map((attr, idx) => (
                                    <div key={idx} className="char-row">
                                        <div className="char-name">{attr.name}</div>
                                        <div className="char-value">{attr.options?.join(', ') || '-'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {product && Object.keys(product).length > 0 && (
                    <Tabs product={product} />
                )}
            </div>
            <OneClickModal
                product={product}
                isOpen={isPreorderModalOpen}
                onClose={() => setIsPreorderModalOpen(false)}
                isPreorder
            />
            <NewItems products={new_products} />
        </section>
    );
};

export default Product_cart;

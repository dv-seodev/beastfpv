'use client';

import Link from "next/link";
import { useFavoriteStore } from '../../stores/favoriteStore';
import { useProductsList } from '../../lib/ProductsListController';
import ProductListItem from "../../components/ProductListElement";
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import api from "../../lib/api";

const FavoritePage = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const { addCartProduct } = useProductsList();
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // 1️⃣ Синхронизируем ID из localStorage
    useEffect(() => {
        setIsMounted(true);

        // Инициализируем ID из localStorage
        const initialIds = useFavoriteStore.getAllFavorites();
        setFavoriteIds(initialIds);

        // Слушаем изменения избранного
        const handleUpdate = () => {
            setFavoriteIds(useFavoriteStore.getAllFavorites());
        };

        window.addEventListener('favoritesChanged', handleUpdate);
        return () => window.removeEventListener('favoritesChanged', handleUpdate);
    }, []);

    // 2️⃣ GraphQL запрос товаров по ID
    const { data, loading, error, refetch } = useQuery(
        api.getProductsByIds(favoriteIds),
        {
            variables: { include: favoriteIds },
            skip: !isMounted || favoriteIds.length === 0,
        }
    );

    const products = data?.products?.nodes || [];

    // 3️⃣ Пересчитываем, когда меняются ID
    useEffect(() => {
        if (isMounted && favoriteIds.length > 0) {
            refetch({ include: favoriteIds });
        }
    }, [favoriteIds, isMounted, refetch]);

    // 4️⃣ До гидрации не рендерим
    if (!isMounted) return null;

    // 5️⃣ Загрузка
    if (loading) {
        return (
            <section className="popular-products favoritepage">
                <div className="container popular-products__container favoritepage__container">
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        Загрузка избранного...
                    </div>
                </div>
            </section>
        );
    }

    // 6️⃣ Ошибка GraphQL
    if (error) {
        return (
            <section className="popular-products favoritepage">
                <div className="container popular-products__container favoritepage__container">
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                        Ошибка загрузки: {error.message}
                    </div>
                </div>
            </section>
        );
    }

    // 7️⃣ Пусто
    if (favoriteIds.length === 0 || products.length === 0) {
        return (
            <section className="popular-products favoritepage">
                <div className="container popular-products__container favoritepage__container">
                    <div className="popular-products__header">
                        <h2>Понравившиеся товары</h2>
                    </div>
                    <div className="popular-products__items-grid">
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#999'
                        }}>
                            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                                Ваше избранное пусто
                            </p>
                            <Link href="/" className="link__show-all">
                                <span>Продолжить покупки</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // 8️⃣ Рендер товаров
    return (
        <section className="popular-products favoritepage">
            <div className="container popular-products__container favoritepage__container">
                <div className="popular-products__header">
                    <h2>Понравившиеся товары ({products.length})</h2>
                </div>
                <div className="popular-products__items-grid">
                    {products.map((product) => (
                        <ProductListItem
                            key={product.databaseId}
                            product={product}
                            onAddCart={addCartProduct}
                        />
                    ))}
                </div>
                <div className="link__show-all mobile-show">
                    <Link href="/catalog">
                        <span className="show-all">К каталогу</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FavoritePage;

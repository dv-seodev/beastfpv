'use client';

import Link from "next/link";
import { useFavoriteStore } from '../../stores/favoriteStore';
import { useProductsList } from '../../lib/ProductsListController';
import ProductListItem from "../../components/ProductListElement";


const FavoritePage = () => {
    const favoriteItems = useFavoriteStore(state => state.getAllFavorites());
    const { addCartProduct, formatPrice } = useProductsList();

    const handleAddCart = (product) => {
        addCartProduct(product);
    };

    if (favoriteItems.length === 0) {
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

    return (
        <section className="popular-products favoritepage">
            <div className="container popular-products__container favoritepage__container">
                <div className="popular-products__header">
                    <h2>Понравившиеся товары </h2>
                </div>
                <div className="popular-products__items-grid">
                    {favoriteItems.map((product) => (
                        <ProductListItem
                            product={product}
                            key={product.id}
                            onAddCart={handleAddCart}
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
}

export default FavoritePage;
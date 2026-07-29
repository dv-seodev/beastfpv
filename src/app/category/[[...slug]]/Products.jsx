import LoadMore from '../../news/LoadMore';
import Link from "next/link";
import './Products.scss';
import { useState, useEffect } from 'react';
// ✅ ИЗМЕНЕНИЕ: Используем новый useRestCart вместо старого useCartStore
import { useRestCart } from '../../../lib/hooks/useRestCart';
import { useProductsList } from '../../../lib/ProductsListController';
import ProductListItem from '../../../components/ProductListElement';
import OneClickModal from '../../../components/OneClickModal';

const Products = ({ categoryName, products, slug }) => {
    const { formatPrice } = useProductsList();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreorder, setIsPreorder] = useState(false);

    // ✅ ИЗМЕНЕНИЕ: Получаем корзину из useRestCart
    const { cart, fetchCart } = useRestCart();

    // ✅ ИЗМЕНЕНИЕ: Загружаем корзину при монтировании компонента
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ✅ ИЗМЕНЕНИЕ: Вычисляем ID товаров в корзине один раз для всех ProductListItem
    // Это предотвращает множественные запросы в каждом компоненте
    const cartProductIds = new Set(
        (cart?.items || []).map(item => item.product_id || item.id)
    );

    // ✅ ИЗМЕНЕНИЕ: Удаляем handleAddCart (больше не нужен, логика в ProductListItem)
    const handleOneClick = (product, options = {}) => {
        setSelectedProduct(product);
        setIsPreorder(!!options.isPreorder);
        setIsModalOpen(true);
    };

    const sortedProducts = [...products].sort((a, b) => {
        const getPriority = (product) => {
            switch (product.stockStatus) {
                case 'IN_STOCK':
                    return 0;
                case 'ON_BACKORDER':
                    return 1;
                case 'OUT_OF_STOCK':
                default:
                    return 2;
            }
        };

        return getPriority(a) - getPriority(b);
    });

    return (
        <div className="products">
            <h1>{categoryName || "Название категории"}</h1>
            {/* <div className="products__items-grid">
                {products.map((product, index) => (
                    <ProductListItem
                        key={`${product.databaseId || product.id}-${index}`}
                        product={product}
                        isInCart={cartProductIds.has(product.databaseId)}
                        onOneClick={handleOneClick}
                    />
                ))}
            </div> */}

            <div className="products__items-grid">
                {sortedProducts.map((product, index) => (
                    <ProductListItem
                        key={`${product.databaseId || product.id}-${index}`}
                        product={product}
                        isInCart={cartProductIds.has(product.databaseId)}
                        onOneClick={handleOneClick}
                    />
                ))}
            </div>
            {/* <LoadMore /> */}
            {selectedProduct && (
                <OneClickModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    isPreorder={isPreorder}
                />
            )}
        </div>
    );
}

export default Products;

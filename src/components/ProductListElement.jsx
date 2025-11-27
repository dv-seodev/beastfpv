"use client";

import Link from "next/link";

import { useProductsList } from '../lib/ProductsListController';

function ProductListItem({ product, onAddCart }) {
    const { addCartProduct, formatPrice } = useProductsList();

    return (
        <div key={product.id} className="new-items__item popular-products__item">
            <Link href={`/product/${product.slug}`}>
                <img
                    src={product.image.sourceUrl}
                    alt={product.name}
                />
            </Link>

            <Link href={`/product/${product.slug}`}>
                <div className="new-items__name new-slider">
                    {product.name}
                </div>
            </Link>

            <div className="new-items__price-wrapper">
                <span className="new-items__price">
                    {formatPrice(product.price)}
                </span>
                <button
                    className="new-items__cart-button button"
                    onClick={() => onAddCart(product)}
                    type="button"
                >
                </button>
            </div>

            <button
                className="new-items__one-click button"
                type="button"
            >
                Купить в один клик
            </button>
        </div>
    );
}

export default ProductListItem;
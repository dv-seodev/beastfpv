import Link from "next/link";
import './Popular_products.scss';
import { useCartStore } from '../stores/cartStore';
import { useProductsList } from '../lib/ProductsListController';
import ProductListItem from "./ProductListElement";

const PopularProducts = ({ products }) => {

    const { addCartProduct, formatPrice } = useProductsList();

    const handleAddCart = (product) => {
        addCartProduct(product);
    };


    return (
        <section className="popular-products">
            <div className="container popular-products__container">
                <div className="popular-products__header">
                    <h2>Популярные товары</h2>
                    <Link className="link__show-all desktop-show" href="/">
                        <span>Смотреть все</span>
                    </Link>
                </div>
                <div className="popular-products__items-grid">
                    {products.map((product) => (
                        <ProductListItem
                            product={product}
                            key={product.id}
                            onAddCart={handleAddCart}
                        />
                    ))}
                </div>
                <div className="link__show-all mobile-show">
                    <Link href="/">
                        <span className="show-all">Все популярные</span>
                    </Link>
                </div>
            </div>
        </section >
    );
}

export default PopularProducts;
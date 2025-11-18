import Link from "next/link";
import './Popular_products.scss';
import { useCartStore } from '../stores/cartStore';
import { useProductsList } from '../lib/ProductsListController';

const PopularProducts = ({ products }) => {

    const { addCartProduct, formatPrice } = useProductsList();

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

                        <div key={product.id} className="popular-products__item">
                            <Link href={`/product/${product.slug}`}>
                                <img src={product.image.sourceUrl} alt={product.name} />
                            </Link>
                            <Link href={`/product/${product.slug}`}><span className="popular-products__name">{product.name}</span></Link>
                            <div className="popular-products__price-wrapper">
                                <span className="popular-products__price">{formatPrice(product.price)}</span>
                                <button className="popular-products__cart-button button" onClick={() => addCartProduct(product)}>
                                </button>
                            </div>
                            <button className="popular-products__one-click button">Купить в один клик</button>
                        </div>
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
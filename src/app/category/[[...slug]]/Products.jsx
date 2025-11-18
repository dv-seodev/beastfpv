import LoadMore from '../../news/LoadMore';
import './Products.scss'
import Link from "next/link";
import { useProductsList } from '../../../lib/ProductsListController';

const Products = ({ categoryName, products, slug }) => {
    console.log('Props в Products:', { categoryName, products });

    const { addCartProduct, formatPrice } = useProductsList();

    return (
        <div className="products">
            <h1>{categoryName || "Название категории"}</h1>
            <div className="products__items-grid">
                {products.map((product) => (
                    <div key={product.id} className="products__item">
                        <Link href={`/product/${product.slug}`}>
                            <img src={product.image.sourceUrl} alt={product.name} />
                        </Link>
                        <Link href={`/product/${product.slug}`}>
                            <span className="products__name">{product.name}</span>
                        </Link>
                        <div className="products__price-wrapper">
                            <span className="products__price">{formatPrice(product.price)}</span>
                            <button
                                className="products__cart-button button"
                                onClick={() => addCartProduct(product)}
                            >
                            </button>
                        </div>
                        <button className="products__one-click button">
                            Купить в один клик
                        </button>
                    </div>
                ))}
            </div>
            <LoadMore />
        </div>

    );
}

export default Products;
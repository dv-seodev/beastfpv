import LoadMore from '../../news/LoadMore';
import './Products.scss'
import Link from "next/link";
import { useProductsList } from '../../../lib/ProductsListController';
import ProductListItem from '../../../components/ProductListElement';

const Products = ({ categoryName, products, slug }) => {
    console.log('Props в Products:', { categoryName, products });

    const { addCartProduct, formatPrice } = useProductsList();

    const handleAddCart = (product) => {
        addCartProduct(product);
    };

    return (
        <div className="products">
            <h1>{categoryName || "Название категории"}</h1>
            <div className="products__items-grid">
                {products.map((product) => (
                    <ProductListItem
                        product={product}
                        key={product.id}
                        onAddCart={handleAddCart}
                    />
                ))}
            </div>
            <LoadMore />
        </div>

    );
}

export default Products;
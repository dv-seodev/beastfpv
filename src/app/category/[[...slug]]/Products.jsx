import LoadMore from '../../news/LoadMore';
import Link from "next/link";
import './Products.scss';
import { useState } from 'react';
import { useProductsList } from '../../../lib/ProductsListController';
import ProductListItem from '../../../components/ProductListElement';
import OneClickModal from '../../../components/OneClickModal';


const Products = ({ categoryName, products, slug }) => {
    const { addCartProduct, formatPrice } = useProductsList();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddCart = (product) => {
        addCartProduct(product);
    };

    const handleOneClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
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
                        onOneClick={handleOneClick}
                    />
                ))}
            </div>
            <LoadMore />
            {selectedProduct && (
                <OneClickModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>

    );
}

export default Products;
// const SearchLine = () => {
//     return (
//         <div className="header__search">
//             <input className="header__search-input" type="text" placeholder="Введите запрос"></input>
//             <button className="header__search-button">
//                 <img src="/icons-header/search.svg" alt={"search"} />
//             </button>
//         </div>
//     );
// }

// export default SearchLine;


'use client';

import { useState } from 'react';
import { useSearchProducts } from '../../lib/useSearchProducts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductsList } from '../../lib/ProductsListController';

const SearchLine = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const { search, products, loading, error } = useSearchProducts();
    const router = useRouter();
    const { addCartProduct, formatPrice } = useProductsList();

    // Поиск при вводе
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim().length >= 2) {
            setShowResults(true);
            search(value);
        } else {
            setShowResults(false);
        }
    };

    // Нажатие на Enter
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter') {
            if (searchTerm.trim().length >= 2) {
                router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
                setShowResults(false);
            }
        }
    };

    // Клик на товар из результатов
    const handleProductClick = (slug) => {
        router.push(`/product/${slug}`);
        setShowResults(false);
        setSearchTerm('');
    };

    // Клик на кнопку поиска
    const handleSearchButtonClick = () => {
        if (searchTerm.trim().length >= 2) {
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
            setShowResults(false);
        }
    };

    return (
        <div className="header__search" style={{ position: 'relative' }}>
            <input
                className="header__search-input"
                type="text"
                placeholder="Введите запрос"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
            />
            <button
                className="header__search-button"
                onClick={handleSearchButtonClick}
            >
                <img src="/icons-header/search.svg" alt="search" />
            </button>

            {/* ВЫПАДАЮЩИЕ РЕЗУЛЬТАТЫ */}
            {showResults && searchTerm.trim().length >= 2 && (
                <div className="header__search-results">
                    {loading && <div className="search-result-item">Загрузка...</div>}
                    {error && <div className="search-result-item">Ошибка поиска</div>}
                    {!loading && products.length === 0 && <div className="search-result-item">Товары не найдены</div>}

                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="search-result-item"
                            onClick={() => handleProductClick(product.slug)}
                        >
                            {product.image && (
                                <img
                                    src={product.image.sourceUrl}
                                    alt={product.image.altText || product.name}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        marginRight: '10px',
                                        borderRadius: '4px'
                                    }}
                                />
                            )}
                            <div>
                                <div style={{ fontWeight: '500' }}>{product.name}</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>{formatPrice(product.price)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchLine;
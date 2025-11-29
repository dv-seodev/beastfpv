'use client';

import Link from 'next/link';
import './Filter.scss';

const Filter = ({ categories = [] }) => {
    if (!categories || categories.length === 0) {
        return (
            <div className="filter">
                <div className="filter__item">
                    <div className="filter__item-header">Категории товаров</div>
                    <p>Категории загружаются...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="filter">
            <div className="filter__item">
                <div className="filter__item-header">Категории товаров</div>

                {/* ДИНАМИЧЕСКИЕ КАТЕГОРИИ */}
                {categories.map((category) => (
                    <details key={category.id} className="filter__categories">
                        <summary className="filter__categories-title">
                            {category.name}
                        </summary>

                        {/* ПОДКАТЕГОРИИ */}
                        <div className="filter__categories-content">
                            {category.subcategories && category.subcategories.length > 0 ? (
                                category.subcategories.map((subcategory) => (
                                    <Link
                                        key={subcategory.id}
                                        href={subcategory.href}
                                        className="filter__categories-content-item"
                                    >
                                        {subcategory.name}
                                    </Link>
                                ))
                            ) : (
                                <div className="filter__categories-content-item">
                                    Нет подкатегорий
                                </div>
                            )}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default Filter;

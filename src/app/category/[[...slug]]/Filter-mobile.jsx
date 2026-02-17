'use client';

import Link from 'next/link';
import './Filter-mobile.scss';

const staticCategories = [
    { id: 'static-actions', name: 'DJI', href: '/category/dji/' },
    { id: 'static-popular', name: 'Хиты продаж', href: '/category/popular/' },
    { id: 'static-new', name: 'Новинки', href: '/category/new/' },
];

const Filter_mobile = ({ categories = [], isOpen, onClose }) => {
    if (!categories || categories.length === 0) {
        return (
            <div className="filter-mobile">
                <div className='filter-mobile__item-header'>Фильтр</div>
                <div className="filter-mobile__item">
                    <p>Категории загружаются...</p>
                </div>
            </div>
        );
    }

    const handleCategoryClick = () => {
        if (onClose) onClose();
    };

    const visibleCategories = categories.filter((category) => {
        const slug = (category.slug || '').toLowerCase();
        return category.id !== 19 && slug !== 'new' && slug !== 'popular';
    });


    return (
        <div className={`filter-mobile ${isOpen ? 'filter-mobile--open' : ''}`}>
            <div
                className="filter-mobile__overlay"
                onClick={onClose}
            />

            <div className="filter-mobile__content">
                {/* <div className='filter-mobile__item-header'>
                    <span>Фильтр</span>
                    <button
                        type="button"
                        className="filter-mobile__close-btn"
                        onClick={onClose}
                    >
                        <img src="/icons-header/cross-black.svg" alt="close" />
                    </button>
                </div> */}

                <div className="filter-mobile__item">
                    <div className='filter-mobile__wrapper'>
                        <div className="filter-mobile__item-header">Категории товаров</div>
                        <button
                            type="button"
                            className="filter-mobile__close-btn"
                            onClick={onClose}
                        >
                            <img src="/icons-header/cross-black.svg" alt="close" />
                        </button>
                    </div>

                    {/* ДИНАМИЧЕСКИЕ КАТЕГОРИИ */}
                    {visibleCategories.map((category) => {
                        const hasSubcategories = category.subcategories && category.subcategories.length > 0;

                        // Если нет подкатегорий - просто ссылка
                        if (!hasSubcategories) {
                            return (
                                <Link
                                    key={category.id}
                                    href={category.href}
                                    className="filter-mobile__categories-link"
                                    onClick={handleCategoryClick}
                                >
                                    {category.name}
                                </Link>
                            );
                        }

                        // Если есть подкатегории - раскрывающееся меню
                        return (
                            <details key={category.id} className="filter-mobile__categories">
                                <summary className="filter-mobile__categories-title">
                                    {category.name}
                                </summary>

                                {/* ПОДКАТЕГОРИИ */}
                                <div className="filter-mobile__categories-content">
                                    {category.subcategories.map((subcategory) => (
                                        <Link
                                            key={subcategory.id}
                                            href={subcategory.href}
                                            className="filter-mobile__categories-content-item"
                                            onClick={handleCategoryClick}
                                        >
                                            {subcategory.name}
                                        </Link>
                                    ))}
                                </div>
                            </details>
                        );
                    })}

                    {staticCategories.map((category) => (
                        <Link
                            key={category.id}
                            href={category.href}
                            className="filter-mobile__categories-link"
                            onClick={handleCategoryClick}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Filter_mobile;

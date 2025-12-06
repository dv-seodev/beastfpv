'use client';

import Link from 'next/link';
import './MobileMenu.scss';

const MobileMenu = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Оверлей */}
            {isOpen && (
                <div
                    className="mobile-menu__overlay"
                    onClick={onClose}
                />
            )}

            {/* Меню */}
            <div
                className={`mobile-menu ${isOpen ? 'mobile-menu--open' : ''}`}
                suppressHydrationWarning
            >
                <div className="mobile-menu__close">
                    <button
                        className="mobile-menu__close-btn"
                        onClick={onClose}
                    >
                        <img
                            className="icon-cross-mobile"
                            src="/icons-header/cross-black.svg"
                            alt="close"
                        />
                    </button>
                </div>


                <div className="mobile-menu__catalog">
                    <Link
                        className="mobile-menu__links-item mobile-heading"
                        href="/"
                        onClick={onClose}
                    >
                        Каталог
                    </Link>
                    <Link
                        className="mobile-menu__links-item"
                        href="/category/fpv/"
                        onClick={onClose}
                    >
                        FPV-дроны
                    </Link>
                    <Link
                        className="mobile-menu__links-item"
                        href="/category/accessory/"
                        onClick={onClose}
                    >
                        DJI
                    </Link>
                    <Link
                        className="mobile-menu__links-item"
                        href="/category/dji/"
                        onClick={onClose}
                    >
                        Комплектующие
                    </Link>
                    <Link
                        className="mobile-menu__links-item"
                        href="/"
                        onClick={onClose}
                    >
                        Хиты продаж
                    </Link>
                    <Link
                        className="mobile-menu__links-item"
                        href="/"
                        onClick={onClose}
                    >
                        Новинки
                    </Link>
                </div>

                <div className="mobile-menu__service-links">
                    <Link
                        className="mobile-menu__links-item mobile-heading"
                        href="/"
                        onClick={onClose}
                    >
                        Бонусы и скидки
                    </Link>
                    <Link
                        className="mobile-menu__links-item mobile-heading"
                        href="/"
                        onClick={onClose}
                    >
                        Доставка и оплата
                    </Link>
                    <Link
                        className="mobile-menu__links-item mobile-heading"
                        href="/"
                        onClick={onClose}
                    >
                        Гарантия и возврат
                    </Link>
                    <Link
                        className="mobile-menu__links-item mobile-heading"
                        href="/contacts/"
                        onClick={onClose}
                    >
                        Контакты
                    </Link>
                </div>
            </div>
        </>
    );
}

export default MobileMenu;

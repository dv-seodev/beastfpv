
'use client';

import Link from 'next/link';
import './Header.scss';
import CartIcon from './CartItem';
import { useFavoriteStore } from '../../stores/favoriteStore';
import { useEffect, useState } from 'react';
import SearchLine from './SearchLine';
import { useProductsList } from '../../lib/ProductsListController';
import MobileMenu from './MobileMenu';

const Header = () => {
    const favoriteItems = useFavoriteStore(state => state.getAllFavorites());
    const [isMounted, setIsMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ← State для меню

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Закрываем меню при клике на ссылку
    const handleMenuClose = () => {
        setMobileMenuOpen(false);
    };

    // До монтирования показываем обычную иконку
    const hasFavorites = isMounted ? favoriteItems.length > 0 : false;
    return (
        <header className="header">
            <div className="header__upper">
                <div className="container header__container">
                    <nav className="header__about-links">
                        <Link className="header__links-item" href="/">Бонусы и скидки</Link>
                        <Link className="header__links-item" href="/">Доставка и оплата</Link>
                        <Link className="header__links-item" href="/">Гарантия и возврат</Link>
                        <Link className="header__links-item" href="/contacts/">Контакты</Link>
                    </nav>
                    <div className="header__contacts_info">
                        <div><span className="header__adress-links">Пн-Пт: 9.00 - 21.00, Cб: 11.00 - 16.00, Вс: выходной</span></div>
                        <div><span className="header__adress-links">Адрес: Москва, пр-т. Мира, 102, стр. 31</span></div>
                    </div>
                </div>
            </div>
            <div className="header__main">
                <div className="container header__container">
                    <div className="header__logo">
                        <Link href="/">
                            <img src="/icons-header/logo.svg" className="header__image-logo" alt="beastfpv.ru - логотип" />
                        </Link>
                    </div>
                    <div className="header__main-menu">
                        <div className="menu-container">
                            <button className="header__catalog-button">
                                <span className="header__button-name">Каталог</span>
                                <img className="icon-menu" src="/icons-header/burger.svg" />
                                <img className="icon-cross" src="/icons-header/cross.svg" />
                            </button>
                            <nav className="header__main-menu-nav">
                                <div className="header__links-item-nav rel-menu">
                                    <Link href="">FPV-дроны</Link>
                                    <div className="header__links-submenu">
                                        <Link className="header__links-item-submenu" href="/category/fpv/7-inch/">7 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/category/fpv/9-inch/">9 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/category/fpv/10-inch/">10 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/category/fpv/11-inch/">11 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/category/fpv/13-inch/">13 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/category/fpv/15-inch/">13 дюймов</Link>
                                    </div>
                                </div>
                                <Link className="header__links-item-nav" href="/">DJI</Link>
                                <div className="header__links-item-nav rel-menu">
                                    <Link href="">Комплектующие</Link>
                                    <div className="header__links-submenu" style={{ right: -240 }}>
                                        <Link className="header__links-item-submenu" href="/category/accessory/akkumulyatory/">Аккумуляторы</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/antenny-dlya-fpv-dronov/">Антенны</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/videoperedatchiki-dlya-fpv-dronov/">Видеопередатчики</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/videopriemniki-dlya-fpv-dronov/">Видеоприемники</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/zaryadnye-ustrojstva-dlya-fpv-dronov/">Зарядные устройства</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/kamery-dlya-fpv-dronov/">Камеры</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/kontrollery-poleta-dlya-fpv/">Контроллеры полета</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/moduli-dlya-fpv-dronov/">Модули-передатчики для FPV</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/motory-dlya-fpv-dronov/">Моторы</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/nabory-instrumentov-dlya-fpv/">Наборы инструментов для FPV</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/ochki-dlya-fpv-dronov/">Очки</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/priemniki-dlya-fpv/">Приемники</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/propellery-dlya-fpv-dronov/">Пропеллеры</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/prochie-tovary-dlya-fpv/">Прочие товары для FPV</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/pulty-upravleniya-fpv-dronami/">Пульты управления FPV дронами</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/ramy-dlya-fpv-dronov/">Рамы</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/retranslyatory-dlya-fpv-dronov/">Ретрансляторы</Link>
                                        <Link className="header__links-item-submenu" href="/category/accessory/usiliteli-signala-dlya-fpv-dronov/">Усилители сигнала</Link>
                                    </div>
                                </div>
                                <Link className="header__links-item-nav" href="/">Хиты продаж</Link>
                                <Link className="header__links-item-nav" href="/">Новинки</Link>
                            </nav>
                        </div>
                    </div>

                    <SearchLine />

                    <div className="header__contacts-info">
                        <Link className="icon-action" href="mailto:order@beastfpv.ru"><img src="/icons-header/mail-new.png" alt={"mail"} /></Link>
                        <Link className='icon-action' href="tel:+74954878782"><img src="/icons-header/phone.png" alt={"phone"} /></Link>
                        <Link href="tel:+74954878782">+7 (495) 487-87-82</Link>
                    </div>
                    <div className="header__profile">
                        {/* <Link className='icon-action header__mobile-invisible' href="/favorite/"><img src="/icons-header/heart.svg" alt={"favorite"} /></Link> */}
                        <Link
                            className='icon-action header__mobile-invisible'
                            href="/favorite/"
                        >
                            <img
                                src={hasFavorites ? "/icons-header/heart-red.svg" : "/icons-header/heart.svg"}
                                alt="favorite"
                            />
                        </Link>
                        <Link className='icon-action header__mobile-visible' href=""><img src="/icons-header/search-mobile.svg" alt={"search-icon"} /></Link>
                        <CartIcon />
                        {/* <Link className='icon-action' href=""><img src="/icons-header/basket.svg" alt={"mail"} /></Link> */}
                        <Link className='icon-action menu-mobile-icon header__mobile-visible' href="" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><img src="/icons-header/menu-mobile.svg" alt={"mail"} /></Link>
                        <Link className='icon-action header__mobile-invisible' href=""><img src="/icons-header/account.svg" alt={"account"} /></Link>

                    </div>
                </div>
            </div >

            <MobileMenu isOpen={mobileMenuOpen}
                onClose={handleMenuClose} />
        </header >
    );
}

export default Header;
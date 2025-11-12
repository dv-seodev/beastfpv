import Link from 'next/link';
import './Header.scss';

const Header = () => {
    return (
        <header className="header">
            <div className="header__upper">
                <div className="container header__container">
                    <nav className="header__about-links">
                        <Link className="header__links-item" href="/">Бонусы и скидки</Link>
                        <Link className="header__links-item" href="/">Доставка и оплата</Link>
                        <Link className="header__links-item" href="/">Гарантия и возврат</Link>
                        <Link className="header__links-item" href="/contacts">Контакты</Link>
                    </nav>
                    <div className="header__contacts_info">
                        <div><span className="header__adress-links">Пн.-Пт. с 10.00 до 20.00, Cб.-Вс. с 10.00 до 18.00</span></div>
                        <div><span className="header__adress-links">Адрес: Москва, ул. Ленина 17-а оф. 17</span></div>
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
                                <Link className="header__links-item-nav" href="/">DJI</Link>
                                <div className="header__links-item-nav rel-menu">
                                    <Link href="">FPV-дроны</Link>
                                    <div className="header__links-submenu">
                                        <Link className="header__links-item-submenu" href="/">9 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/">10 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/">11 дюймов</Link>
                                        <Link className="header__links-item-submenu" href="/">13 дюймов</Link>
                                    </div>
                                </div>
                                <Link className="header__links-item-nav" href="/">Аксессуары</Link>
                                <Link className="header__links-item-nav" href="/">Комплектующие</Link>
                                <Link className="header__links-item-nav" href="/">Хиты продаж</Link>
                                <Link className="header__links-item-nav" href="/">Новинки</Link>
                            </nav>
                        </div>
                    </div>

                    <div className="header__search">
                        <input className="header__search-input" type="text" placeholder="Введите запрос"></input>
                        <button className="header__search-button">
                            <img src="/icons-header/search.svg" alt={"search"} />
                        </button>
                    </div>
                    <div className="header__contacts-info">
                        <Link className="icon-action" href="mailto:order@beastfpv.ru"><img src="/icons-header/mail-new.png" alt={"mail"} /></Link>
                        <Link className='icon-action' href="tel:+78001231212"><img src="/icons-header/phone.png" alt={"phone"} /></Link>
                        <Link href="tel:+78001231212">+7 (800)123-12-12</Link>
                    </div>
                    <div className="header__profile">
                        <Link className='icon-action header__mobile-invisible' href="/favorite/"><img src="/icons-header/heart.svg" alt={"favorite"} /></Link>
                        <Link className='icon-action header__mobile-visible' href=""><img src="/icons-header/search-mobile.svg" alt={"basket"} /></Link>
                        <Link className='icon-action' href=""><img src="/icons-header/basket.svg" alt={"mail"} /></Link>
                        <Link className='icon-action menu-mobile-icon header__mobile-visible' href=""><img src="/icons-header/menu-mobile.svg" alt={"mail"} /></Link>
                        <Link className='icon-action header__mobile-invisible' href=""><img src="/icons-header/account.svg" alt={"account"} /></Link>

                    </div>
                </div>
            </div >
        </header >
    );
}

export default Header;
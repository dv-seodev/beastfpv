
import Link from 'next/link';
import './MobileMenu.scss';

const MobileMenu = () => {
    return (
        <div className="mobile-menu">
            <div className="mobile-menu__close">
                <img className="icon-cross-mobile" src="/icons-header/cross-black.svg" />
            </div>
            <div className="mobile-menu__catalog">
                <Link className="mobile-menu__links-item mobile-heading" href="/">Каталог</Link>
                <Link className="mobile-menu__links-item" href="/">DJI</Link>
                <Link className="mobile-menu__links-item" href="/">FPV-дроны
                </Link>
                <Link className="mobile-menu__links-item" href="/">Аксессуары</Link>
                <Link className="mobile-menu__links-item" href="/">Комплектующие</Link>
                <Link className="mobile-menu__links-item" href="/">Хиты продаж</Link>
                <Link className="mobile-menu__links-item" href="/">Новинки</Link>
            </div>
            <div className="mobile-menu__service-links">
                <Link className="mobile-menu__links-item mobile-heading" href="/">Бонусы и скидки</Link>
                <Link className="mobile-menu__links-item mobile-heading" href="/">Доставка и оплата</Link>
                <Link className="mobile-menu__links-item mobile-heading" href="/">Гарантия и возврат</Link>
                <Link className="mobile-menu__links-item mobile-heading" href="/">Контакты</Link>
            </div>
        </div>
    );
}

export default MobileMenu;
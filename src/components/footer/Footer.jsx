import Link from 'next/link';
import './Footer.scss'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer__container">
                <div className="footer__logo-links footer__navy">
                    <span className="footer__links-header">Наша техника</span>
                    <nav className="footer__popular-links footer__links_navy">
                        <Link className="footer__links-item" href="/">FPV</Link>
                        <Link className="footer__links-item" href="/">DJI</Link>
                        <Link className="footer__links-item" href="/">Комплектующие</Link>
                    </nav>
                    <div className="footer__logo">
                        <Link href="/">
                            <img src="/icons-footer/footer_logo.svg" className="footer__image-logo" />
                        </Link>
                    </div>

                </div>
                <div className="footer__social footer__navy">
                    <span className="footer__links-header">Каталог</span>
                    <nav className="footer__popular-links footer__links_navy">
                        <Link className="footer__links-item" href="/">Дроны</Link>
                        <Link className="footer__links-item" href="/">Оборудование</Link>
                        <Link className="footer__links-item" href="/">Аксессуары</Link>
                    </nav>
                    <div className="footer__social-links footer__links_navy">
                        <Link className="icon-link" href="/favorite/"><img src="/icons-footer/facebook_black.png" /></Link>
                        <Link className="icon-link" href=""><img src="/icons-footer/twitch_black.png" /></Link>
                        <Link className="icon-link" href=""><img src="/icons-footer/twitter_black.png" /></Link>
                        <Link className="icon-link" href=""><img src="/icons-footer/youtube_black.png" /></Link>
                    </div>
                </div>
                <div className="footer__contacts-info footer__navy">
                    <span className="footer__links-header">Контакты</span>
                    <div className="footer__contacts-links footer__links_navy">
                        <Link className="footer__links-item" href="/">+7(800)123-12-12</Link>
                        <Link className="footer__links-item" href="/">+7(800)123-12-12</Link>
                    </div>
                    <div className="footer__adress-contacts">
                        <p>Адрес: г. Москва ул. Ленина 17-а оф. 17</p>
                        <br />
                        <p>Мы работаем: <br />
                            пн.-пт. с 10.00 до 20.00<br />
                            сб. вс. с 10.00 до 20.00 сб. вс.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
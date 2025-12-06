import Link from 'next/link';
import './Footer.scss'

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer__container">
                <div className="footer__logo-links footer__navy">
                    <span className="footer__links-header">Наша техника</span>
                    <nav className="footer__popular-links footer__links_navy">
                        <Link className="footer__links-item" href="/category/fpv/">FPV</Link>
                        <Link className="footer__links-item" href="/category/dji/">DJI</Link>
                        <Link className="footer__links-item" href="/category/accessory/">Комплектующие</Link>
                    </nav>
                    <div className="footer__logo">
                        <Link href="/">
                            <img src="/icons-footer/footer_logo.svg" className="footer__image-logo" />
                        </Link>
                    </div>

                </div>
                <div className="footer__social footer__navy">
                    <span className="footer__links-header">ООО "Солидарность"</span>
                    <nav className="footer__popular-links footer__links_navy">
                        <div className="footer__links-item">
                            ИНН/КПП 9717145101/771701001<br /><br />
                            ОГРН 1207700010506<br /><br />
                            Все права защищены © 2024
                        </div>
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
                        <Link className="footer__links-item" href="tel:+74954878782">+7 (495) 487-87-82</Link>
                    </div>
                    <div className="footer__adress-contacts">
                        <p>Адрес: Москва, пр-т. Мира, 102, стр. 31</p>
                        <br />
                        <p>Мы работаем: <br />
                            Пн-Пт: 9.00 - 21.00<br />
                            Cб: 11.00 - 16.00<br />
                            Вс: выходной</p>
                    </div>
                </div>
            </div >
        </footer >
    );
}

export default Footer;
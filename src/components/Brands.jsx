import Link from "next/link";
import './Brands.scss';

const Brands = () => {
    return (
        <section className="brands">
            <div className="container brands__container">
                <div className="brands__header">
                    <h2>Бренды</h2>
                    <Link className="link__show-all desktop-show" href="/">
                        <span>Все бренды</span>
                    </Link>
                </div>

                <div className="brands__wrapper">
                    <div className="brands__wrapper-inner">
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/dji.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/autel.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/betafpv.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/gerpc.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/hubsan.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/iflight.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/parrot.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/dji.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/autel.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/betafpv.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/gerpc.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/hubsan.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/iflight.png" />
                            </Link>
                        </div>
                        <div className="brands__item">
                            <Link href="/">
                                <img src="/images/brands/parrot.png" />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="link__show-all mobile-show">
                    <Link href="/">
                        <span className="show-all">Все бренды</span>
                    </Link>
                </div>
            </div >
        </section >
    );
}

export default Brands;
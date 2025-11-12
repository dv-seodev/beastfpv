import LoadMore from '../news/LoadMore';
import './Products.scss'
import Link from "next/link";

const Products = () => {
    return (
        <div className="products">
            <div className="products__items-grid">
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                        <div className="products__sticker sticker-hit">хит</div>
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
                <div className="products__item">
                    <Link href="/">
                        <img src="/images/product_image.jpg" />
                    </Link>
                    <Link href="/"><span className="products__name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</span></Link>
                    <div className="products__price-wrapper">
                        <span className="products__price">85 000 ₽</span>
                        <button className="products__cart-button button">
                        </button>
                    </div>
                    <button className="products__one-click button">Купить в один клик</button>
                </div>
            </div>
            <LoadMore />
        </div>
    );
}

export default Products;
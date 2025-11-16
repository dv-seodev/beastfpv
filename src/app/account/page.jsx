'use client'

import Link from "next/link";
import './page.scss';
import NewItems from "../../components/New_items";
import { useHomeData } from "../../lib/HomePageDataContoller";



const Account = () => {
    const { data, loading, error } = useHomeData();

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (!data) return <div>Нет данных</div>;

    const { new_products, pop_products, cats_list } = data;

    return (
        <section className="account">
            <div className="container account__container">
                <h1 className="account__header">Личный кабинет</h1>
                <div className="account__nav">
                    <Link className="account__links-item account__link-active" href="/">Заказы</Link>
                    <Link className="account__links-item" href="/">Профиль</Link>
                    <Link className="account__links-item" href="/">Выйти</Link>
                </div>
                <div className="account__orders-list">
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>

                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                    <div className="account__order-item">
                        <Link className="account__order-item-link" href="/">
                            <div className="account__order-item-img"><img src="/images/product_image.jpg" /></div>
                            <div className="account__order-item-name">FPV дрон Зверобой 13 дюймов 720MHz 4.9-5.8GHz</div>
                        </Link>
                        <div className="account__order-item-price">85 000 ₽</div>
                    </div>
                </div>
                <NewItems products={new_products} />
            </div >
        </section >
    );
}

export default Account;
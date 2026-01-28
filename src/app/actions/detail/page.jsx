'use client';

import Link from "next/link";
import './page.scss';
import NewItems from "../../../components/New_items";
import { useHomeData } from "../../../lib/HomePageDataContoller";
import Loader from "../../../components/Loader";

const actionsdetail = () => {
    const { data, loading } = useHomeData();

    if (loading) {
        return (
            <Loader label="Загружаем" />
        );
    }

    return (
        <section className="actionsdetail">
            <div className="container actionsdetail__container">
                <h1 className="actionsdetail__header">Название акции</h1>
                <div className="actionsdetail__wrapper">
                    <div className="actionsdetail__leftarea">
                        <div className="actionsdetail__banner">
                            <img src="/images/newdetail_banner.png" />
                        </div>
                        <div className="actionsdetail__textarea">
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                        </div>
                    </div>
                    <div className="actionsdetail__rightarea">
                        <h3 className="">Другие акции</h3>
                        <div className="actionsdetail__other-wrapper">
                            <div className="actions__item">
                                <img src="/images/actions/action_1.png" />
                                <Link href="/">
                                    <div className="actions__text">Контроллеры со скидкой <b>до 20%</b>
                                    </div>
                                </Link>
                            </div>
                            <div className="actions__item">
                                <img src="/images/actions/action_2.png" />
                                <Link href="/">
                                    <div className="actions__text">Камера в подарок к любому дрону
                                    </div>
                                </Link>
                            </div>
                            <div className="actions__item">
                                <img src="/images/actions/action_3.png" />
                                <Link href="/">
                                    <div className="actions__text">Подарки ко дню защитника отечества
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            <NewItems products={data.new_products} />
        </section >
    );
}

export default actionsdetail;
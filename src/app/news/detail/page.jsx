'use client';

import Link from "next/link";
import './page.scss';
import NewItems from "../../../components/New_items";
import { useHomeData } from "../../../lib/HomePageDataContoller";
import Loader from "../../../components/Loader";

const NewsDetail = () => {
    const { data, loading } = useHomeData();

    if (loading) {
        return (
            <Loader label="Загружаем" />
        );
    }

    return (
        <section className="newsdetail">
            <div className="container newsdetail__container">
                <h1 className="newsdetail__header">Название новости</h1>
                <p className="newsdetail__date">28.02.2025</p>
                <div className="newsdetail__wrapper">
                    <div className="newsdetail__leftarea">
                        <div className="newsdetail__banner">
                            <img src="/images/newdetail_banner.png" />
                        </div>
                        <div className="newsdetail__textarea">
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam in architecto iusto magni delectus. Quisquam animi, delectus, fugiat modi quae numquam obcaecati autem ratione repellendus optio aspernatur alias dolorem laudantium! </p>
                        </div>
                    </div>
                    <div className="newsdetail__rightarea">
                        <h3 className="">Другие новости</h3>
                        <div className="newsdetail__other-wrapper">
                            <div className="newsdetail__card">
                                <div className="newsdetail__card-image">
                                    <Link href="/"><img className="newsdetail__card-image-img" src="/images/news/news_2.jpg" /></Link>
                                </div>
                                <div className="newsdetail__card-text">
                                    <Link href="/"><div className="newsdetail__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                    <div className="newsdetail__card-date">12.02.25</div>
                                </div>
                            </div>
                            <div className="newsdetail__card">
                                <div className="newsdetail__card-image">
                                    <Link href="/"><img className="newsdetail__card-image-img" src="/images/news/news_2.jpg" /></Link>
                                </div>
                                <div className="newsdetail__card-text">
                                    <Link href="/"><div className="newsdetail__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                    <div className="newsdetail__card-date">12.02.25</div>
                                </div>
                            </div>
                            <div className="newsdetail__card">
                                <div className="newsdetail__card-image">
                                    <Link href="/"><img className="newsdetail__card-image-img" src="/images/news/news_2.jpg" /></Link>
                                </div>
                                <div className="newsdetail__card-text">
                                    <Link href="/"><div className="newsdetail__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                    <div className="newsdetail__card-date">12.02.25</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            <NewItems products={data.new_products} />
        </section >
    );
}

export default NewsDetail;
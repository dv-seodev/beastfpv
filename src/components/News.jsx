import Link from "next/link";
import './News.scss';

const News = () => {
    return (
        <section className="news">
            <div className="container news__container">
                <div className="news__header">
                    <h2>Новости</h2>
                    <Link className="link__show-all desktop-show" href="/news/">
                        <span>Все новости</span>
                    </Link>
                </div>
                <div className="news__wrapper">
                    <div className="news__big-item">
                        <img src="/images/news/news_1.jpg" />
                        <Link href="/">
                            <div className="news__big-item-text">
                                <div className="news__big-item-date">28.02.25</div>
                                <div className="news__big-item-header">Топ-5 дронов
                                    для съемки в 2025 году</div>
                            </div>
                        </Link>
                    </div>
                    <div className="news__item">
                        <div className="news__card">
                            <div className="news__card-image">
                                <Link href="/"><img className="news__card-image-img" src="/images/news/news_2.jpg" /></Link>
                            </div>
                            <div className="news__card-text">
                                <Link href="/"><div className="news__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="news__card-date">12.02.25</div>
                            </div>

                        </div>
                        <div className="news__card">
                            <div className="news__card-image">
                                <Link href="/"><img className="news__card-image-img" src="/images/news/news_3.jpg" /></Link>
                            </div>
                            <div className="news__card-text">
                                <Link href="/"><div className="news__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="news__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="news__card">
                            <div className="news__card-image">
                                <Link href="/"><img className="news__card-image-img" src="/images/news/news_4.jpg" /></Link>
                            </div>
                            <div className="news__card-text">
                                <Link href="/"><div className="news__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="news__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="news__card">
                            <div className="news__card-image">
                                <Link href="/"> <img className="news__card-image-img" src="/images/news/news_5.jpg" /></Link>
                            </div>
                            <div className="news__card-text">
                                <Link href="/"><div className="news__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="news__card-date">12.02.25</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="link__show-all mobile-show">
                    <Link href="/">
                        <span className="show-all">Все новости</span>
                    </Link>
                </div>
            </div >
        </section >
    );
}

export default News;
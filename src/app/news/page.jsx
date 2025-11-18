import Link from "next/link";
import './page.scss';
import Breadcrumbs from "../category/[[...slug]]/Breadcrumbs";
import LoadMore from "./LoadMore";

const newspagePage = () => {
    return (
        <section className="newspage">
            <div className="container newspage__container">
                <Breadcrumbs />
                <h1 className="newspage__header">Новости</h1>
                <div className="newspage__wrapper">
                    <div className="newspage__big-item">
                        <img src="/images/news/news_1.jpg" />
                        <Link href="/">
                            <div className="newspage__big-item-text">
                                <div className="newspage__big-item-date">28.02.25</div>
                                <div className="newspage__big-item-header">Топ-5 дронов
                                    для съемки в 2025 году</div>
                            </div>
                        </Link>
                    </div>
                    <div className="newspage__item">
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_2.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>

                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_3.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_4.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"> <img className="newspage__card-image-img" src="/images/news/news_5.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="newspage__wrapper">
                    <div className="newspage__item-2">
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_2.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>

                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_3.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_4.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"> <img className="newspage__card-image-img" src="/images/news/news_5.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_2.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>

                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_3.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"><img className="newspage__card-image-img" src="/images/news/news_4.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                        <div className="newspage__card">
                            <div className="newspage__card-image">
                                <Link href="/"> <img className="newspage__card-image-img" src="/images/news/news_5.jpg" /></Link>
                            </div>
                            <div className="newspage__card-text">
                                <Link href="/"><div className="newspage__card-header">Как выбрать идеальный дрон: советы экспертов</div></Link>
                                <div className="newspage__card-date">12.02.25</div>
                            </div>
                        </div>
                    </div>

                </div>

                <LoadMore />

            </div >
        </section >
    );
}

export default newspagePage;
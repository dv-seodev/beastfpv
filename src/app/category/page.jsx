import Breadcrumbs from "./Breadcrumbs";
import FAQ from "./FAQ";
import Filter from "./Filter";
import Filter_mobile from "./Filter-mobile";
import Products from "./Products";
import './page.scss';
import Link from "next/link";

const Category_page = () => {
    return (
        <div className="category-page">
            <div className="overlay"></div>
            <Filter_mobile />
            <div className="container category-page__container">
                <Breadcrumbs />
                <div className="category-page__wrapper">
                    <div className="category-page__cat-list">
                        <div className="category-page__cat-list-inner">
                            <div className="category-page__cat-list-item">
                                <a href="/"><span>Категория 1</span></a>
                            </div>
                            <div className="category-page__cat-list-item">
                                <a href="/"><span>Категория 2</span></a>
                            </div>
                            <div className="category-page__cat-list-item">
                                <a href="/"><span>Категория 3</span></a>
                            </div>
                            <div className="category-page__cat-list-item">
                                <a href="/"><span>Категория 4</span></a>
                            </div>
                        </div>
                    </div>
                    <Link href="/" className="filter-mob"><img src="/images/filter-mobile.svg" /><span>Фильтр</span></Link>
                    <Filter />
                    <Products />
                </div>
            </div>
            <FAQ />
        </div>);
}

export default Category_page;
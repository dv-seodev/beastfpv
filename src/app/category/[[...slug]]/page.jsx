'use client'

import Breadcrumbs from "./Breadcrumbs";
import FAQ from "./FAQ";
import Filter from "./Filter";
import Filter_mobile from "./Filter-mobile";
import Products from "./Products";
import './page.scss';
import Link from "next/link";
import { useCategoryData } from "../../../lib/CategoryPageController";
import { useFilterData } from "../../../lib/useFilterData";
import { useParams } from 'next/navigation';
import LoadMore from "../../news/LoadMore";
import { useBreadcrumbs } from "../../../lib/useBreadcrumbs";


const Category_page = () => {
    const params = useParams();
    const slugArray = params.slug || [];

    const currentSlug = slugArray.length > 0 ? slugArray[slugArray.length - 1] : null;

    // Получаем данные категории
    const { data, loading, error } = useCategoryData(currentSlug);

    // Получаем данные фильтра
    const { categories, loading: filterLoading, error: filterError } = useFilterData();

    // Получаем хлебные крошки
    const breadcrumbPath = useBreadcrumbs(data?.category, categories);

    if (loading || filterLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (filterError) return <div>Ошибка при загрузке фильтра: {filterError.message}</div>;
    if (!currentSlug) return <div>Выберите категорию</div>;
    if (!data) return <div>Категория не найдена</div>;

    return (
        <div className="category-page">
            <div className="overlay"></div>
            <Filter_mobile categories={categories} />
            <div className="container category-page__container">
                <Breadcrumbs categoryPath={breadcrumbPath} />
                <div className="category-page__wrapper">
                    {/* <div className="category-page__cat-list">
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
                    </div> */}
                    <Link href="/" className="filter-mob">
                        <img src="/images/filter-mobile.svg" alt="Filter" />
                        <span>Фильтр</span>
                    </Link>

                    {/* ПЕРЕДАЁМ КАТЕГОРИИ В ФИЛЬТР */}
                    <Filter categories={categories} />

                    <Products
                        categoryName={data.category?.name}
                        products={data.cat_products}
                    />
                </div>
            </div>
            <FAQ />
        </div>
    );
}

export default Category_page;

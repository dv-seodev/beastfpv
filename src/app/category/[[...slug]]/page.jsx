'use client';

import Breadcrumbs from "./Breadcrumbs";
import FAQ from "./FAQ";
import Filter from "./Filter";
import Filter_mobile from "./Filter-mobile";
import Products from "./Products";
import './page.scss';
import Link from "next/link";
import { useCategoryData } from "../../../lib/CategoryPageController";
import { useFilterData } from "../../../lib/useFilterData";
import LoadMore from "../../news/LoadMore";
import { useBreadcrumbs } from "../../../lib/useBreadcrumbs";
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const Category_page = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const slugArray = params.slug || [];
    const currentSlug =
        slugArray.length > 0 ? slugArray[slugArray.length - 1] : null;

    const currentPage = Number(searchParams.get('page') || '1');

    // данные категории + все товары
    const {
        data,
        loading,
        error,
        pageSize,
    } = useCategoryData(currentSlug);

    // фильтр
    const {
        categories,
        loading: filterLoading,
        error: filterError,
    } = useFilterData();

    const breadcrumbPath = useBreadcrumbs(data?.category, categories);

    // локальный флаг "показать все товары"
    const [showAll, setShowAll] = useState(false);

    if (loading || filterLoading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error.message}</div>;
    if (filterError)
        return <div>Ошибка при загрузке фильтра: {filterError.message}</div>;
    if (!currentSlug) return <div>Выберите категорию</div>;
    if (!data) return <div>Категория не найдена</div>;

    const totalCount = data.totalCount;
    const allProducts = data.allProducts;

    const totalPages = Math.ceil(totalCount / pageSize);

    // обычная порционная выборка (для режима без showAll)
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageProducts = allProducts.slice(startIndex, endIndex);

    // что рендерим: либо текущую страницу, либо все
    const productsToRender = showAll ? allProducts : pageProducts;

    // показывать ли блок LoadMore (кнопка + пагинация)
    const shouldShowLoadMoreBlock =
        totalCount > pageSize && !showAll;

    const handleChangePage = (page) => {
        if (showAll) return; // в режиме "все товары" перелистывание страниц не нужно
        if (page < 1 || page > totalPages || page === currentPage) return;

        if (page === 1) {
            router.push(`/category/${currentSlug}`);
        } else {
            router.push(`/category/${currentSlug}?page=${page}`);
        }
    };

    const handleShowAll = () => {
        // просто включаем режим "все товары", URL не меняем
        setShowAll(true);
    };

    return (
        <div className="category-page">
            <div className="overlay"></div>
            <Filter_mobile categories={categories} />
            <div className="container category-page__container">
                <Breadcrumbs categoryPath={breadcrumbPath} />
                <div className="category-page__wrapper">
                    <Link href="/" className="filter-mob">
                        <img src="/images/filter-mobile.svg" alt="Filter" />
                        <span>Фильтр</span>
                    </Link>

                    {/* ПЕРЕДАЁМ КАТЕГОРИИ В ФИЛЬТР */}
                    <Filter categories={categories} />

                    <Products
                        categoryName={data.category?.name}
                        products={productsToRender}
                    />
                </div>

                {shouldShowLoadMoreBlock && (
                    <LoadMore
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onChangePage={handleChangePage}
                        onShowAll={handleShowAll}
                    />
                )}
            </div>
            <FAQ />
        </div>
    );
};

export default Category_page;

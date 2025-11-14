import api from './api';
import { useQuery, useSuspenseQuery } from "@apollo/client/react";

const HomeContent = () => {
    const new_prod = api.fetchProducts(10, '10-inch');
    const pop_prod = api.fetchProducts(8, 'akkumulyatory');
    const cats = api.fetchCategories(12, 20);

    const newResult = useQuery(new_prod);
    const popResult = useQuery(pop_prod);
    const catsResult = useQuery(cats);

    if (newResult.loading || popResult.loading || catsResult.loading) {
        return <div>Загрузка</div>;
    }

    if (newResult.error) {
        return <div>Ошибка загрузки новых продуктов: {newResult.error.message}</div>;
    }

    if (popResult.error) {
        return <div>Ошибка загрузки популярных продуктов: {popResult.error.message}</div>;
    }

    if (catsResult.error) {
        return <div>Ошибка загрузки категорий: {catsResult.error.message}</div>;
    }

    const new_products = newResult.data.products.nodes;
    const pop_products = popResult.data.products.nodes;
    const cats_list = catsResult.data.productCategories.nodes;

    return (
        { new_products, pop_products, cats_list }
    );
};


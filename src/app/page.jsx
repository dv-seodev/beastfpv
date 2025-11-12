'use client'

import './styles/globals.scss';
import './styles/typography.scss';

import SwipeSlider from '../components/Slider';
import PopularProducts from '../components/Popular_products';
import NewItems from '../components/New_items';
import Advantages from '../components/Advantages';
import News from '../components/News';
import WhyUs from '../components/WhyUs';
import Brands from '../components/Brands';
import Contact_us from '../components/Contact_us';
import Actions from '../components/Actions';
import Categories from '../components/Categories';
import api from '../lib/api';

import { useQuery } from "@apollo/client/react";


export default function Home() {

  // Оба запроса выполняются параллельно
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
    <div>
      <SwipeSlider />
      <Categories categories={cats_list} />
      <PopularProducts products={pop_products} />
      <Actions />
      <NewItems products={new_products} />
      <Advantages />
      <News />
      <WhyUs />
      <Brands />
      <Contact_us />
    </div>
  );
}

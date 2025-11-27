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
import { useHomeData } from '../lib/HomePageDataContoller';

export default function Home() {

  const { data, loading, error } = useHomeData();

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;
  if (!data) return <div>Нет данных</div>;

  const { new_products, pop_products, cats_list } = data;

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

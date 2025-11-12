import Link from "next/link";
import './Categories.scss';

const Categories = ({ categories }) => {
    return (
        <section className="categories">
            <div className="container categories__container">
                <h2>Категории товаров</h2>
                <div className="categories__items-grid">
                    {categories.map((category) => (
                        <div key={category.id} className="categories__item">
                            <Link href={category.link}>
                                <img src={category.image?.sourceUrl || "/images/categories/new.png"} />
                            </Link>
                            <Link href="/"><span className="categories__name">{category.name}</span></Link>
                        </div>
                    ))}
                    {/* <div className="categories__item">
                        <Link href="/">
                            <img src="/images/categories/dji.png" alt={"dji"} />
                        </Link>
                        <Link href="/"><span className="categories__name">DJI</span></Link>
                    </div>
                    <div className="categories__item">
                        <Link href="/">
                            <img src="/images/categories/accessories.png" alt={"accessories"} />
                        </Link>
                        <Link href="/"><span className="categories__name">Аксессуары</span></Link>
                    </div>
                    <div className="categories__item">
                        <Link href="/">
                            <img src="/images/categories/components.png" alt={"components"} />
                        </Link>
                        <Link href="/"><span className="categories__name">Комплектующие</span></Link>
                    </div >
                    <div className="categories__item">
                        <Link href="/">
                            <img src="/images/categories/new.png" alt={"new"} />
                        </Link>
                        <Link href="/"><span className="categories__name">Новинки</span></Link>
                    </div >
                    <div className="categories__item">
                        <Link href="/">
                            <img src="/images/categories/hit.png" alt={"hit"} />
                        </Link>
                        <Link href="/"><span className="categories__name">Хиты продаж</span></Link>
                    </div >
                    <div className="categories__item">
                        <Link href="/">
                            <img src="/images/categories/sale.png" alt={"sale"} />
                        </Link>
                        <Link href="/"><span className="categories__name">Распродажа</span></Link>
                    </div > */}
                </div >
            </div >
        </section >
    );
}

export default Categories;
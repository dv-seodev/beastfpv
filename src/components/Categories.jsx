import Link from "next/link";
import './Categories.scss';


const Categories = ({
    categories = [],
    catsfpv_list = [],
    catsapp_list = [],
    catspit_list = [],
}) => {

    const getRelativePath = (fullUrl) => {
        try {
            const url = new URL(fullUrl);
            return url.pathname + url.search + url.hash;
        } catch (error) {
            // Если это уже относительный путь, возвращаем как есть
            return fullUrl;
        }
    };

    return (
        <section className="categories">
            <div className="container categories__container">
                <h2>Категории товаров</h2>
                <div className="categories__items-grid categories__items-grid-main">
                    <div className="categories__item categories__main-item">
                        <Link href="/category/fpv/">
                            <img src="https://api.beastfpv.ru/wp-content/uploads/2026/09/1-2.jpg" alt="FPV-дроны" />
                        </Link>
                        <Link href="/category/fpv/">
                            <span className="categories__items__name categories__main-item__name">FPV-дроны</span>
                        </Link>
                    </div>

                    <div className="categories__item categories__main-item">
                        <Link href="/category/komplektuyushchie/">
                            <img src="https://api.beastfpv.ru/wp-content/uploads/2026/09/2-2.jpg" alt="Комплектующие" />
                        </Link>
                        <Link href="/category/komplektuyushchie/">
                            <span className="categories__items__name categories__main-item__name">Комплектующие</span>
                        </Link>
                    </div>

                    <div className="categories__item categories__main-item">
                        <Link href="/category/apparatura-fpv/">
                            <img src="https://api.beastfpv.ru/wp-content/uploads/2026/09/3-2.jpg" alt="Аппаратура" />
                        </Link>
                        <Link href="/category/apparatura-fpv/pulty-upravleniya-fpv-dronami/">
                            <span className="categories__items__name categories__main-item__name">Аппаратура</span>
                        </Link>
                    </div>

                    <div className="categories__item categories__main-item">
                        <Link href="/category/pitanie-i-obsluzhivanie-fpv/akkumulyatory/">
                            <img src="https://api.beastfpv.ru/wp-content/uploads/2026/09/4-2.jpg" alt="Питание и обслуживание" />
                        </Link>
                        <Link href="/category/pitanie-i-obsluzhivanie-fpv/akkumulyatory/">
                            <span className="categories__items__name categories__main-item__name">Питание и обслуживание</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container categories__container">
                <h2>FPV-дроны</h2>
                <div className="categories__items-grid">
                    {catsfpv_list.map((category) => (
                        <div key={category.id} className="categories__item">
                            <Link href={getRelativePath(category.link)}>
                                <img src={category.image?.sourceUrl || '/images/categories/new.png'} alt={category.name} />
                            </Link>
                            <Link href={getRelativePath(category.link)}>
                                <span className="categories__items__name">{category.name}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container categories__container">
                <h2>Комплектующие для сборки</h2>
                <div className="categories__items-grid">
                    {categories.map((category) => (
                        <div key={category.id} className="categories__item">
                            <Link href={getRelativePath(category.link)}>
                                <img src={category.image?.sourceUrl || '/images/categories/new.png'} alt={category.name} />
                            </Link>
                            <Link href={getRelativePath(category.link)}>
                                <span className="categories__items__name">{category.name}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container categories__container">
                <h2>Аппаратура</h2>
                <div className="categories__items-grid">
                    {catsapp_list.map((category) => (
                        <div key={category.id} className="categories__item">
                            <Link href={getRelativePath(category.link)}>
                                <img src={category.image?.sourceUrl || '/images/categories/new.png'} alt={category.name} />
                            </Link>
                            <Link href={getRelativePath(category.link)}>
                                <span className="categories__items__name">{category.name}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container categories__container">
                <h2>Питание и обслуживание</h2>
                <div className="categories__items-grid">
                    {catspit_list.map((category) => (
                        <div key={category.id} className="categories__item">
                            <Link href={getRelativePath(category.link)}>
                                <img src={category.image?.sourceUrl || '/images/categories/new.png'} alt={category.name} />
                            </Link>
                            <Link href={getRelativePath(category.link)}>
                                <span className="categories__items__name">{category.name}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Categories;

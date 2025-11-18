import Link from "next/link";
import './Categories.scss';


const Categories = ({ categories }) => {

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
                <div className="categories__items-grid">
                    {categories.map((category) => (
                        <div key={category.id} className="categories__item">
                            <Link href={getRelativePath(category.link)}>
                                <img src={category.image?.sourceUrl || "/images/categories/new.png"} />
                            </Link>
                            <Link href={getRelativePath(category.link)}><span className="categories__name">{category.name}</span></Link>
                        </div>
                    ))}
                </div >
            </div >
        </section >
    );
}

export default Categories;
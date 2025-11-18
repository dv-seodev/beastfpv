import Link from "next/link";
import './Breadcrumbs.scss'

const Breadcrumbs = ({ categoryPath = [] }) => {

    // Если не передали путь, используем дефолтные значения
    const breadcrumbs = categoryPath.length > 0 ? categoryPath : [
        { name: 'Главная', href: '/' },
        { name: 'Каталог', href: '/category' },
        { name: 'FPV', href: '/category/fpv' },
        { name: 'FPV-дроны', href: null, isCurrent: true }
    ];

    return (
        <div className="breadcrumbs">
            <ul className="breadcrumbs__bread-ul">
                {breadcrumbs.map((item, index) => (
                    <li key={index}>
                        {item.href && !item.isCurrent ? (
                            <Link href={item.href}>{item.name}</Link>
                        ) : (
                            <span className={item.isCurrent ? 'current' : ''}>
                                {item.name}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Breadcrumbs;
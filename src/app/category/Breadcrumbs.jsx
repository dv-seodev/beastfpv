import Link from "next/link";
import './Breadcrumbs.scss'

const Breadcrumbs = () => {
    return (
        <div className="breadcrumbs">
            <ul className="breadcrumbs__bread-ul">
                <li><a href="">Главная</a></li>
                <li><a href="">Каталог</a></li>
                <li><a href="">FPV</a></li>
                <li>FPV-дроны</li>
            </ul>
        </div>
    );
}

export default Breadcrumbs;
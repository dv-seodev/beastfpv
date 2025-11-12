import Link from "next/link";
import './LoadMore.scss';

const LoadMore = () => {
    return (
        <div className="newspage__more-materials">
            <div className="newspage__show-more">
                <button className="newspage__load-more button">Показать еще</button>
            </div>
            <div className="newspage__pagination">
                <Link className="previous" href="#">
                </Link>
                <Link href="#" className="active">
                    1
                </Link>
                <Link href="#">
                    2
                </Link>
                <Link href="#">
                    3
                </Link>
                <Link href="#">
                    ...
                </Link>
                <Link href="#">
                    10
                </Link>
                <Link className="next" href="#">
                </Link>
            </div>

        </div>
    );
}

export default LoadMore;
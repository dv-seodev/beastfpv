'use client';

import Link from "next/link";
import './LoadMore.scss';

const LoadMore = ({
    currentPage,
    totalPages,
    onChangePage,
    onShowAll,
}) => {
    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
        pages.push(p);
    }

    const handlePageClick = (page, e) => {
        e.preventDefault();
        onChangePage(page);
    };

    const handlePrev = (e) => {
        e.preventDefault();
        if (hasPrev) onChangePage(currentPage - 1);
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (hasNext) onChangePage(currentPage + 1);
    };

    const handleShowAllClick = (e) => {
        e.preventDefault();
        onShowAll();
    };

    return (
        <div className="newspage__more-materials">
            <div className="newspage__show-more">
                <button
                    className="newspage__load-more button"
                    onClick={handleShowAllClick}
                >
                    Показать еще
                </button>
            </div>

            {totalPages > 1 && (
                <div className="newspage__pagination">
                    {hasPrev && (
                        <Link className="previous" href="#" onClick={handlePrev} />
                    )}

                    {pages.map((p) => (
                        <Link
                            key={p}
                            href="#"
                            className={p === currentPage ? 'active' : ''}
                            onClick={(e) => handlePageClick(p, e)}
                        >
                            {p}
                        </Link>
                    ))}

                    {hasNext && (
                        <Link className="next" href="#" onClick={handleNext} />
                    )}
                </div>
            )}
        </div>
    );
};

export default LoadMore;

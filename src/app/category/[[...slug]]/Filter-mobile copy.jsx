import './Filter-mobile.scss'

const Filter_mobile = () => {
    return (
        <div className="filter-mobile">
            <div className='filter-mobile__item-header'>Фильтр</div>
            <div className="filter-mobile__item">
                <details className="filter-mobile__categories">
                    <summary className="filter-mobile__categories-title">Наличие камеры</summary>
                    <div className="filter-mobile__categories-content">
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>C камерой</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на камеру</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление под камеру</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на жопу</span></div>
                    </div>
                </details>
            </div>
            <div className="filter-mobile__item">
                <details className="filter-mobile__categories">
                    <summary className="filter-mobile__categories-title">Цвет</summary>
                    <div className="filter-mobile__categories-content">
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>C камерой</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на камеру</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление под камеру</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на жопу</span></div>
                    </div>
                </details>
            </div>
            <div className="filter-mobile__item">
                <details className="filter-mobile__categories">
                    <summary className="filter-mobile__categories-title">Производитель</summary>
                    <div className="filter-mobile__categories-content">
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>C камерой</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на камеру</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление под камеру</span></div>
                        <div className="filter-mobile__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на жопу</span></div>
                    </div>
                </details>
            </div>
            <button className="filter-mobile__filter-apply button">Применить фильтр</button>
        </div>
    );
}

export default Filter_mobile;
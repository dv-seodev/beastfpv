import './Filter.scss'

const Filter = () => {
    return (
        <div className="filter">
            <div className="filter__item">
                <div className='filter__item-header'>Категории товаров</div>
                <details className="filter__categories">
                    <summary className="filter__categories-title">FPV</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item">FPV 13 дюймов</div>
                        <div className="filter__categories-content-item">FPV 10 дюймов</div>
                        <div className="filter__categories-content-item">FPV 9 дюймов</div>
                        <div className="filter__categories-content-item">FPV 7 дюймов</div>
                        <div className="filter__categories-content-item">FPV 13 дюймов</div>
                        <div className="filter__categories-content-item">FPV 10 дюймов</div>
                        <div className="filter__categories-content-item">FPV 9 дюймов</div>
                        <div className="filter__categories-content-item">FPV 7 дюймов</div>
                        <div className="filter__categories-content-item">FPV 13 дюймов</div>
                    </div>
                </details>
                <details className="filter__categories">
                    <summary className="filter__categories-title">DJI</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item">FPV 13 дюймов</div>
                        <div className="filter__categories-content-item">FPV 10 дюймов</div>
                        <div className="filter__categories-content-item">FPV 9 дюймов</div>
                        <div className="filter__categories-content-item">FPV 7 дюймов</div>
                    </div>
                </details>
                <details className="filter__categories">
                    <summary className="filter__categories-title">Аксессуары</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item">FPV 13 дюймов</div>
                        <div className="filter__categories-content-item">FPV 10 дюймов</div>
                        <div className="filter__categories-content-item">FPV 9 дюймов</div>
                        <div className="filter__categories-content-item">FPV 7 дюймов</div>
                    </div>
                </details>
                <details className="filter__categories">
                    <summary className="filter__categories-title">Новинки</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item">FPV 13 дюймов</div>
                        <div className="filter__categories-content-item">FPV 10 дюймов</div>
                        <div className="filter__categories-content-item">FPV 9 дюймов</div>
                        <div className="filter__categories-content-item">FPV 7 дюймов</div>
                    </div>
                </details>
                <details className="filter__categories">
                    <summary className="filter__categories-title">Распродажа</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item">FPV 13 дюймов</div>
                        <div className="filter__categories-content-item">FPV 10 дюймов</div>
                        <div className="filter__categories-content-item">FPV 9 дюймов</div>
                        <div className="filter__categories-content-item">FPV 7 дюймов</div>
                    </div>
                </details>
            </div>
            <div className="filter__item">
                <details className="filter__categories">
                    <summary className="filter__categories-title">Наличие камеры</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>C камерой</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на камеру</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление под камеру</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на жопу</span></div>
                    </div>
                </details>
            </div>
            <div className="filter__item">
                <details className="filter__categories">
                    <summary className="filter__categories-title">Цвет</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>C камерой</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на камеру</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление под камеру</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на жопу</span></div>
                    </div>
                </details>
            </div>
            <div className="filter__item">
                <details className="filter__categories">
                    <summary className="filter__categories-title">Производитель</summary>
                    <div className="filter__categories-content">
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>C камерой</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на камеру</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление под камеру</span></div>
                        <div className="filter__categories-content-item"><input type="checkbox" className="characteristics-checkbox" /><span>Крепление на жопу</span></div>
                    </div>
                </details>
            </div>
        </div>
    );
}

export default Filter;
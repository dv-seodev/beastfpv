import './Tabs.scss'

const Tabs = ({ product = {} }) => {

    // ✅ ДОБАВЛЕНО: функция для отрисовки HTML из shortDescription
    const renderHTML = (htmlString) => {
        return (
            <div
                className="tab-content-html"
                dangerouslySetInnerHTML={{ __html: htmlString || '' }}
            />
        );
    };
    return (
        <div className="product-card__char-tabs">
            <div role="tablist" className="max-sm:vertical">
                <label role="tab">
                    <input type="radio" name="resp-tab" defaultChecked /><span>Описание</span>
                </label>
                <div role="tabpanel">
                    {product.shortDescription ? (
                        renderHTML(product.shortDescription)
                    ) : (
                        <p>Описание не доступно</p>
                    )}
                </div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Тех. характеристики</span>
                </label>
                <div role="tabpanel"><span >Tab 3 content</span></div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Аксессуары</span>
                </label>
                <div role="tabpanel"><span >Tab 3 content</span></div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Сертификаты</span>
                </label>
                <div role="tabpanel"><span >Tab 3 content</span></div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Оплата и доставка</span>
                </label>
                <div role="tabpanel"><span >Tab 3 content</span></div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Отзывы</span>
                </label>
                <div role="tabpanel"><span >Tab 3 content</span></div>
            </div>
        </div>
    );
}

export default Tabs;
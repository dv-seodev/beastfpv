import './Tabs.scss'

const Tabs = ({ product = {} }) => {
    const manualFiles = Array.isArray(product.manualFiles) ? product.manualFiles : [];

    const renderHTML = (htmlString) => {
        return (
            <div
                className="tab-content-html"
                dangerouslySetInnerHTML={{ __html: htmlString || '' }}
            />
        );
    };

    const renderInstructions = () => {
        if (!manualFiles.length) {
            return (
                <div className="tabs-manuals tabs-manuals--empty">
                    <span>Инструкции для этого товара пока не добавлены.</span>
                </div>
            );
        }

        return (
            <div className="tabs-manuals">
                <p className="tabs-manuals__hint">Файлы инструкций доступны для скачивания.</p>
                <ul className="tabs-manuals__list">
                    {manualFiles.map((file, index) => {
                        const url = typeof file?.url === 'string' ? file.url.trim() : '';
                        const canDownload = Boolean(url);
                        const title = file?.title || `Инструкция ${index + 1}`;

                        return (
                            <li key={file.id || `${title}-${index}`} className="tabs-manuals__item">
                                <div className="tabs-manuals__row">
                                    <div className="tabs-manuals__name-wrap">
                                        <span className="tabs-manuals__name">{title}</span>
                                        {file?.fileName ? (
                                            <span className="tabs-manuals__meta">{file.fileName}</span>
                                        ) : null}
                                    </div>
                                    {canDownload ? (
                                        <a
                                            className="tabs-manuals__download button"
                                            href={url}
                                            download={file?.fileName || true}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Скачать
                                        </a>
                                    ) : (
                                        <span className="tabs-manuals__unavailable">Недоступно</span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
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
                    <input type="radio" name="resp-tab" /><span>Инструкции</span>
                </label>
                <div role="tabpanel">{renderInstructions()}</div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Сопутствующие товары</span>
                </label>
                <div role="tabpanel"><span >Tab 3 content</span></div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Оплата и доставка</span>
                </label>
                <div role="tabpanel"><span >Краткая информация об оплате и доставке</span></div>

            </div>
        </div>
    );
}

export default Tabs;

import './Tabs.scss'
import NewItems from "../../../components/New_items";

const Tabs = ({ product = {} }) => {
    const manualFiles = Array.isArray(product.manualFiles) ? product.manualFiles : [];
    const relatedProducts = Array.isArray(product.relatedProducts) ? product.relatedProducts : [];
    const directDownloadExtensions = new Set([".hex", ".json"]);

    // Функция для исправления URL инструкций
    const getInstructionUrl = (file) => {
        const rawUrl = file?.url?.trim() || '';
        // Если URL оканчивается на "-pdf.jpg", меняем на ".pdf"
        if (rawUrl.endsWith('-pdf.jpg')) {
            return rawUrl.replace(/-pdf\.jpg$/, '.pdf');
        }
        // Если есть source_url (стандартное поле медиафайлов WordPress) — приоритет
        if (file.source_url) return file.source_url;
        return rawUrl; // иначе возвращаем как есть
    };

    const renderHTML = (htmlString) => {
        return (
            <div
                className="tab-content-html"
                dangerouslySetInnerHTML={{ __html: htmlString || '' }}
            />
        );
    };

    const getFileExtension = (value) => {
        if (typeof value !== "string") return "";
        const cleanValue = value.trim().split(/[?#]/)[0].toLowerCase();
        const match = cleanValue.match(/\.([a-z0-9]+)$/);
        return match ? `.${match[1]}` : "";
    };

    const buildManualDownloadHref = (url, fileName) => {
        if (!url) return "";
        const params = new URLSearchParams({ url });
        if (typeof fileName === "string" && fileName.trim()) {
            params.set("filename", fileName.trim());
        }
        return `/api/manual-download?${params.toString()}`;
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

                        //const url = typeof file?.url === 'string' ? file.url.trim() : '';
                        const url = getInstructionUrl(file);
                        const canDownload = Boolean(url);
                        const title = file?.title || `Инструкция ${index + 1}`;
                        const extension = getFileExtension(file?.fileName) || getFileExtension(url);
                        const shouldForceDownload = directDownloadExtensions.has(extension);
                        const href = shouldForceDownload
                            ? buildManualDownloadHref(url, file?.fileName || title)
                            : url;

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
                                            href={href}
                                            download={file?.fileName || true}
                                            target={shouldForceDownload ? undefined : "_blank"}
                                            rel={shouldForceDownload ? undefined : "noopener noreferrer"}
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

    const renderRelatedProducts = () => {
        if (!relatedProducts.length) {
            return (
                <div className="tabs-manuals tabs-manuals--empty">
                    <span>Сопутствующие товары не добавлены.</span>
                </div>
            );
        }
        return (
            <div className="tabs-related">
                <NewItems products={relatedProducts} />
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
                <div role="tabpanel">{renderRelatedProducts()}</div>

                <label role="tab">
                    <input type="radio" name="resp-tab" /><span>Оплата и доставка</span>
                </label>
                <div role="tabpanel"><span >Краткая информация об оплате и доставке</span></div>

            </div>
        </div>
    );
}

export default Tabs;

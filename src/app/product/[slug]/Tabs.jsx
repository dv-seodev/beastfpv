import './Tabs.scss'

const Tabs = () => {
    return (
        <div className="product-card__char-tabs">
            <div role="tablist" className="max-sm:vertical">
                <label role="tab">
                    <input type="radio" name="resp-tab" defaultChecked /><span>Описание</span>
                </label>
                <div role="tabpanel">
                    <p>Lorem ipsum dolor sit amet consectetur. Scelerisque ut augue lacus nibh massa. Eget amet quis euismod diam. Mauris duis phasellus posuere id ac odio. Enim rhoncus pellentesque a massa vitae adipiscing a cras placerat. Auctor nibh in arcu malesuada. Hendrerit adipiscing luctus elementum at in suspendisse.
                        Urna maecenas et a vel elit viverra convallis. Id ullamcorper arcu integer faucibus ligula mauris sit elit dictum. Elementum quisque tortor auctor a. Vehicula massa quam quam nibh amet nisi bibendum a. Tempor aliquam donec ornare amet elementum. Scelerisque ac quisque non habitant in vel vestibulum elementum sed. Ut vulputate vel felis at faucibus. Arcu nunc gravida id venenatis sapien. Lacus viverra lectus consequat quis eget. Euismod at ipsum convallis ut. Sit consectetur gravida magna eget velit vestibulum. Vel neque sit pulvinar nisl mattis bibendum egestas fermentum. Aliquet potenti aliquet volutpat tortor neque tempus hac. Eu mauris dictum cursus enim pretium cum lectus.
                        Eget at maecenas placerat faucibus. Tellus suspendisse amet nullam nec. Eget mauris aliquam quam vitae dui ornare turpis nisi nisi. Sed scelerisque nunc pharetra amet lacus blandit. Nunc tempus tellus quis sociis. Id at hac commodo sapien quis mattis ultrices cras. Commodo lectus morbi urna nisl. Tellus enim tortor quisque amet at. Metus sed at at in elementum. Aliquam mi magna mauris mollis semper sit a sem. Hac ultricies commodo risus odio vitae id.</p>
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
import './FAQ.scss'

const FAQ = () => {
    return (
        <section className="faq">
            <div className="container faq__container">
                <div className="faq__header">
                    <h2>Ответим на все ваши вопросы</h2>
                </div>
                <details className="details">
                    <summary className="details__title">При арме дрона пропадает картинка, но при этом остается телеметрия на сером фоне</summary>
                    <div className="details__content">
                        <p>Если у вас при арме пропадает картинка с камеры, становится серый экран, но при этом телеметрия показывается, эту проблему можно режим с помощью настройки нескольких пунктов в программе BetaFlight. Откройте программу BetaFlight, перейдите в раздел "Режимы" и найдите пункт USER1 (этот пункт отвечает за переключение камер), поменяйте AUX канал в этом пункте. Сравните чтобы выбранный AUX канал, не совпадал с другими каналами в разделе "режимы".</p>
                    </div>
                </details>
                <details className="details">
                    <summary className="details__title">Прошивка передатчиков и приёмников - почему нельзя обновлять?</summary>
                    <div className="details__content">
                        <p>Передатчики и приемники нашей фирмы нельзя перепрошивать на сторонние прошивки или обновлять на более новые. При попытке перепрошивки передатчика или приемника, с большой долей вероятности его можно окирпичить, из-за другой конфигурации приемника или передатчика.</p>
                    </div>
                </details>
                <details className="details">
                    <summary className="details__title">Длина кабеля Ethernet для НСУ (ретранслятора) и его тип</summary>
                    <div className="details__content">
                        <p>Длина кабеля Ethernet до 300 метров, кабель на такие расстояния необходимо использовать качественный категории е5 с распиновкой T-568B</p>
                    </div>
                </details>
                <details className="details">
                    <summary className="details__title">Где взять инструкции к передатчикам, приемникам и НСУ?</summary>
                    <div className="details__content">
                        <p>Вся необходимая документация для правильной настройки и эксплуатации изделия находится на нашем сайте в карточке конкретного товара (который вас интересует) в разделе «Тех. характеристики». Помимо инструкций, вы можете найти там готовые DUMP - файлы, JSON а также HEX и STL.</p>
                    </div>
                </details>
                <details className="details">
                    <summary className="details__title">Почему не работает приёмник управления?</summary>
                    <div className="details__content">
                        <p>Подключение приемника - подключение приемника осуществляется крестообразным типом. TX от приемника идет к RX на полетном контроллера. А RX от приемника идет к TX на полетном контроллере. Если вы подключите другим способом TX на TX и RX на RX - приемник работать не будет.</p>
                    </div>
                </details>
            </div>
        </section >


    );
}

export default FAQ;
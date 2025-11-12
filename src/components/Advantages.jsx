import './Advantages.scss';

const Advantages = () => {
    return (
        <section className="advantages">
            <div className="container advantages__container">
                <h2>Наши преимущества</h2>
                <div className="advantages__wrapper">
                    <div className="advantages__element">
                        <div className="advantages__number">01</div>
                        <div className="advantages__item">
                            <div className="advantages__header">Широкий ассортимент
                            </div>
                            <div className="advantages__text">Дроны для любых задач:
                                от любительских
                                до профессиональных моделей
                            </div>
                        </div>
                    </div>
                    <div className="advantages__element">
                        <div className="advantages__number">02</div>
                        <div className="advantages__item">
                            <div className="advantages__header">Гарантия и сервис
                            </div>
                            <div className="advantages__text">Официальная гарантия,
                                поддержка и обслуживание
                            </div>
                        </div>
                    </div>
                    <div className="advantages__element">
                        <div className="advantages__number">03</div>
                        <div className="advantages__item">
                            <div className="advantages__header">Быстрая доставка
                            </div>
                            <div className="advantages__text">Оперативная отправка
                                по всей стране
                            </div>
                        </div>
                    </div>
                    <div className="advantages__element">
                        <div className="advantages__number">04</div>
                        <div className="advantages__item">
                            <div className="advantages__header">Экспертная консультация
                            </div>
                            <div className="advantages__text">Поможем выбрать
                                идеальный дрон
                                под ваши нужды
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </section >
    );
}

export default Advantages;
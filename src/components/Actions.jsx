import Link from "next/link";
import './Actions.scss';

const Actions = () => {
    return (
        <section className="actions">
            <div className="container actions__container">
                <div className="actions__header">
                    <h2>Акции</h2>
                    <Link className="link__show-all desktop-show" href="/">
                        <span>Все акции</span>
                    </Link>
                </div>

                <div className="actions__wrapper">
                    <div className="actions__item">
                        <img src="/images/actions/action_1.png" />
                        <Link href="/">
                            <div className="actions__text">Контроллеры со скидкой <b>до 20%</b>
                            </div>
                        </Link>
                    </div>
                    <div className="actions__item">
                        <img src="/images/actions/action_2.png" />
                        <Link href="/">
                            <div className="actions__text">Камера в подарок к любому дрону
                            </div>
                        </Link>
                    </div>
                    <div className="actions__item">
                        <img src="/images/actions/action_3.png" />
                        <Link href="/">
                            <div className="actions__text">Подарки ко дню защитника отечества
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="link__show-all mobile-show">
                    <Link href="/">
                        <span className="show-all">Все акции</span>
                    </Link>
                </div>
            </div >
        </section >
    );
}

export default Actions;
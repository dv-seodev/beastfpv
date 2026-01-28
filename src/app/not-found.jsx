import Link from 'next/link'

const NotFound = () => {
    return (
        <div className="" style={{ marginTop: '75px' }} >
            <h1 className="" style={{ textAlign: 'center', }} >404</h1>
            <h2 className="" style={{ textAlign: 'center', }} >Page Not Found </h2>
            <p className="" style={{ textAlign: 'center', }} >Страница, которую вы просматриваете отсутствует на сайте.</p> <br />
            <p className="" style={{ textAlign: 'center', }} ><Link href="/" style={{ textDecoration: 'underline', }}>
                Вернуться на главную
            </Link></p>
        </div>);
}

export default NotFound;
import '../styles/pages/Home.scss'

function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Дом для пушистых сердец</h1>
          <p>
            МурПриют — это временный дом для котиков, которые ищут свою любящую семью.
            Мы заботимся о каждом питомце, лечим, социализируем и дарим им надежду.
          </p>
          <a href="/cats" className="btn">Познакомиться с котиками →</a>
        </div>
        <div className="hero-image">
          <div className="cat-placeholder">😺</div>
        </div>
      </section>

      <section className="info-section">
        <h2>Как забрать котика?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Познакомьтесь</h3>
            <p>Выберите котика на странице «Наши котики» и свяжитесь с нами</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Заполните анкету</h3>
            <p>Мы зададим несколько вопросов, чтобы убедиться, что у вас безопасно</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Знакомство</h3>
            <p>Приезжайте познакомиться с котиком в наш приют</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Заберите домой</h3>
            <p>Подписываем договор, и котик едет к вам!</p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-card">
          <h3>Как нас найти</h3>
          <p>г. Москва, ул. Зелёная, д. 15</p>
          <p>+7 (999) 123-45-67</p>
          <p>hello@murpriut.ru</p>
          <p>Ежедневно: 11:00 – 20:00</p>
        </div>
      </section>
    </div>
  )
}

export default Home
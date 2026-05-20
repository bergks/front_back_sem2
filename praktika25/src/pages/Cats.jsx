import CatCard from '../components/CatCard'
import '../styles/pages/Cats.scss'

// Данные о 7 котиках (фотографии нужно добавить в папку public/images/)
const catsData = [
  {
    id: 1,
    name: 'Барсик',
    age: '2 года',
    description: 'Ласковый рыжий котик. Обожает играть с мячиками и спать на коленях.',
    imageUrl: '/images/barsik.jpg'
  },
  {
    id: 2,
    name: 'Мурка',
    age: '1.5 года',
    description: 'Чёрная кошечка с зелёными глазами. Очень независимая, но ласковая.',
    imageUrl: '/images/murka.jpg'
  },
  {
    id: 3,
    name: 'Снежок',
    age: '3 года',
    description: 'Белый пушистик. Спокойный и мудрый, любит смотреть в окно.',
    imageUrl: '/images/snezhok.jpg'
  },
  {
    id: 4,
    name: 'Тиша',
    age: '4 месяца',
    description: 'Маленькая хулиганка. Энергичная и любопытная, ищет активную семью.',
    imageUrl: '/images/tisha.jpg'
  },
  {
    id: 5,
    name: 'Маркиз',
    age: '5 лет',
    description: 'Благородный серый кот в полоску. Любит порядок и вкусно поесть.',
    imageUrl: '/images/marquis.jpg'
  },
  {
    id: 6,
    name: 'Лада',
    age: '1 год',
    description: 'Трёхцветная кошечка. Очень нежная и доверчивая, обожает детей.',
    imageUrl: '/images/lada.jpg'
  },
  {
    id: 7,
    name: 'Пух',
    age: '2.5 года',
    description: 'Пушистый персиковый комочек счастья. Спит только на ручках.',
    imageUrl: '/images/puh.jpg'
  }
]

function Cats() {
  return (
    <div className="cats-page">
      <h1>Наши котики</h1>
      <p className="subtitle">Все наши питомцы привиты, стерилизованы и ждут вашей любви</p>
      
      <div className="cats-grid">
        {catsData.map(cat => (
          <CatCard key={cat.id} {...cat} />
        ))}
      </div>
    </div>
  )
}

export default Cats
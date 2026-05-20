import '../styles/components/CatCard.scss'

function CatCard({ name, age, description, imageUrl }) {
  return (
    <div className="cat-card">
      <div className="cat-card-image">
        <img src={imageUrl} alt={name} />
      </div>
      <div className="cat-card-content">
        <h3>{name}</h3>
        <span className="age">{age}</span>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default CatCard
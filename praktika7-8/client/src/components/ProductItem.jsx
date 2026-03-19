import React from 'react';

export default function ProductCard({ product, role, onEdit, onDelete }) {
  return (
    <div className="product-card">
      <div className="product-card__image-container">
        <img
          src={
            product.imageUrl?.startsWith('http')
              ? product.imageUrl
              : `http://localhost:3000${product.imageUrl}`
          }
          alt={product.name}
          className="product-card__image"
          onError={(e) => {
            console.log('Не удалось загрузить:', product.imageUrl);
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </div>
      <div className="product-card__content">
        <h3 className="product-card__name">{product.name}</h3>
        <span className="product-card__category">{product.category}</span>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">{product.price} ₽</span>
          <span className="product-card__stock">В наличии: {product.stock}</span>
        </div>
        <div className="product-card__actions">
          {role === 'admin' || role === 'seller' ? (
          <button className="btn" onClick={() => onEdit(product)}>
            Редактировать
          </button>) : null}
          {role === 'admin' ? (
            <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
              Удалить
            </button>) : null}
        </div>
      </div>
    </div>
  );
}
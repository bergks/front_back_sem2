import React from 'react';

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="productCard">
      <div className="productCard__main">
        <div className="productCard__info">
          <div className="productCard__name">{product.name}</div>
          <div className="productCard__category">{product.category}</div>
        </div>
        <div className="productCard__details">
          <div className="productCard__price">{product.price} ₽</div>
          <div className="productCard__stock">В наличии: {product.stock}</div>
        </div>
      </div>
      <div className="productCard__description">{product.description}</div>
      <div className="productCard__actions">
        <button className="btn" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}
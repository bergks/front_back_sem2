// components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.scss';

const Header = ({ isAuth, user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null); // Ссылка на DOM-элемент меню
    const buttonRef = useRef(null); // Ссылка на кнопку
    const navigate = useNavigate();

    // Закрытие меню при клике вне
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Если меню открыто и клик был не по кнопке и не по меню
            if (isMenuOpen &&
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        // Добавляем слушатель
        document.addEventListener('mousedown', handleClickOutside);

        // Убираем слушатель при размонтировании
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]); // Пересоздаем эффект при изменении isMenuOpen

    const handleLogout = async () => {
        await onLogout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header__container">
                <Link to="/" className="header__logo">
                    Coffee Shop
                </Link>

                <div className="header__right">
                    {!isAuth ? (
                        <Link to="/login" className="header__login">
                            Вход
                        </Link>
                    ) : (
                        <div className="header__user">
                            <button
                                ref={buttonRef}
                                className="header__user-button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {user?.email}
                            </button>

                            {isMenuOpen && (
                                <div ref={menuRef} className="header__menu">
                                    <div className="header__menu-info">
                                        <div className="header__menu-name">
                                            {user?.first_name} {user?.last_name}
                                        </div>
                                        <div className="header__menu-email">
                                            {user?.email}
                                        </div>
                                    </div>

                                    <div className="header__menu-divider" />

                                    <div className="header__menu-role">
                                        {
                                            user?.role === 'admin' ? 'Администратор' :
                                                user?.role === 'seller' ? 'Продавец' : 'Пользователь'
                                        }
                                        <div className="header__menu-divider" />
                                    </div>


                                    {user?.role === 'admin' && (
                                        <>
                                            <button
                                                className="header__menu-item"
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    navigate('/users');
                                                }}
                                            >
                                                Управление пользователями
                                            </button>
                                            <div className="header__menu-divider" />
                                        </>
                                    )}


                                    {user?.role === 'admin' && (
                                        <>
                                            <button
                                                className="header__menu-item"
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    navigate('/products');
                                                }}
                                            >
                                                Товары
                                            </button>
                                            <div className="header__menu-divider" />
                                        </>
                                    )}


                                    <button
                                        className="header__menu-item header__menu-item--logout"
                                        onClick={handleLogout}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
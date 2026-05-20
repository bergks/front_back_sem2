import { NavLink } from 'react-router-dom'
import '../styles/components/Header.scss'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">🐱</span>
          <span className="logo-text">МурПриют</span>
        </div>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Главная
          </NavLink>
          <NavLink to="/cats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Наши котики
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
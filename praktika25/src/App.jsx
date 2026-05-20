import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'

// Lazy loading для страниц
const Home = lazy(() => import('./pages/Home'))
const Cats = lazy(() => import('./pages/Cats'))

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Suspense fallback={
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Загрузка...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cats" element={<Cats />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Toast } from './Toast'

export function Layout() {
  return (
    <>
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container">coupangish — 학습용 데모 이커머스 프로젝트</div>
      </footer>
      <Toast />
    </>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleIcon, KakaoIcon, MailIcon, NaverIcon } from './AuthIcons'
import { categoryApi, memberApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import type { Category, JoinProvider, MemberInfo } from '../types'

const PROVIDER_ICON: Record<JoinProvider, typeof MailIcon> = {
  EMAIL: MailIcon,
  GOOGLE: GoogleIcon,
  KAKAO: KakaoIcon,
  NAVER: NaverIcon,
}

export function Header() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [largeCategories, setLargeCategories] = useState<Category[]>([])
  const [member, setMember] = useState<MemberInfo | null>(null)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const logout = useAuthStore((state) => state.logout)
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.count, 0))
  const fetchCart = useCartStore((state) => state.fetchCart)
  const resetCart = useCartStore((state) => state.reset)

  useEffect(() => {
    categoryApi
      .list()
      .then((categories) => setLargeCategories(categories.filter((c) => c.level === 'LARGE')))
      .catch(() => setLargeCategories([]))
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setMember(null)
      resetCart()
      return
    }
    memberApi
      .getMyself()
      .then(setMember)
      .catch(() => setMember(null))
    fetchCart().catch(() => {})
  }, [isLoggedIn, fetchCart, resetCart])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    navigate(keyword.trim() ? `/products?keyword=${encodeURIComponent(keyword.trim())}` : '/products')
  }

  const ProviderIcon = member ? PROVIDER_ICON[member.joinProvider] : null

  return (
    <header className="site-header">
      <div className="container site-header__top">
        <Link to="/" className="site-header__logo">
          coupang<span>ish</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit">검색</button>
        </form>

        <nav className="site-header__actions">
          {isLoggedIn && member && ProviderIcon && (
            <span className="user-greeting">
              <span className="user-greeting__provider">
                <ProviderIcon className="user-greeting__provider-icon" />
              </span>
              {member.lastName}
              {member.firstName}님 환영합니다!
            </span>
          )}
          <Link to="/cart" className="cart-badge">
            장바구니
            {cartCount > 0 && <span className="cart-badge__count">{cartCount}</span>}
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/orders">주문내역</Link>
              <button onClick={logout}>로그아웃</button>
            </>
          ) : (
            <Link to="/login">로그인</Link>
          )}
        </nav>
      </div>

      <div className="site-header__nav">
        <div className="container">
          <ul className="site-header__nav-list">
            <li>
              <Link to="/products">전체상품</Link>
            </li>
            {largeCategories.map((category) => (
              <li key={category.id}>
                <Link to={`/products?categoryId=${category.id}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}

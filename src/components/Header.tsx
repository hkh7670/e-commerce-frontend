import { useEffect, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleIcon, KakaoIcon, MailIcon, NaverIcon } from './AuthIcons'
import { categoryApi, memberApi, productApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import type { Category, JoinProvider, MemberInfo, ProductAutocompleteResult } from '../types'

const AUTOCOMPLETE_DEBOUNCE_MS = 250

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
  const [suggestions, setSuggestions] = useState<ProductAutocompleteResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const accessToken = useAuthStore((state) => state.accessToken)
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
  }, [isLoggedIn, accessToken, fetchCart, resetCart])

  useEffect(() => {
    const trimmed = keyword.trim()
    if (!trimmed) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(() => {
      productApi
        .autocomplete(trimmed)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
    }, AUTOCOMPLETE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [keyword])

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault()
    navigate(
      keyword.trim() ? `/products?keyword=${encodeURIComponent(keyword.trim())}` : '/products',
    )
  }

  const handleSelectSuggestion = (productId: number) => {
    setShowSuggestions(false)
    navigate(`/products/${productId}`)
  }

  const ProviderIcon = member ? PROVIDER_ICON[member.joinProvider] : null

  return (
    <header className="site-header">
      <div className="container site-header__top">
        <Link to="/" className="site-header__logo">
          coupang<span>ish</span>
        </Link>

        <div className="search-bar-wrap">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
            />
            <button type="submit">검색</button>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.productId}
                  className="search-suggestions__item"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectSuggestion(suggestion.productId)}
                >
                  {suggestion.imageUrl && <img src={suggestion.imageUrl} alt={suggestion.name} />}
                  <span>{suggestion.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

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
              <Link to="/account/security">보안 설정</Link>
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

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleIcon, KakaoIcon, MailIcon, NaverIcon } from '../components/AuthIcons'
import { authApi } from '../lib/api'
import { API_BASE_URL } from '../lib/http'
import { useAuthStore } from '../store/authStore'

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google로 시작하기', Icon: GoogleIcon, variant: 'oauth-btn--google' },
  { id: 'kakao', label: '카카오로 시작하기', Icon: KakaoIcon, variant: 'oauth-btn--kakao' },
  { id: 'naver', label: '네이버로 시작하기', Icon: NaverIcon, variant: 'oauth-btn--naver' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const tokens = await authApi.login(email, password)
      setTokens(tokens.accessToken, tokens.refreshToken)
      navigate('/')
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-card">
      <h1>로그인</h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">
            <MailIcon className="field-label-icon" />
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="form-divider">또는</div>

      <div className="oauth-buttons">
        {OAUTH_PROVIDERS.map(({ id, label, Icon, variant }) => (
          <a
            key={id}
            className={`btn btn-block oauth-btn ${variant}`}
            href={`${API_BASE_URL}/oauth2/authorization/${id}`}
          >
            <Icon className="oauth-btn-icon" />
            {label}
          </a>
        ))}
      </div>

      <p className="form-footer">
        아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  )
}

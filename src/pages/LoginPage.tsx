import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleIcon, KakaoIcon, MailIcon, NaverIcon } from '../components/AuthIcons'
import { authApi } from '../lib/api'
import { API_BASE_URL, getApiErrorMessage } from '../lib/http'
import { useAuthStore } from '../store/authStore'

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google로 시작하기', Icon: GoogleIcon, variant: 'oauth-btn--google' },
  { id: 'kakao', label: '카카오로 시작하기', Icon: KakaoIcon, variant: 'oauth-btn--kakao' },
  { id: 'naver', label: '네이버로 시작하기', Icon: NaverIcon, variant: 'oauth-btn--naver' },
]

type Stage = 'login' | 'totp'

export function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [stage, setStage] = useState<Stage>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpPendingToken, setTotpPendingToken] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const result = await authApi.login(email, password)
      if (result.status === 'NEED_TOTP' && result.totpPendingToken) {
        setTotpPendingToken(result.totpPendingToken)
        setStage('totp')
        return
      }
      if (result.accessToken && result.refreshToken) {
        setTokens(result.accessToken, result.refreshToken)
        navigate('/')
      }
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTotpSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const tokens = await authApi.totpLogin(totpPendingToken, totpCode)
      setTokens(tokens.accessToken, tokens.refreshToken)
      navigate('/')
    } catch (err) {
      setError(getApiErrorMessage(err, '인증 코드가 올바르지 않습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    setStage('login')
    setTotpPendingToken('')
    setTotpCode('')
    setError(null)
  }

  if (stage === 'totp') {
    return (
      <div className="form-card">
        <h1>OTP 코드 입력</h1>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleTotpSubmit}>
          <div className="field">
            <label htmlFor="totpCode">OTP 앱에 표시된 6자리 코드</label>
            <input
              id="totpCode"
              type="text"
              inputMode="numeric"
              autoFocus
              required
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? '확인 중...' : '확인'}
          </button>
        </form>

        <p className="form-footer">
          <button type="button" className="link-button" onClick={handleBackToLogin}>
            로그인으로 돌아가기
          </button>
        </p>
      </div>
    )
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

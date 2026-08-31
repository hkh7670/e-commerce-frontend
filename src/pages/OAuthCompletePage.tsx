import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../lib/api'
import { todayDateString } from '../lib/date'
import { useAuthStore } from '../store/authStore'

type Stage = 'exchanging' | 'need-sign-up' | 'error'

export function OAuthCompletePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [stage, setStage] = useState<Stage>('exchanging')
  const [tempToken, setTempToken] = useState('')
  const [form, setForm] = useState({ lastName: '', firstName: '', birthDate: '', phoneNumber: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasExchangedRef = useRef(false)

  useEffect(() => {
    if (hasExchangedRef.current) return
    hasExchangedRef.current = true

    const code = searchParams.get('code')
    if (!code) {
      setStage('error')
      return
    }
    authApi
      .oauthExchange(code)
      .then((result) => {
        if (result.status === 'LOGIN' && result.accessToken && result.refreshToken) {
          setTokens(result.accessToken, result.refreshToken)
          navigate('/')
          return
        }
        if (result.status === 'NEED_SIGN_UP' && result.tempToken) {
          setTempToken(result.tempToken)
          setStage('need-sign-up')
          return
        }
        setStage('error')
      })
      .catch(() => setStage('error'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const tokens = await authApi.oauthSignUp({ tempToken, ...form })
      setTokens(tokens.accessToken, tokens.refreshToken)
      navigate('/')
    } catch {
      setError('회원가입에 실패했습니다. 입력값을 확인해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === 'exchanging') {
    return <div className="loading-state">로그인 처리 중입니다...</div>
  }

  if (stage === 'error') {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>로그인에 실패했습니다</h2>
          <p>다시 시도해주세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="form-card">
      <h1>추가 정보 입력</h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="lastName">성</label>
          <input id="lastName" required value={form.lastName} onChange={update('lastName')} />
        </div>
        <div className="field">
          <label htmlFor="firstName">이름</label>
          <input id="firstName" required value={form.firstName} onChange={update('firstName')} />
        </div>
        <div className="field">
          <label htmlFor="birthDate">생년월일</label>
          <input
            id="birthDate"
            type="date"
            required
            max={todayDateString()}
            value={form.birthDate}
            onChange={update('birthDate')}
          />
        </div>
        <div className="field">
          <label htmlFor="phoneNumber">휴대전화번호</label>
          <input
            id="phoneNumber"
            required
            placeholder="010-1234-5678"
            value={form.phoneNumber}
            onChange={update('phoneNumber')}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? '가입 중...' : '가입 완료하기'}
        </button>
      </form>
    </div>
  )
}

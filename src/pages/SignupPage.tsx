import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export function SignupPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    birthDate: '',
    phoneNumber: '',
    email: '',
    password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    if (form.password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const tokens = await authApi.signUp(form)
      setTokens(tokens.accessToken, tokens.refreshToken)
      navigate('/')
    } catch {
      setError('회원가입에 실패했습니다. 입력값을 확인해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-card">
      <h1>회원가입</h1>

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
          <input id="birthDate" type="date" required value={form.birthDate} onChange={update('birthDate')} />
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
        <div className="field">
          <label htmlFor="email">이메일</label>
          <input id="email" type="email" required value={form.email} onChange={update('email')} />
        </div>
        <div className="field">
          <label htmlFor="password">비밀번호</label>
          <input id="password" type="password" required value={form.password} onChange={update('password')} />
          <p className="field-error" style={{ color: 'var(--color-text-faint)' }}>
            영문/숫자/특수문자 포함 10~64자
          </p>
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </form>

      <p className="form-footer">
        이미 회원이신가요? <Link to="/login">로그인</Link>
      </p>
    </div>
  )
}

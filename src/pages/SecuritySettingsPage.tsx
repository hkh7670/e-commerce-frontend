import { useEffect, useState, type SubmitEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { authApi, memberApi } from '../lib/api'
import { getApiErrorMessage } from '../lib/http'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import type { TotpEnrollResult } from '../types'

export function SecuritySettingsPage() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  const [totpEnabled, setTotpEnabled] = useState<boolean | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [enrollment, setEnrollment] = useState<TotpEnrollResult | null>(null)
  const [enrollLoading, setEnrollLoading] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [enrollCode, setEnrollCode] = useState('')
  const [enrollConfirming, setEnrollConfirming] = useState(false)

  const [disableCode, setDisableCode] = useState('')
  const [disabling, setDisabling] = useState(false)
  const [disableError, setDisableError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      setStatusLoading(false)
      return
    }
    setStatusLoading(true)
    setStatusError(null)
    memberApi
      .getMyself()
      .then((member) => setTotpEnabled(member.totpEnabled))
      .catch((err) => setStatusError(getApiErrorMessage(err, '상태를 불러오지 못했습니다.')))
      .finally(() => setStatusLoading(false))
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>로그인이 필요합니다</h2>
        </div>
      </div>
    )
  }

  const handleStartEnroll = async () => {
    setEnrollLoading(true)
    setEnrollError(null)
    try {
      const result = await authApi.totpEnroll()
      setEnrollment(result)
      setEnrollCode('')
    } catch (err) {
      setEnrollError(getApiErrorMessage(err, '설정을 시작하지 못했습니다.'))
    } finally {
      setEnrollLoading(false)
    }
  }

  const handleConfirmEnroll = async (e: SubmitEvent) => {
    e.preventDefault()
    setEnrollConfirming(true)
    setEnrollError(null)
    try {
      await authApi.totpEnrollConfirm(enrollCode)
      setEnrollment(null)
      setEnrollCode('')
      setTotpEnabled(true)
      useToastStore.getState().show('2단계 인증이 활성화되었습니다.')
    } catch (err) {
      setEnrollError(getApiErrorMessage(err, '코드가 올바르지 않습니다.'))
    } finally {
      setEnrollConfirming(false)
    }
  }

  const handleDisable = async (e: SubmitEvent) => {
    e.preventDefault()
    setDisabling(true)
    setDisableError(null)
    try {
      await authApi.totpDisable(disableCode)
      setDisableCode('')
      setTotpEnabled(false)
      useToastStore.getState().show('2단계 인증이 해제되었습니다.')
    } catch (err) {
      setDisableError(getApiErrorMessage(err, '코드가 올바르지 않습니다.'))
    } finally {
      setDisabling(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 'var(--space-5)' }}>보안 설정</h1>

      {statusLoading && <div className="loading-state">불러오는 중...</div>}

      {!statusLoading && statusError && <div className="error-banner">{statusError}</div>}

      {!statusLoading && !statusError && totpEnabled === false && (
        <div className="form-card">
          <h2 style={{ fontSize: 16, marginBottom: 'var(--space-3)' }}>OTP 앱 2단계 인증 설정</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Google Authenticator 등 OTP 앱으로 QR 코드를 스캔해 2단계 인증을 켤 수 있습니다.
          </p>

          {enrollError && <div className="error-banner">{enrollError}</div>}

          {!enrollment ? (
            <button className="btn btn-outline" onClick={handleStartEnroll} disabled={enrollLoading}>
              {enrollLoading ? '준비 중...' : '설정 시작'}
            </button>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <QRCodeSVG value={enrollment.otpAuthUri} size={180} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
                QR을 스캔할 수 없다면 앱에 이 코드를 직접 입력하세요: <strong>{enrollment.secret}</strong>
              </p>
              <form onSubmit={handleConfirmEnroll}>
                <div className="field">
                  <label htmlFor="enrollCode">OTP 앱에 표시된 6자리 코드</label>
                  <input
                    id="enrollCode"
                    type="text"
                    inputMode="numeric"
                    required
                    value={enrollCode}
                    onChange={(e) => setEnrollCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={enrollConfirming}>
                  {enrollConfirming ? '확인 중...' : '확인하고 활성화'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {!statusLoading && !statusError && totpEnabled === true && (
        <div className="form-card">
          <h2 style={{ fontSize: 16, marginBottom: 'var(--space-3)' }}>2단계 인증 해제</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            현재 OTP 앱 2단계 인증이 활성화되어 있습니다.
          </p>

          {disableError && <div className="error-banner">{disableError}</div>}

          <form onSubmit={handleDisable}>
            <div className="field">
              <label htmlFor="disableCode">현재 OTP 코드</label>
              <input
                id="disableCode"
                type="text"
                inputMode="numeric"
                required
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-outline btn-block" disabled={disabling}>
              {disabling ? '해제 중...' : '해제'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

import { Link, useSearchParams } from 'react-router-dom'

export function OAuthErrorPage() {
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error') ?? '알 수 없는 오류'

  return (
    <div className="container">
      <div className="empty-state">
        <h2>소셜 로그인에 실패했습니다</h2>
        <p>{error}</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
          로그인 페이지로 돌아가기
        </Link>
      </div>
    </div>
  )
}

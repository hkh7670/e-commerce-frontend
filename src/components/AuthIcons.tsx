type IconProps = {
  className?: string
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.4 5.4 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A9 9 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

export function KakaoIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="#FEE500" />
      <path
        fill="#3C1E1E"
        d="M9 4.2c-3.31 0-6 2.16-6 4.83 0 1.72 1.12 3.23 2.81 4.09-.12.46-.45 1.63-.51 1.88-.08.31.11.3.24.22.1-.07 1.56-1.06 2.2-1.5.4.06.78.08 1.26.08 3.31 0 6-2.16 6-4.83S12.31 4.2 9 4.2z"
      />
    </svg>
  )
}

export function NaverIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect width="18" height="18" rx="4" fill="#03C75A" />
      <path fill="#fff" d="M10.68 5v4.32L6.9 5H4.5v8h2.82V8.68L11.1 13h2.4V5h-2.82z" />
    </svg>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2.5"
        y="4.5"
        width="15"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.5 5.5l6.5 5 6.5-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

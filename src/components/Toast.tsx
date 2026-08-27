import { useToastStore } from '../store/toastStore'

export function Toast() {
  const message = useToastStore((state) => state.message)

  if (!message) {
    return null
  }

  return (
    <div className="toast" role="alert">
      {message}
    </div>
  )
}

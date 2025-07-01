import { useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useUser } from './use-user'

export function useAuthRedirect({ redirectIfAuthenticated = false } = {}) {
  const { data: user, isPending, isFetched } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isFetched) return

    if (!user && !redirectIfAuthenticated) {
      router.navigate({ to: '/auth' })
    }

    if (user && redirectIfAuthenticated) {
      router.navigate({ to: '/' })
    }
  }, [user, isFetched, redirectIfAuthenticated, router])

  return { user, loading: isPending }
}

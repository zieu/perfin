import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import type { QueryClient } from '@tanstack/react-query'
import { useAuthRedirect } from '@/hooks/use-auth-redirect.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    useAuthRedirect()
    return (
      <>
        <Toaster />
        <Outlet />
        <TanStackRouterDevtools />

        <TanStackQueryLayout />
      </>
    )
  },
})

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/table')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/demo/table"!</div>
}

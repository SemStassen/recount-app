import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_app/$workspaceSlug/settings/integrations/_providers/linear/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello "/_app/$workspaceSlug/settings/integrations/_providers/linear/"!
    </div>
  )
}

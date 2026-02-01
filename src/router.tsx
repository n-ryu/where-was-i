import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  Link,
} from '@tanstack/react-router'
import {
  HomePage,
  PlanPage,
  ReviewPage,
  GoalsPage,
  SettingsPage,
} from './pages'

const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div>
      <nav>
        <Link to="/">메인</Link>
        <Link to="/plan">계획</Link>
        <Link to="/review">회고</Link>
        <Link to="/goals">Goal</Link>
        <Link to="/settings">설정</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const planRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/plan',
  component: PlanPage,
})

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: ReviewPage,
})

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals',
  component: GoalsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  planRoute,
  reviewRoute,
  goalsRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

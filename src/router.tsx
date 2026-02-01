import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  Link,
  useRouterState,
} from '@tanstack/react-router'
import styled from 'styled-components'
import { HomePage, PlanPage, ReviewPage, SettingsPage } from './pages'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
`

const Main = styled.main`
  flex: 1;
  padding-bottom: 60px; /* 탭바 높이만큼 여백 */
`

const TabBar = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  z-index: 50;
`

const TabLink = styled(Link)<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${(props) => (props.$active ? '#1976d2' : '#666')};
  font-size: 12px;
  gap: 4px;
  transition: color 0.2s;

  &:hover {
    color: #1976d2;
  }
`

const TabIcon = styled.span`
  font-size: 20px;
`

const TabLabel = styled.span`
  font-weight: 500;
`

const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <AppContainer>
      <Main>
        <Outlet />
      </Main>
      <TabBar>
        <TabLink to="/" $active={currentPath === '/'}>
          <TabIcon>📋</TabIcon>
          <TabLabel>과업</TabLabel>
        </TabLink>
        <TabLink to="/plan" $active={currentPath === '/plan'}>
          <TabIcon>📝</TabIcon>
          <TabLabel>계획</TabLabel>
        </TabLink>
        <TabLink to="/log" $active={currentPath === '/log'}>
          <TabIcon>📊</TabIcon>
          <TabLabel>로그</TabLabel>
        </TabLink>
        <TabLink to="/settings" $active={currentPath === '/settings'}>
          <TabIcon>⚙️</TabIcon>
          <TabLabel>설정</TabLabel>
        </TabLink>
      </TabBar>
    </AppContainer>
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

const logRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/log',
  component: ReviewPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  planRoute,
  logRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

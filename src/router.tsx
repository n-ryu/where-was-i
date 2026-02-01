import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  Link,
  useRouterState,
} from '@tanstack/react-router'
import styled, { createGlobalStyle } from 'styled-components'
import { HomePage, PlanPage, LogPage, SettingsPage } from './pages'

const MOBILE_WIDTH = 390 // iPhone 14 기준

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
`

const SimulatorWrapper = styled.div`
  height: 100vh;
  height: 100dvh;
  background: #1a1a2e;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  @media (max-width: ${MOBILE_WIDTH}px) {
    background: #fff;
  }
`

const PhoneFrame = styled.div`
  width: ${MOBILE_WIDTH}px;
  height: 85vh;
  height: 85dvh;
  max-height: 844px; /* iPhone 14 높이 */
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  /* transform으로 새로운 containing block 생성 - fixed 요소가 이 안에서 위치함 */
  transform: translateZ(0);

  @media (max-width: ${MOBILE_WIDTH}px) {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    border-radius: 0;
    box-shadow: none;
    transform: none;
  }
`

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`

const Main = styled.main`
  flex: 1;
  padding-bottom: 60px; /* 탭바 높이만큼 여백 */
  overflow-y: auto;
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
    <>
      <GlobalStyle />
      <SimulatorWrapper>
        <PhoneFrame>
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
        </PhoneFrame>
      </SimulatorWrapper>
    </>
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
  component: LogPage,
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

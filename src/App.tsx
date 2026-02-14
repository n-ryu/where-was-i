import styled from 'styled-components'

const Container = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding: 2rem;
`

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
`

export function App() {
  return (
    <Container>
      <Title>where was i</Title>
    </Container>
  )
}

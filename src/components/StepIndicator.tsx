import styled from 'styled-components'

export interface StepIndicatorProps {
  steps: { key: string; label: string }[]
  currentStep: string
  completedSteps: string[]
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
`

const Step = styled.div<{ $current: boolean; $completed: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  background: ${(props) =>
    props.$current ? '#1976d2' : props.$completed ? '#e8f5e9' : '#f5f5f5'};
  color: ${(props) =>
    props.$current ? 'white' : props.$completed ? '#4caf50' : '#666'};
  font-weight: ${(props) => (props.$current ? '600' : '400')};
`

const Connector = styled.div`
  display: flex;
  align-items: center;
  color: #ddd;
`

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
}: StepIndicatorProps) {
  return (
    <Container>
      {steps.map((step, index) => {
        const isCurrent = step.key === currentStep
        const isCompleted = completedSteps.includes(step.key)

        return (
          <div
            key={step.key}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Step
              $current={isCurrent}
              $completed={isCompleted}
              data-current={isCurrent}
              data-completed={isCompleted}
            >
              {step.label}
            </Step>
            {index < steps.length - 1 && <Connector>→</Connector>}
          </div>
        )
      })}
    </Container>
  )
}

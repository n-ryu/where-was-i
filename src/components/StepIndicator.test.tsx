import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StepIndicator } from './StepIndicator'

describe('StepIndicator', () => {
  const steps = [
    { key: 'step1', label: '1단계' },
    { key: 'step2', label: '2단계' },
    { key: 'step3', label: '3단계' },
  ]

  describe('기본 렌더링', () => {
    it('3개의 Step이 표시되어야 한다', () => {
      render(
        <StepIndicator steps={steps} currentStep="step1" completedSteps={[]} />
      )
      expect(screen.getByText('1단계')).toBeInTheDocument()
      expect(screen.getByText('2단계')).toBeInTheDocument()
      expect(screen.getByText('3단계')).toBeInTheDocument()
    })

    it('현재 Step이 강조 표시되어야 한다', () => {
      render(
        <StepIndicator
          steps={steps}
          currentStep="step2"
          completedSteps={['step1']}
        />
      )
      const currentStep = screen
        .getByText('2단계')
        .closest('[data-current="true"]')
      expect(currentStep).toBeInTheDocument()
    })

    it('완료된 Step이 완료 상태로 표시되어야 한다', () => {
      render(
        <StepIndicator
          steps={steps}
          currentStep="step3"
          completedSteps={['step1', 'step2']}
        />
      )
      const completedStep1 = screen
        .getByText('1단계')
        .closest('[data-completed="true"]')
      const completedStep2 = screen
        .getByText('2단계')
        .closest('[data-completed="true"]')
      expect(completedStep1).toBeInTheDocument()
      expect(completedStep2).toBeInTheDocument()
    })
  })
})

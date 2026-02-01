import type { Meta, StoryObj } from '@storybook/react'
import { StepIndicator } from './StepIndicator'

const meta: Meta<typeof StepIndicator> = {
  title: 'Components/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof StepIndicator>

const steps = [
  { key: 'uncompleted', label: '미완료 과업' },
  { key: 'create', label: '새 과업 추가' },
]

export const FirstStep: Story = {
  args: {
    steps,
    currentStep: 'uncompleted',
    completedSteps: [],
  },
}

export const SecondStep: Story = {
  args: {
    steps,
    currentStep: 'create',
    completedSteps: ['uncompleted'],
  },
}

export const AllCompleted: Story = {
  args: {
    steps,
    currentStep: '',
    completedSteps: ['uncompleted', 'create'],
  },
}

export const ThreeSteps: Story = {
  args: {
    steps: [
      { key: 'review', label: '검토' },
      { key: 'plan', label: '계획' },
      { key: 'execute', label: '실행' },
    ],
    currentStep: 'plan',
    completedSteps: ['review'],
  },
}

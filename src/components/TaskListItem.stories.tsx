import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, userEvent, within } from '@storybook/test'
import { TaskListItem } from './TaskListItem'
import type { Task } from '../types'

const baseTask: Task = {
  id: 'task-1',
  title: '테스트 과업',
  status: 'pending',
  date: '2025-01-31',
  events: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const meta: Meta<typeof TaskListItem> = {
  title: 'Components/TaskListItem',
  component: TaskListItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onStatusChange: fn(),
    onUpdate: fn(),
    onDelete: fn(),
  },
}

export default meta
type Story = StoryObj<typeof TaskListItem>

export const Pending: Story = {
  args: {
    task: baseTask,
  },
}

export const InProgress: Story = {
  args: {
    task: {
      ...baseTask,
      status: 'in_progress',
      title: '진행 중인 과업',
      events: [
        {
          eventType: 'started',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
        },
      ],
    },
  },
}

export const Completed: Story = {
  args: {
    task: {
      ...baseTask,
      status: 'completed',
      title: '완료된 과업',
      events: [
        {
          eventType: 'started',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
        },
        { eventType: 'completed', timestamp: new Date() },
      ],
    },
  },
}

export const LongTitle: Story = {
  args: {
    task: {
      ...baseTask,
      title:
        '이것은 매우 긴 제목을 가진 과업입니다. 긴 텍스트가 어떻게 표시되는지 확인하기 위한 테스트입니다.',
    },
  },
}

export const StartTask: Story = {
  args: {
    task: baseTask,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 과업 클릭하여 시작
    const taskTitle = canvas.getByText('테스트 과업')
    await userEvent.click(taskTitle)

    // onStatusChange가 호출되었는지 확인
    await expect(args.onStatusChange).toHaveBeenCalledWith(
      'task-1',
      'in_progress',
      'started'
    )
  },
}

export const CompleteTask: Story = {
  args: {
    task: baseTask,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 체크박스 클릭하여 완료
    const checkbox = canvas.getByRole('checkbox')
    await userEvent.click(checkbox)

    // onStatusChange가 호출되었는지 확인
    await expect(args.onStatusChange).toHaveBeenCalledWith(
      'task-1',
      'completed',
      'completed'
    )
  },
}

export const EditMode: Story = {
  args: {
    task: baseTask,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 편집 버튼 클릭
    const editButton = canvas.getByRole('button', { name: '편집' })
    await userEvent.click(editButton)

    // 편집 모드가 활성화되었는지 확인
    const input = canvas.getByPlaceholderText('과업 제목')
    await expect(input).toBeVisible()
    await expect(input).toHaveValue('테스트 과업')
  },
}

export const EditAndSave: Story = {
  args: {
    task: baseTask,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 편집 버튼 클릭
    const editButton = canvas.getByRole('button', { name: '편집' })
    await userEvent.click(editButton)

    // 입력 필드 수정
    const input = canvas.getByPlaceholderText('과업 제목')
    await userEvent.clear(input)
    await userEvent.type(input, '수정된 과업 제목', { delay: 30 })

    // 저장 버튼 클릭
    const saveButton = canvas.getByRole('button', { name: '저장' })
    await userEvent.click(saveButton)

    // onUpdate가 호출되었는지 확인
    await expect(args.onUpdate).toHaveBeenCalledWith('task-1', {
      title: '수정된 과업 제목',
    })
  },
}

export const DeleteConfirmation: Story = {
  args: {
    task: baseTask,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 삭제 버튼 클릭
    const deleteButton = canvas.getByRole('button', { name: '삭제' })
    await userEvent.click(deleteButton)

    // 확인 메시지가 표시되는지 확인
    await expect(canvas.getByText('정말 삭제하시겠습니까?')).toBeVisible()
  },
}

export const DeleteConfirm: Story = {
  args: {
    task: baseTask,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 삭제 버튼 클릭
    const deleteButton = canvas.getByRole('button', { name: '삭제' })
    await userEvent.click(deleteButton)

    // 확인 버튼 클릭
    const confirmButton = canvas.getByRole('button', { name: '확인' })
    await userEvent.click(confirmButton)

    // onDelete가 호출되었는지 확인
    await expect(args.onDelete).toHaveBeenCalledWith('task-1')
  },
}

export const DeleteCancel: Story = {
  args: {
    task: baseTask,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 삭제 버튼 클릭
    const deleteButton = canvas.getByRole('button', { name: '삭제' })
    await userEvent.click(deleteButton)

    // 취소 버튼 클릭
    const cancelButton = canvas.getByRole('button', { name: '취소' })
    await userEvent.click(cancelButton)

    // onDelete가 호출되지 않았는지 확인
    await expect(args.onDelete).not.toHaveBeenCalled()

    // 삭제 버튼이 다시 표시되는지 확인
    await expect(canvas.getByRole('button', { name: '삭제' })).toBeVisible()
  },
}

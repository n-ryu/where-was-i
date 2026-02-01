import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskForm } from './TaskForm'

describe('TaskForm', () => {
  const defaultProps = {
    onCreate: vi.fn(),
  }

  describe('기본 렌더링', () => {
    it('제목 입력 필드를 표시한다', () => {
      render(<TaskForm {...defaultProps} />)
      expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
    })

    it('생성 버튼을 표시한다', () => {
      render(<TaskForm {...defaultProps} />)
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
    })
  })

  describe('Task 생성', () => {
    it('제목 입력 후 생성 버튼 클릭 시 onCreate를 호출한다', () => {
      const onCreate = vi.fn()
      render(<TaskForm onCreate={onCreate} />)
      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(onCreate).toHaveBeenCalledWith({
        title: '새로운 과업',
      })
    })

    it('생성 후 입력 필드를 초기화한다', () => {
      render(<TaskForm {...defaultProps} />)
      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(input).toHaveValue('')
    })

    it('제목이 비어있으면 생성 버튼이 비활성화된다', () => {
      render(<TaskForm {...defaultProps} />)
      const button = screen.getByRole('button', { name: '추가' })
      expect(button).toBeDisabled()
    })
  })

  describe('Enter 키 지원', () => {
    it('Enter 키 입력 시 Task를 생성한다', () => {
      const onCreate = vi.fn()
      render(<TaskForm onCreate={onCreate} />)
      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      expect(onCreate).toHaveBeenCalledWith({
        title: '새로운 과업',
      })
    })
  })
})

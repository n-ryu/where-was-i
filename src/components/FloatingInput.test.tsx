import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FloatingInput } from './FloatingInput'

describe('FloatingInput', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
  }

  describe('기본 렌더링', () => {
    it('입력 필드가 표시되어야 한다', () => {
      render(<FloatingInput {...defaultProps} />)
      expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
    })

    it('커스텀 placeholder를 표시할 수 있다', () => {
      render(
        <FloatingInput {...defaultProps} placeholder="과업을 입력하세요" />
      )
      expect(
        screen.getByPlaceholderText('과업을 입력하세요')
      ).toBeInTheDocument()
    })

    it('추가 버튼이 표시되어야 한다', () => {
      render(<FloatingInput {...defaultProps} />)
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
    })

    it('입력이 비어있으면 버튼이 비활성화된다', () => {
      render(<FloatingInput {...defaultProps} />)
      expect(screen.getByRole('button', { name: '추가' })).toBeDisabled()
    })
  })

  describe('제출 동작', () => {
    it('버튼 클릭 시 onSubmit이 호출된다', () => {
      const onSubmit = vi.fn()
      render(<FloatingInput onSubmit={onSubmit} />)

      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새 과업' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))

      expect(onSubmit).toHaveBeenCalledWith('새 과업')
    })

    it('Enter 키 입력 시 onSubmit이 호출된다', () => {
      const onSubmit = vi.fn()
      render(<FloatingInput onSubmit={onSubmit} />)

      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새 과업' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(onSubmit).toHaveBeenCalledWith('새 과업')
    })

    it('제출 후 입력 필드가 초기화된다', () => {
      render(<FloatingInput {...defaultProps} />)

      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새 과업' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))

      expect(input).toHaveValue('')
    })

    it('공백만 있는 입력은 제출되지 않는다', () => {
      const onSubmit = vi.fn()
      render(<FloatingInput onSubmit={onSubmit} />)

      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('입력값의 앞뒤 공백이 제거되어 제출된다', () => {
      const onSubmit = vi.fn()
      render(<FloatingInput onSubmit={onSubmit} />)

      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '  새 과업  ' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))

      expect(onSubmit).toHaveBeenCalledWith('새 과업')
    })
  })

  describe('접근성', () => {
    it('입력 필드에 aria-label이 있어야 한다', () => {
      render(<FloatingInput {...defaultProps} />)
      expect(screen.getByLabelText('새 과업 입력')).toBeInTheDocument()
    })

    it('버튼에 aria-label이 있어야 한다', () => {
      render(<FloatingInput {...defaultProps} />)
      expect(screen.getByLabelText('추가')).toBeInTheDocument()
    })
  })
})

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'

interface ContextMenuProps {
  position: { x: number; y: number }
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

const menuEnter = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
`

const Menu = styled.div`
  position: fixed;
  z-index: 101;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 120px;
  overflow: hidden;
  animation: ${menuEnter} 150ms ease-out;
`

const MenuItem = styled.button<{ $danger?: boolean }>`
  all: unset;
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  font-size: 0.9rem;
  cursor: pointer;
  color: ${({ $danger }) => ($danger ? '#ef4444' : 'inherit')};
  transition: background 100ms ease;

  &:hover,
  &:active {
    background: ${({ theme }) => theme.colors.surface};
  }
`

export const ContextMenu = ({
  position,
  onEdit,
  onDelete,
  onClose,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return

    const rect = menu.getBoundingClientRect()
    const { innerWidth, innerHeight } = window

    let x = position.x
    let y = position.y

    if (x + rect.width > innerWidth) {
      x = innerWidth - rect.width - 8
    }
    if (y + rect.height > innerHeight) {
      y = innerHeight - rect.height - 8
    }

    menu.style.left = `${x}px`
    menu.style.top = `${y}px`
  }, [position])

  return createPortal(
    <>
      <Overlay onClick={onClose} />
      <Menu ref={menuRef} style={{ left: position.x, top: position.y }}>
        <MenuItem onClick={onEdit}>수정</MenuItem>
        <MenuItem $danger onClick={onDelete}>
          삭제
        </MenuItem>
      </Menu>
    </>,
    document.body,
  )
}

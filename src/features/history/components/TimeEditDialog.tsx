import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styled, { keyframes } from 'styled-components'
import type { HistoryItem, Session, SessionConflict } from '@/utils/sessionUtils'

interface TimeEditDialogProps {
  item: HistoryItem
  todoTitle: string
  startMin: string
  startMax: string
  endMin: string
  endMax: string
  onSave: (startTime: string, endTime: string | null) => void
  onClose: () => void
  conflicts: SessionConflict[] | null
}

const fadeIn = keyframes`
  from { opacity: 0 }
  to { opacity: 1 }
`

const slideUp = keyframes`
  from { transform: translateY(16px); opacity: 0 }
  to { transform: translateY(0); opacity: 1 }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 150ms ease-out;
`

const Dialog = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 280px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  animation: ${slideUp} 150ms ease-out;
`

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`

const TodoName = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const Label = styled.label`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 36px;
  flex-shrink: 0;
`

const TimeInput = styled.input`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 1rem;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ButtonRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md};
`

const Button = styled.button<{ $primary?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $primary }) => ($primary ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $primary }) =>
    $primary ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, $primary }) =>
    $primary ? '#fff' : theme.colors.text};
  cursor: pointer;
  transition: opacity 150ms ease;

  &:active {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const formatTimeValue = (date: Date): string => {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export const TimeEditDialog = ({
  item,
  todoTitle,
  startMin,
  startMax,
  endMin,
  endMax,
  onSave,
  onClose,
  conflicts,
}: TimeEditDialogProps) => {
  const isSession = item.type === 'session'
  const session = isSession ? (item as Session) : null

  const [startTime, setStartTime] = useState(
    isSession ? formatTimeValue(session!.startTime) : formatTimeValue(item.timestamp),
  )
  const [endTime, setEndTime] = useState(
    session?.endTime ? formatTimeValue(session.endTime) : null,
  )

  const [localConflicts, setLocalConflicts] = useState<SessionConflict[] | null>(null)

  useEffect(() => {
    setLocalConflicts(conflicts)
  }, [conflicts])

  const handleStartChange = (value: string) => {
    setStartTime(value)
    setLocalConflicts(null)
  }

  const handleEndChange = (value: string) => {
    setEndTime(value)
    setLocalConflicts(null)
  }

  const isInverted =
    isSession && endTime !== null && timeToMinutes(startTime) > timeToMinutes(endTime)

  const hasConflicts = localConflicts !== null && localConflicts.length > 0
  const canSave = !isInverted && !hasConflicts

  const effectiveStartMax =
    isSession && endTime !== null
      ? timeToMinutes(endTime) < timeToMinutes(startMax)
        ? endTime
        : startMax
      : startMax

  const effectiveEndMin = isSession
    ? timeToMinutes(startTime) > timeToMinutes(endMin)
      ? startTime
      : endMin
    : endMin

  const handleSave = () => {
    if (!canSave) return
    onSave(startTime, endTime)
  }

  return createPortal(
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Title>시간 수정</Title>
        <TodoName>{todoTitle}</TodoName>

        {isSession ? (
          <>
            <FieldRow>
              <Label>시작</Label>
              <TimeInput
                type="time"
                value={startTime}
                min={startMin}
                max={effectiveStartMax}
                onChange={(e) => handleStartChange(e.target.value)}
              />
            </FieldRow>
            {endTime !== null && (
              <FieldRow>
                <Label>종료</Label>
                <TimeInput
                  type="time"
                  value={endTime}
                  min={effectiveEndMin}
                  max={endMax}
                  onChange={(e) => handleEndChange(e.target.value)}
                />
              </FieldRow>
            )}
          </>
        ) : (
          <FieldRow>
            <Label>시간</Label>
            <TimeInput
              type="time"
              value={startTime}
              min={startMin}
              max={startMax}
              onChange={(e) => handleStartChange(e.target.value)}
            />
          </FieldRow>
        )}

        {isInverted && (
          <ErrorMessage>시작 시간이 종료 시간보다 늦을 수 없습니다.</ErrorMessage>
        )}

        {hasConflicts && (
          <ErrorMessage>
            다른 세션과 시간이 겹칩니다. 시간을 조정해주세요.
          </ErrorMessage>
        )}

        <ButtonRow>
          <Button onClick={onClose}>취소</Button>
          <Button $primary onClick={handleSave} disabled={!canSave}>
            저장
          </Button>
        </ButtonRow>
      </Dialog>
    </Overlay>,
    document.body,
  )
}

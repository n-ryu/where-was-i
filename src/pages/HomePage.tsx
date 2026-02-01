import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'
import { FloatingInput } from '../components/FloatingInput'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import * as taskRepository from '../db/taskRepository'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 100px; /* FloatingInput 공간 */
`

const Header = styled.header`
  margin-bottom: 24px;
`

const Title = styled.h1`
  font-size: 24px;
  margin: 0 0 8px 0;
`

const DateText = styled.p`
  color: #666;
  margin: 0;
`

const LoadingContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  text-align: center;
  color: #666;
`

function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function formatDateKorean(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${year}년 ${month}월 ${day}일 (${weekday})`
}

export function HomePage() {
  const navigate = useNavigate()
  const today = getTodayString()

  const tasks = useLiveQuery(
    () => taskRepository.getTasksByDate(today),
    [today]
  )

  // 오늘 Task가 없으면 /plan으로 리다이렉트
  useEffect(() => {
    if (tasks !== undefined && tasks.length === 0) {
      navigate({ to: '/plan' })
    }
  }, [tasks, navigate])

  const handleCreate = async (title: string) => {
    await taskRepository.createTask({
      title,
      date: today,
    })
  }

  const handleBatchStatusChange = async (changes: TaskStatusChange[]) => {
    await taskRepository.batchUpdateTaskStatus(changes)
  }

  const handleUpdate = async (id: string, input: { title?: string }) => {
    await taskRepository.updateTask(id, input)
  }

  const handleDelete = async (id: string) => {
    await taskRepository.deleteTask(id)
  }

  if (tasks === undefined) {
    return <LoadingContainer>로딩 중...</LoadingContainer>
  }

  // 리다이렉트 중이면 아무것도 렌더링하지 않음
  if (tasks.length === 0) {
    return null
  }

  return (
    <Container>
      <Header>
        <Title>오늘의 할 일</Title>
        <DateText>{formatDateKorean(today)}</DateText>
      </Header>

      <section>
        <TaskList
          tasks={tasks}
          onBatchStatusChange={handleBatchStatusChange}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </section>

      <FloatingInput
        placeholder="새 과업을 입력하세요"
        onSubmit={handleCreate}
      />
    </Container>
  )
}

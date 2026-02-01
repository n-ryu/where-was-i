import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import type { Task, Goal } from '../types'
import { TaskForm } from '../components/TaskForm'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import * as taskRepository from '../db/taskRepository'
import * as goalRepository from '../db/goalRepository'

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
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
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const today = getTodayString()

  const loadData = useCallback(async () => {
    try {
      const [todayTasks, activeGoals] = await Promise.all([
        taskRepository.getTasksByDate(today),
        goalRepository.getActiveGoals(),
      ])
      setTasks(todayTasks)
      setGoals(activeGoals)
    } finally {
      setIsLoading(false)
    }
  }, [today])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = async (input: { title: string; goalId?: string }) => {
    await taskRepository.createTask({
      title: input.title,
      date: today,
      goalId: input.goalId,
    })
    await loadData()
  }

  const handleBatchStatusChange = async (changes: TaskStatusChange[]) => {
    await taskRepository.batchUpdateTaskStatus(changes)
    await loadData()
  }

  const handleUpdate = async (
    id: string,
    input: { title?: string; goalId?: string }
  ) => {
    await taskRepository.updateTask(id, input)
    await loadData()
  }

  const handleDelete = async (id: string) => {
    await taskRepository.deleteTask(id)
    await loadData()
  }

  if (isLoading) {
    return (
      <Container>
        <p>로딩 중...</p>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>오늘의 할 일</Title>
        <DateText>{formatDateKorean(today)}</DateText>
      </Header>

      <TaskForm goals={goals} onCreate={handleCreate} />

      <section style={{ marginTop: '24px' }}>
        <TaskList
          tasks={tasks}
          goals={goals}
          onBatchStatusChange={handleBatchStatusChange}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </section>
    </Container>
  )
}

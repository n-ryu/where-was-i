import { useEffect, useState, useRef, type ReactNode } from 'react'
import type { Decorator, StoryContext } from '@storybook/react'
import Dexie from 'dexie'
import type { Task } from '../../src/types'
import type { Setting } from '../../src/db/database'

// 각 스토리마다 고유한 DB를 생성하기 위한 카운터
let dbCounter = 0

interface SeedData {
  tasks?: Task[]
  settings?: Setting[]
}

// DB 초기화 및 시드 데이터 주입
async function initializeDB(
  dbName: string,
  seedData: SeedData
): Promise<Dexie> {
  const db = new Dexie(dbName)

  db.version(2).stores({
    tasks: 'id, status, date, createdAt',
    settings: 'key',
  })

  // 기존 데이터 삭제
  await db.table('tasks').clear()
  await db.table('settings').clear()

  // 시드 데이터 주입
  if (seedData.tasks && seedData.tasks.length > 0) {
    await db.table('tasks').bulkAdd(seedData.tasks)
  }

  if (seedData.settings && seedData.settings.length > 0) {
    await db.table('settings').bulkAdd(seedData.settings)
  }

  return db
}

interface IndexedDBProviderProps {
  children: ReactNode
  seedData: SeedData
  storyId: string
}

function IndexedDBProvider({
  children,
  seedData,
  storyId,
}: IndexedDBProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const dbRef = useRef<Dexie | null>(null)

  useEffect(() => {
    const dbName = `storybook-db-${storyId}-${dbCounter++}`

    initializeDB(dbName, seedData)
      .then((initializedDb) => {
        dbRef.current = initializedDb
        setIsReady(true)
      })
      .catch((error) => {
        console.error('Failed to initialize IndexedDB:', error)
        setIsReady(true) // 에러가 있어도 스토리는 렌더링
      })

    return () => {
      // 클린업: DB 삭제
      if (dbRef.current) {
        dbRef.current.delete().catch(console.error)
      }
    }
  }, [storyId, seedData])

  if (!isReady) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export interface StoryParameters {
  seedData?: SeedData
}

export const withIndexedDB: Decorator = (Story, context: StoryContext) => {
  const seedData: SeedData = context.parameters.seedData || {}
  const storyId = context.id

  return (
    <IndexedDBProvider seedData={seedData} storyId={storyId}>
      <Story />
    </IndexedDBProvider>
  )
}

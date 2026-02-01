import { describe, it } from 'vitest'

describe('TaskForm', () => {
  describe('기본 렌더링', () => {
    it.todo('제목 입력 필드를 표시한다')
    it.todo('Goal 선택 드롭다운을 표시한다')
    it.todo('생성 버튼을 표시한다')
  })

  describe('Goal 선택', () => {
    it.todo('활성 Goal 목록을 드롭다운에 표시한다')
    it.todo('Goal 없음 옵션을 제공한다')
    it.todo('Goal을 선택하면 선택된 Goal이 표시된다')
  })

  describe('Task 생성', () => {
    it.todo('제목 입력 후 생성 버튼 클릭 시 onCreate를 호출한다')
    it.todo('Goal이 선택된 상태에서 생성 시 goalId를 포함한다')
    it.todo('생성 후 입력 필드를 초기화한다')
    it.todo('제목이 비어있으면 생성 버튼이 비활성화된다')
  })

  describe('Enter 키 지원', () => {
    it.todo('Enter 키 입력 시 Task를 생성한다')
  })
})

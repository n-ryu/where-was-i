import { describe, it } from 'vitest'

describe('GoalListItem', () => {
  it.todo('Goal 제목과 메모를 표시한다')
  it.todo('비활성 Goal은 흐리게 표시된다')

  describe('인라인 편집', () => {
    it.todo('편집 버튼 클릭 시 편집 모드로 전환된다')
    it.todo('편집 모드에서 제목을 수정할 수 있다')
    it.todo('편집 모드에서 메모를 수정할 수 있다')
    it.todo('저장 버튼 클릭 시 변경사항이 저장된다')
    it.todo('취소 버튼 클릭 시 편집이 취소된다')
  })

  describe('활성/비활성 토글', () => {
    it.todo('토글 클릭 시 활성 상태가 변경된다')
  })

  describe('삭제', () => {
    it.todo('삭제 버튼 클릭 시 삭제 확인이 표시된다')
    it.todo('삭제 확인 시 Goal이 삭제된다')
    it.todo('삭제 취소 시 Goal이 유지된다')
  })
})

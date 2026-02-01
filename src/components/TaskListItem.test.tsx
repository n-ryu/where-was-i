import { describe, it } from 'vitest'

describe('TaskListItem', () => {
  describe('기본 렌더링', () => {
    it.todo('Task 제목을 표시한다')
    it.todo('Task 메모가 있으면 메모를 표시한다')
    it.todo('연결된 Goal 이름을 표시한다')
  })

  describe('상태 표시', () => {
    it.todo('진행중 Task는 강조 스타일로 표시한다')
    it.todo('완료된 Task는 체크박스가 체크되고 흐린 스타일로 표시한다')
    it.todo('대기중 Task는 체크박스가 해제된 상태로 표시한다')
  })

  describe('상태 변경', () => {
    it.todo('대기중 Task 클릭 시 진행중으로 변경하고 started 이벤트를 기록한다')
    it.todo(
      '대기중 Task 체크박스 클릭 시 즉시 완료로 변경하고 completed 이벤트를 기록한다'
    )
    it.todo(
      '진행중 Task 체크박스 클릭 시 완료로 변경하고 completed 이벤트를 기록한다'
    )
    it.todo(
      '완료된 Task 체크박스 해제 시 대기중으로 변경하고 paused 이벤트를 기록한다'
    )
  })

  describe('편집', () => {
    it.todo('편집 버튼 클릭 시 편집 모드로 전환한다')
    it.todo('편집 모드에서 제목을 수정할 수 있다')
    it.todo('편집 모드에서 메모를 수정할 수 있다')
    it.todo('편집 모드에서 Goal을 변경할 수 있다')
    it.todo('저장 버튼 클릭 시 변경 사항을 저장하고 편집 모드를 종료한다')
    it.todo('취소 버튼 클릭 시 변경 사항을 취소하고 편집 모드를 종료한다')
  })

  describe('삭제', () => {
    it.todo('삭제 버튼 클릭 시 삭제 확인 UI를 표시한다')
    it.todo('삭제 확인 시 onDelete를 호출한다')
    it.todo('삭제 취소 시 삭제 확인 UI를 닫는다')
  })
})

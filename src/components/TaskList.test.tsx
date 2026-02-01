import { describe, it } from 'vitest'

describe('TaskList', () => {
  describe('기본 렌더링', () => {
    it.todo('Task 목록을 표시한다')
    it.todo('Task가 없으면 빈 상태 메시지를 표시한다')
  })

  describe('정렬', () => {
    it.todo('진행중 Task를 별도 영역에 강조하여 표시한다')
    it.todo('대기중 Task를 진행중 Task 아래에 표시한다')
    it.todo('완료된 Task를 대기중 Task 아래에 표시한다')
    it.todo('완료된 Task는 완료 시간 기준으로 정렬한다')
  })

  describe('상태 전환', () => {
    it.todo(
      '대기중 Task가 진행중으로 전환되면 기존 진행중 Task는 대기중으로 변경된다'
    )
  })

  describe('스타일', () => {
    it.todo('진행중 Task와 다른 상태의 Task를 시각적으로 구분한다')
  })
})

# Claude Code 고급 기능 활용 계획

이 문서는 프로젝트에서 활용할 수 있는 Claude Code의 고급 기능들을 정리합니다.

## 도입 우선순위

| 순위 | 기능 | 시기 | 이유 |
|------|------|------|------|
| 1 | Settings | 프로젝트 초기화 시 | 권한, 환경변수 등 기본 설정 |
| 2 | Hooks | 개발 시작 후 | 커밋 전 검사 자동화 |
| 3 | Skills | 기능 개발 중 | 반복 작업 자동화 |
| 4 | MCP | 필요시 | 외부 도구 연동 |

---

## 1. Settings (설정)

### 파일 구조

```
.claude/
├── settings.json        # 팀 공유 설정 (git에 포함)
└── settings.local.json  # 개인 설정 (gitignore)
```

### 설정 예시

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm *)",
      "Bash(git add *)",
      "Bash(git commit *)"
    ],
    "ask": [
      "Bash(git push *)",
      "WebFetch"
    ],
    "deny": [
      "Read(.env*)",
      "Read(./secrets/**)"
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

---

## 2. Hooks (자동화)

### 활용 가능한 Hook 종류

| Hook | 시점 | 활용 예 |
|------|------|--------|
| SessionStart | 세션 시작 시 | 오늘 과업 목록 표시 |
| PreToolUse | 도구 실행 전 | 중요 파일 보호 |
| PostToolUse | 도구 실행 후 | 자동 저장/커밋 |
| Notification | 입력 필요 시 | 시스템 알림 |

### 프로젝트에 적용할 Hook

#### SessionStart: 세션 시작 시 컨텍스트 표시

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "echo '=== where-was-i 프로젝트 ===' && pnpm run check 2>/dev/null || echo '프로젝트 초기화 필요'"
          }
        ]
      }
    ]
  }
}
```

#### PreToolUse: 중요 파일 보호

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "cat | jq -r '.tool_input.file_path // empty' | grep -qE '\\.env|\\.local' && echo 'Protected file' >&2 && exit 2 || exit 0"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Skills (커스텀 슬래시 명령어)

### 파일 구조

```
.claude/skills/
├── analyze-task/
│   └── SKILL.md
├── daily-review/
│   └── SKILL.md
└── estimate-sprint/
    └── SKILL.md
```

### 프로젝트에 유용한 Skills

#### /analyze-task: 과업 분석 및 세분화

```markdown
---
name: analyze-task
description: 복잡한 과업을 세부 과업으로 분리
---

사용자가 과업을 입력하면:

1. 목표가 명확한지 확인
2. 15-60분 단위의 세부 과업으로 분리
3. 의존 관계 파악
4. 예상 소요 시간 추정
```

#### /daily-review: 일과 회고

```markdown
---
name: daily-review
description: 일과 회고 진행
---

1. 오늘 계획한 과업 완료 상태 확인
2. 계획에 없던 과업 확인
3. 시간 분석 (예상 vs 실제)
4. 내일 개선점 도출
```

---

## 4. MCP (Model Context Protocol)

### 유용한 MCP 서버

| 서버 | 용도 | 설치 명령 |
|------|------|----------|
| GitHub | 이슈/PR 관리 | `claude mcp add github` |
| Filesystem | 파일 조작 | `claude mcp add filesystem` |

### 설정 파일

```json
// .mcp.json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  }
}
```

---

## 5. Subagents (특화 에이전트)

Claude Code에서 Task 도구로 사용 가능한 에이전트 유형:

| 에이전트 | 용도 | 사용 시점 |
|----------|------|----------|
| Explore | 코드베이스 탐색 | 구조 파악, 파일 검색 |
| Plan | 구현 계획 수립 | 복잡한 기능 설계 |
| Bash | 명령어 실행 | git, npm 등 터미널 작업 |

---

## 적용 체크리스트

### Phase 1: 프로젝트 초기화 시
- [ ] `.claude/settings.json` 생성
- [ ] `.gitignore`에 `settings.local.json` 추가

### Phase 2: 개발 시작 후
- [ ] SessionStart Hook 추가
- [ ] PreToolUse Hook (파일 보호) 추가

### Phase 3: 기능 개발 중
- [ ] `/analyze-task` Skill 추가
- [ ] `/daily-review` Skill 추가

### Phase 4: 필요시
- [ ] GitHub MCP 연동
- [ ] 추가 Skill 개발

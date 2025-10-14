# DoranDoran API 명세서

## 📋 개요

DoranDoran은 마이크로서비스 아키텍처 기반의 AI 채팅 플랫폼입니다. 이 문서는 모든 REST API 엔드포인트의 상세한 명세를 제공합니다.

### 🏗️ 아키텍처

- **API Gateway**: `http://localhost:8080` (모든 요청의 진입점)
- **User Service**: `http://localhost:8082` (사용자 관리)
- **Auth Service**: `http://localhost:8081` (인증/인가)
- **Chat Service**: `http://localhost:8083` (채팅 기능)
- **Database**: PostgreSQL (공유 데이터베이스)
- **Cache**: Redis

### 🔐 인증 방식

- **JWT (JSON Web Token)** 기반 인증
- **Bearer Token** 방식 사용
- **Authorization** 헤더에 `Bearer {token}` 형식으로 전송

---

## 📚 API 엔드포인트

## 1. 🏠 Gateway API

### 1.1 홈페이지

```http
GET /
```

**응답:**

```json
{
  "message": "DoranDoran MSA API Gateway",
  "status": "running",
  "version": "1.0.0",
  "endpoints": {
    "actuator": "/actuator",
    "auth": "/api/auth/**",
    "user": "/api/users/**",
    "chat": "/api/chat/**",
    "batch": "/api/batch/**"
  }
}
```

---

## 2. 👤 User Service API

**Base URL:** `http://localhost:8080/api/users`

### 2.1 사용자 생성

```http
POST /api/users
Content-Type: application/json
```

**요청 본문:**

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "password": "password123",
  "picture": "https://example.com/profile.jpg",
  "info": "사용자 소개"
}
```

**요청 필드:**

- `email` (String, 필수): 이메일 형식이어야 함
- `firstName` (String, 필수): 1-50자
- `lastName` (String, 필수): 1-50자
- `name` (String, 필수): 1-50자, 미제공 시 `firstName + lastName` 사용
- `password` (String, 필수): 8-100자
- `picture` (String, 선택)
- `info` (String, 선택): 최대 100자

**필수 요청값:**

- `email`
- `firstName`
- `lastName`
- `name`
- `password`

**응답:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "passwordHash": "$2a$10$...",
  "picture": "https://example.com/profile.jpg",
  "info": "사용자 소개",
  "lastConnTime": "2024-01-01T12:00:00",
  "status": "ACTIVE",
  "role": "ROLE_USER",
  "coachCheck": false,
  "exitModalDoNotShowAgain": false,
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

### 2.2 사용자 조회 (ID)

```http
GET /api/users/{userId}
```

**경로 변수:**

- `userId` (string): 사용자 UUID

**응답:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "picture": "https://example.com/profile.jpg",
  "info": "사용자 소개",
  "lastConnTime": "2024-01-01T12:00:00",
  "status": "ACTIVE",
  "role": "ROLE_USER",
  "coachCheck": false,
  "exitModalDoNotShowAgain": false,
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

### 2.3 사용자 조회 (이메일)

```http
GET /api/users/email/{email}
```

**경로 변수:**

- `email` (string): 사용자 이메일

**응답:** 2.2와 동일

### 2.4 사용자 정보 업데이트

```http
PUT /api/users/{userId}
Content-Type: application/json
```

**요청 본문:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "name": "Jane Smith",
  "picture": "https://example.com/new-profile.jpg",
  "info": "업데이트된 소개"
}
```

**요청 필드:**

- `email` (String, 선택): 이메일 형식
- `firstName` (String, 선택): 1-50자
- `lastName` (String, 선택): 1-50자
- `name` (String, 선택): 1-50자
- `picture` (String, 선택)
- `info` (String, 선택): 최대 100자
- `status` (enum, 선택): ACTIVE, INACTIVE, SUSPENDED
- `coachCheck` (Boolean, 선택)
- `exitModalDoNotShowAgain` (Boolean, 선택)

**필수 요청값:**

- 없음 (모든 필드 선택 입력)

**응답:** 2.2와 동일

### 2.5 사용자 상태 업데이트

```http
PATCH /api/users/{userId}/status?status={status}
```

**쿼리 파라미터:**

- `status` (string): ACTIVE, INACTIVE, SUSPENDED

**필수 요청값:**

- `status`

**응답:** 2.2와 동일

### 2.6 비밀번호 재설정

```http
POST /api/users/password/reset
Content-Type: application/json
```

**요청 본문:**

```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123"
}
```

**필수 요청값:**

- `email`
- `newPassword`

**응답:**

```http
200 OK
```

### 2.7 사용자 비밀번호 업데이트

```http
PUT /api/users/{userId}/password
Content-Type: application/json
```

**요청 본문:**

```json
"newpassword123"
```

**필수 요청값:**

- `newPassword`

**응답:**

```http
200 OK
```

### 2.8 회원탈퇴

```http
DELETE /api/users/{userId}
```

**응답:**

```http
200 OK
```

### 2.9 헬스체크

```http
GET /api/users/health
```

**응답:**

```http
200 OK
User service is running
```

---

## 3. 🔐 Auth Service API

**Base URL:** `http://localhost:8080/api/auth`

### 3.1 로그인

```http
POST /api/auth/login
Content-Type: application/json
```

**요청 본문:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**요청 필드:**

- `email` (String, 필수): 이메일 형식, 공백 불가
- `password` (String, 필수): 공백 불가

**필수 요청값:**

- `email`
- `password`
  **응답:**

```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "status": "ACTIVE",
      "role": "ROLE_USER"
    }
  },
  "errorCode": null
}
```

### 3.2 로그아웃

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**응답:**

```json
{
  "success": true,
  "message": "로그아웃에 성공했습니다.",
  "data": null,
  "errorCode": null
}
```

### 3.3 토큰 검증

```http
GET /api/auth/validate
Authorization: Bearer {token}
```

**응답:**

```json
{
  "success": true,
  "message": "토큰이 유효합니다.",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "ACTIVE",
    "role": "ROLE_USER"
  },
  "errorCode": null
}
```

### 3.4 토큰 갱신

```http
POST /api/auth/refresh
Content-Type: application/json
```

**요청 본문:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**필수 요청값:**

- `refreshToken`

**요청 필드:**

- `refreshToken` (String, 필수)

**응답:** 3.1과 동일

### 3.5 비밀번호 재설정 요청

```http
POST /api/auth/password/reset/request?email={email}
```

**쿼리 파라미터:**

- `email` (string): 사용자 이메일

**필수 요청값:**

- `email`
  **응답:**

```json
{
  "success": true,
  "message": "비밀번호 재설정 토큰이 생성되었습니다. 토큰: {resetToken}",
  "data": "reset-token-string",
  "errorCode": null
}
```

### 3.6 비밀번호 재설정 실행

```http
POST /api/auth/password/reset/execute?token={token}&newPassword={newPassword}
```

**쿼리 파라미터:**

- `token` (string): 재설정 토큰
- `newPassword` (string): 새 비밀번호

**필수 요청값:**

- `token`
- `newPassword`
  **응답:**

```json
{
  "success": true,
  "message": "비밀번호가 성공적으로 재설정되었습니다.",
  "data": null,
  "errorCode": null
}
```

### 3.7 현재 사용자 정보 조회

```http
GET /api/auth/me
Authorization: Bearer {token}
```

**응답:**

```json
{
  "success": true,
  "message": "사용자 정보를 성공적으로 조회했습니다.",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "status": "ACTIVE",
    "role": "ROLE_USER"
  },
  "errorCode": null
}
```

### 3.8 헬스체크

```http
GET /api/auth/health
```

**응답:**

```http
200 OK
Auth service is running
```

---

## 4. 💬 Chat Service API

**Base URL:** `http://localhost:8080/api/chat`

### 4.1 채팅방 생성 (컨셉 기반)

```http
POST /api/chat/chatrooms
Authorization: Bearer {token}
Content-Type: application/json
```

**요청 본문:**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
  "name": "친구와의 대화",
  "concept": "FRIEND",
  "intimacyLevel": 3
}
```

**요청 필드:**

- `userId` (UUID, 선택): 사용자 ID (JWT에서 자동 추출 가능)
- `chatbotId` (UUID, 필수): 챗봇 ID
- `name` (String, 필수): 채팅방 이름
- `concept` (String, 필수): 채팅방 컨셉 (FRIEND, LOVER, COWORKER, BOSS)
- `intimacyLevel` (Integer, 선택): 친밀도 레벨 (1-3, 기본값: 컨셉별 기본값)

**필수 요청값:**

- `userId`
- `chatbotId`
- `name`
- `concept`
  **응답:**

```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
  "name": "친구와의 대화",
  "description": "친구와의 자연스러운 대화",
  "concept": "FRIEND",
  "intimacyLevel": 3,
  "lastMessageAt": "2024-01-01T12:05:00",
  "lastMessageId": "abc12345-e89b-12d3-a456-426614174003",
  "isArchived": false,
  "isDeleted": false,
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

**컨셉별 기본 친밀도 레벨:**

- `FRIEND`: 3 (친근한 반말)
- `LOVER`: 2 (부드러운 존댓말)
- `COWORKER`: 2 (부드러운 존댓말)
- `BOSS`: 1 (격식체)

### 4.2 채팅방 목록 조회

```http
GET /api/chat/chatrooms?userId={userId}&page={page}&size={size}
Authorization: Bearer {token}
```

**쿼리 파라미터:**

- `userId` (UUID, 선택): 사용자 ID (JWT에서 자동 추출 가능)
- `page` (int, 기본값: 0): 페이지 번호
- `size` (int, 기본값: 20): 페이지 크기

**응답:**

```json
{
  "content": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "userId": "123e4567-e89b-12d3-a456-426614174000",
      "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
      "name": "친구와의 대화",
      "description": "친구와의 자연스러운 대화",
      "concept": "FRIEND",
      "intimacyLevel": 3,
      "lastMessageAt": "2024-01-01T12:05:00",
      "lastMessageId": "abc12345-e89b-12d3-a456-426614174003",
      "isArchived": false,
      "isDeleted": false,
      "createdAt": "2024-01-01T12:00:00",
      "updatedAt": "2024-01-01T12:00:00"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false,
      "unsorted": true
    },
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

### 4.3 메시지 목록 조회

```http
GET /api/chat/chatrooms/{chatroomId}/messages?userId={userId}&page={page}&size={size}
Authorization: Bearer {token}
```

**경로 변수:**

- `chatroomId` (UUID): 채팅방 ID

**쿼리 파라미터:**

- `userId` (UUID, 선택): 사용자 ID (JWT에서 자동 추출 가능)
- `page` (int, 기본값: 0): 페이지 번호
- `size` (int, 기본값: 50): 페이지 크기

**응답:**

```json
{
  "content": [
    {
      "id": "abc12345-e89b-12d3-a456-426614174003",
      "chatroomId": "789e0123-e89b-12d3-a456-426614174002",
      "senderId": "123e4567-e89b-12d3-a456-426614174000",
      "senderType": "user",
      "content": "안녕하세요!",
      "contentType": "text",
      "createdAt": "2024-01-01T12:00:00"
    }
  ],
  "pageable": {
    "sort": {
      "sorted": false,
      "unsorted": true
    },
    "pageNumber": 0,
    "pageSize": 50
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

### 4.4 메시지 전송

```http
POST /api/chat/chatrooms/{chatroomId}/messages
Authorization: Bearer {token}
Content-Type: application/json
```

**경로 변수:**

- `chatroomId` (UUID): 채팅방 ID

**요청 본문:**

```json
{
  "senderType": "user",
  "content": "안녕하세요!",
  "contentType": "text"
}
```

**요청 필드:**

- `senderType` (String, 선택): 발신자 타입 (user, bot, system 중 하나, 기본값: user)
- `content` (String, 필수): 메시지 내용 (1-10000자)
- `contentType` (String, 선택): 콘텐츠 타입 (text, code, system 중 하나, 기본값: text)

**필수 요청값:**

- `content`
  **응답:**

```json
{
  "id": "abc12345-e89b-12d3-a456-426614174003",
  "chatroomId": "789e0123-e89b-12d3-a456-426614174002",
  "senderId": "123e4567-e89b-12d3-a456-426614174000",
  "senderType": "user",
  "content": "안녕하세요!",
  "contentType": "text",
  "createdAt": "2024-01-01T12:00:00"
}
```

### 4.5 친밀도 레벨 업데이트

```http
PATCH /api/chat/chatrooms/{chatroomId}/intimacy
Authorization: Bearer {token}
Content-Type: application/json
```

**경로 변수:**

- `chatroomId` (UUID): 채팅방 ID

**요청 본문:**

```json
{
  "intimacyLevel": 2
}
```

**요청 필드:**

- `intimacyLevel` (Integer, 필수): 친밀도 레벨 (1-3)

**필수 요청값:**

- `intimacyLevel`
  **응답:**

```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
  "name": "친구와의 대화",
  "description": "친구와의 자연스러운 대화",
  "concept": "FRIEND",
  "intimacyLevel": 2,
  "lastMessageAt": "2024-01-01T12:05:00",
  "lastMessageId": "abc12345-e89b-12d3-a456-426614174003",
  "isArchived": false,
  "isDeleted": false,
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:05:00"
}
```

### 4.6 채팅방 나가기 (소프트 딜리트)

```http
POST /api/chat/chatrooms/{chatroomId}/leave
Authorization: Bearer {token}
```

**경로 변수:**

- `chatroomId` (UUID): 채팅방 ID

**응답:**

```http
204 No Content
```

### 4.7 WebSocket 채팅 연결

```http
WS /ws/chat/{chatroomId}?userId={userId}
Authorization: Bearer {token}
```

**경로 변수:**

- `chatroomId` (UUID): 채팅방 ID

**쿼리 파라미터:**

- `userId` (UUID, 선택): 사용자 ID (JWT에서 자동 추출 가능)

**메시지 형식 (클라이언트 → 서버):**

```
{senderId}|{senderType}|{content}
```

예: `123e4567-e89b-12d3-a456-426614174000|user|안녕하세요!`

**특징:**

- 양방향 실시간 통신
- 사용자 메시지 전송 및 AI 응답 수신
- Multi-Agent AI 시스템과 연동

### 4.8 실시간 메시지 스트림 (SSE)

```http
GET /api/chat/stream/{chatroomId}?userId={userId}
Authorization: Bearer {token}
Accept: text/event-stream
```

**경로 변수:**

- `chatroomId` (UUID): 채팅방 ID

**쿼리 파라미터:**

- `userId` (UUID, 선택): 사용자 ID (JWT에서 자동 추출 가능)

**응답:** Server-Sent Events 스트림

**SSE 이벤트 타입:**

- `intimacy_analysis`: 친밀도 분석 결과 (detectedLevel, correctedSentence, feedback, corrections)
- `vocabulary_extracted`: 어휘 추출 결과 (words 배열)
- `vocabulary_translated`: 번역 결과 (translations 배열)
- `conversation_chunk`: 대화 응답 스트림 (실시간 텍스트)
- `conversation_complete`: 대화 완료 (messageId, content)
- `aggregated_complete`: 전체 결과 집계 (intimacy, vocabulary 통합)

**특징:**

- 서버 → 클라이언트 단방향 스트리밍
- AI 토큰 단위 실시간 전송
- Multi-Agent AI 결과 실시간 피드백

### 4.9 챗봇 프롬프트 수정

```http
POST /api/chat/chatbots/prompt
Content-Type: application/json
```

**요청 본문:**

```json
{
  "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
  "systemPrompt": "당신은 친근한 한국어 학습 도우미입니다.",
  "userPrompt": "다음 문장을 분석해주세요: {input}",
  "metadata": {
    "version": "1.0",
    "lastModified": "2024-01-01T12:00:00"
  },
  "agentType": "conversation"
}
```

**요청 필드:**

- `chatbotId` (String, 필수): 챗봇 ID
- `systemPrompt` (String, 선택): 시스템 프롬프트
- `userPrompt` (String, 선택): 사용자 프롬프트
- `metadata` (Object, 선택): 메타데이터
- `agentType` (String, 필수): Agent 타입 (conversation, intimacy, vocabulary, translation)

**응답:**

```json
{
  "success": true,
  "message": "챗봇 프롬프트가 성공적으로 업데이트되었습니다.",
  "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
  "agentType": "conversation"
}
```

### 4.10 챗봇 프롬프트 리셋

```http
POST /api/chat/chatbots/reset?chatbotId={chatbotId}&agentType={agentType}
```

**쿼리 파라미터:**

- `chatbotId` (String, 필수): 챗봇 ID
- `agentType` (String, 필수): Agent 타입 (conversation, intimacy, vocabulary, translation)

**응답:**

```json
{
  "success": true,
  "message": "챗봇 프롬프트가 기본값으로 리셋되었습니다.",
  "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
  "agentType": "conversation"
}
```

### 4.11 챗봇 조회

```http
GET /api/chat/chatbots/{chatbotId}
```

**경로 변수:**

- `chatbotId` (String): 챗봇 ID

**응답:**

```json
{
  "success": true,
  "chatbot": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "name": "도란도란 AI",
    "displayName": "한국어 학습 도우미",
    "description": "외국인을 위한 한국어 학습 AI",
    "systemPrompt": "당신은 친근한 한국어 학습 도우미입니다.",
    "intimacySystemPrompt": "친밀도 분석을 위한 시스템 프롬프트",
    "intimacyUserPrompt": "다음 문장의 친밀도를 분석해주세요: {input}",
    "vocabularySystemPrompt": "어휘 추출을 위한 시스템 프롬프트",
    "vocabularyUserPrompt": "다음 문장에서 어려운 단어를 추출해주세요: {input}",
    "translationSystemPrompt": "번역을 위한 시스템 프롬프트",
    "translationUserPrompt": "다음 단어를 번역해주세요: {input}",
    "intimacyLevel": 2,
    "isActive": true
  }
}
```

### 4.12 Agent 프롬프트 조회

```http
GET /api/chat/chatbots/{chatbotId}/agents/{agentType}
```

**경로 변수:**

- `chatbotId` (String): 챗봇 ID
- `agentType` (String): Agent 타입 (conversation, intimacy, vocabulary, translation)

**응답:**

```json
{
  "success": true,
  "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
  "agentType": "conversation",
  "prompts": {
    "systemPrompt": "당신은 친근한 한국어 학습 도우미입니다.",
    "userPrompt": "다음 문장을 분석해주세요: {input}"
  }
}
```

**Agent 타입 설명:**

- `conversation`: 대화 생성 Agent (자연스러운 대화 응답)
- `intimacy`: 친밀도 분석 Agent (한국어 친밀도 분석 및 교정)
- `vocabulary`: 어휘 추출 Agent (어려운 단어 추출 및 난이도 분석)
- `translation`: 번역 Agent (한국어 단어의 영어 번역 및 발음기호 제공)

---

## 5. 💰 Billing Service API

**Base URL:** `http://localhost:8080/api/billing`

### 5.1 월별 사용자 비용 조회

```http
GET /api/billing/users/{userId}/months/{month}
```

**경로 변수:**

- `userId` (UUID): 사용자 ID
- `month` (LocalDate): 조회할 월 (YYYY-MM-DD 형식)

**응답:**

```json
[
  {
    "id": "billing123-e89b-12d3-a456-426614174004",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "billingMonth": "2024-01-01",
    "totalCost": 15000.0,
    "messageCount": 100,
    "createdAt": "2024-01-01T12:00:00",
    "updatedAt": "2024-01-01T12:00:00"
  }
]
```

---

## 6. 🔧 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    /* 실제 데이터 */
  },
  "errorCode": null
}
```

### 에러 응답

```json
{
  "success": false,
  "message": "오류 메시지",
  "data": null,
  "errorCode": "ERROR_CODE"
}
```

---

## 7. 📊 HTTP 상태 코드

| 코드 | 의미                  | 설명             |
| ---- | --------------------- | ---------------- |
| 200  | OK                    | 요청 성공        |
| 201  | Created               | 리소스 생성 성공 |
| 400  | Bad Request           | 잘못된 요청      |
| 401  | Unauthorized          | 인증 실패        |
| 403  | Forbidden             | 권한 없음        |
| 404  | Not Found             | 리소스 없음      |
| 500  | Internal Server Error | 서버 오류        |

---

## 8. 🔒 보안 고려사항

### 인증이 필요한 엔드포인트

- 모든 Chat Service API (Bearer Token 필요)
- Auth Service의 `/me`, `/validate` 엔드포인트
- User Service의 일부 엔드포인트

### CORS 설정

- 모든 서비스에서 CORS가 활성화되어 있음
- 개발 환경에서는 모든 Origin 허용

### Rate Limiting

- 현재 구현되지 않음 (향후 추가 예정)

---

## 9. 🧪 테스트 방법

### 1. Swagger UI 사용

각 서비스별로 Swagger UI가 제공됩니다:

- Gateway: `http://localhost:8080/swagger-ui.html`
- User Service: `http://localhost:8082/swagger-ui.html`
- Auth Service: `http://localhost:8081/swagger-ui.html`
- Chat Service: `http://localhost:8083/swagger-ui.html`

### 2. cURL 예제

```bash
# 로그인
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 사용자 조회
curl -X GET http://localhost:8080/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 채팅방 생성 (컨셉 기반)
curl -X POST http://localhost:8080/api/chat/chatrooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
    "name": "친구와의 대화",
    "concept": "FRIEND",
    "intimacyLevel": 3
  }'

# 친밀도 레벨 변경
curl -X PATCH http://localhost:8080/api/chat/chatrooms/789e0123-e89b-12d3-a456-426614174002/intimacy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"intimacyLevel": 2}'

# 채팅방 나가기
curl -X POST http://localhost:8080/api/chat/chatrooms/789e0123-e89b-12d3-a456-426614174002/leave \
  -H "Authorization: Bearer YOUR_TOKEN"

# 메시지 전송
curl -X POST http://localhost:8080/api/chat/chatrooms/789e0123-e89b-12d3-a456-426614174002/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "안녕하세요!", "contentType": "text", "senderType": "user"}'

# WebSocket 연결 (JavaScript 예제)
const ws = new WebSocket('ws://localhost:8080/ws/chat/789e0123-e89b-12d3-a456-426614174002?userId=123e4567-e89b-12d3-a456-426614174000');
ws.onopen = () => {
  // 메시지 전송: senderId|senderType|content
  ws.send('123e4567-e89b-12d3-a456-426614174000|user|안녕하세요!');
};

# 챗봇 프롬프트 수정
curl -X POST http://localhost:8080/api/chat/chatbots/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "chatbotId": "456e7890-e89b-12d3-a456-426614174001",
    "systemPrompt": "당신은 친근한 한국어 학습 도우미입니다.",
    "agentType": "conversation"
  }'

# 챗봇 조회
curl -X GET http://localhost:8080/api/chat/chatbots/456e7890-e89b-12d3-a456-426614174001

# Agent 프롬프트 조회
curl -X GET http://localhost:8080/api/chat/chatbots/456e7890-e89b-12d3-a456-426614174001/agents/conversation

# 실시간 스트림 연결 (SSE)
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: text/event-stream" \
  http://localhost:8080/api/chat/stream/789e0123-e89b-12d3-a456-426614174002
```

---

## 10. 📝 변경 이력

| 버전  | 날짜       | 변경사항                                                                                                            |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.0.0 | 2024-01-01 | 초기 API 명세서 작성                                                                                                |
| 1.1.0 | 2024-01-15 | Multi-Agent 시스템 추가, SSE 지원 추가                                                                              |
| 1.2.0 | 2024-01-20 | Billing API 추가, 보안 강화                                                                                         |
| 1.3.0 | 2024-01-25 | Chat Service 대폭 업데이트: 컨셉 기반 채팅방, 친밀도 레벨 관리, AI 인사말, 소프트 딜리트, WebSocket + SSE 이중 통신 |
| 1.4.0 | 2024-01-25 | Chat Service 완전 최신화: Chatbot 관리 API 추가, ChatRoomResponse 필드 완전 반영, Multi-Agent AI 프롬프트 관리      |

---

## 11. 📞 문의

- **개발팀**: [이메일]
- **이슈 리포트**: GitHub Issues
- **문서**: 프로젝트 Wiki

---

**⭐ 이 API 명세서가 도움이 되었다면 Star를 눌러주세요!**

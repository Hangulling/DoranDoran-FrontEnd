import { http, HttpResponse } from 'msw'
import { userProfile } from '../db/user'

export const userHandlers = [
  //내 프로필 조회
  http.get('/api/users/me', () => {
    return HttpResponse.json({
      email: userProfile.email,
      nickname: userProfile.nickname,
      preferences: userProfile.preferences,
      status: userProfile.status,
      createdAt: userProfile.createdAt.toISOString(),
      updatedAt: userProfile.updatedAt.toISOString(),
    })
  }),

  // 닉네임 및 설정 수정 (추가 기능)
  http.put('/api/users/me', async ({ request }) => {
    const { nickname, preferences } = (await request.json()) as {
      nickname: string
      preferences: string
    }

    // 사용자 프로필 데이터 업데이트
    userProfile.nickname = nickname
    userProfile.preferences = preferences
    userProfile.updatedAt = new Date()

    return HttpResponse.json({ message: '업데이트 완료' })
  }),

  // 이메일 변경 (추가 기능)
  http.patch('/api/users/me/email', async ({ request }) => {
    const { newEmail } = (await request.json()) as { newEmail: string }
    userProfile.email = newEmail
    userProfile.updatedAt = new Date()

    return HttpResponse.json({ message: '요청 완료(재인증 필요)' })
  }),

  //비밀번호 변경 (추가 기능)
  http.patch('/api/users/me/password', async ({ request }) => {
    const { currentPassword, newPassword } = (await request.json()) as {
      currentPassword: string
      newPassword: string
    }

    // 현재 비밀번호 유효성 검사
    if (currentPassword !== 'password123!') {
      return HttpResponse.json({ message: 'PASSWORD_INVALID' }, { status: 400 })
    }

    // 새 비밀번호로 변경
    console.log(`비밀번호가 ${newPassword}(으)로 변경되었습니다.`)
    userProfile.updatedAt = new Date()

    return HttpResponse.json({ message: '변경 완료' })
  }),
]

import { http, HttpResponse } from 'msw'
import { userProfile } from '../db/user'

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string
      password: string
    }

    if (email !== userProfile.email || password !== userProfile.password) {
      return HttpResponse.json(
        { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.', data: null },
        { status: 401 }
      )
    }

    const accessToken = `mock.${btoa(email)}.${Date.now()}`

    return HttpResponse.json(
      {
        success: true,
        message: '로그인 성공',
        data: {
          accessToken,
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            email: userProfile.email,
            name: userProfile.name,
            preferences: userProfile.preferences,
          },
        },
      },
      { status: 200 }
    )
  }),
]

// @ts-nocheck
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const isInMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (!isInMaintenanceMode) {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  url.pathname = '/maintenance'

  const response = NextResponse.rewrite(url)

  response.status = 503
  response.statusText = 'Service Unavailable'
  response.headers.set('Retry-After', '3600') // 1시간 후 재시도

  return response
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 '제외한' 모든 경로에서 이 미들웨어를 실행합니다:
     * - /api (API 경로)
     * - /assets (Vite의 빌드 에셋: JS, CSS 파일)
     * - /maintenance (점검 페이지 자신 - 무한 루프 방지)
     * - 확장자가 있는 모든 파일 (e.g., .svg, .png, .ico)
     */
    '/((?!api|assets|maintenance|favicon.ico|.*\\..*).*)',
  ],
}

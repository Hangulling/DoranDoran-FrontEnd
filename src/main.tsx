import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'
import { getCurrentUser } from './api/auth.ts'

async function initializeApp() {
  try {
    await getCurrentUser() // 사용자 정보 미리 불러와 currentUserId 저장
  } catch (e) {
    console.error('초기 사용자 정보 조회 실패', e)
    // 필요한 경우 에러처리 (예: 로그인 페이지 리다이렉트)
  }
}

const isDev = import.meta.env.DEV
const USE_MSW = import.meta.env.VITE_USE_MSW === 'false'

const prepare = async () => {
  if (isDev && USE_MSW) {
    const { worker } = await import('./mocks/browser')
    await worker.start()
  }
}

async function bootstrap() {
  await initializeApp()
  await prepare()
  const container = document.getElementById('root')!
  const root = ReactDOM.createRoot(container)
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

bootstrap()

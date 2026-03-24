import { useLocation } from 'react-router-dom'
import ClientErrorView from '../components/error/ClientErrorView'
import ServerErrorView from '../components/error/ServerErrorView'
import { useErrorPage } from '../hooks/useErrorPage'
import type { ErrorPageProps } from '../types/common'
import { useEffect } from 'react'
import { sendGAEvent } from '../utils/ga'

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorCode: defaultErrorCode,
}) => {
  const location = useLocation()

  const stateErrorCode = location.state?.errorCode
  const finalCode = stateErrorCode || defaultErrorCode

  // ga_view_error_page
  useEffect(() => {
    if (finalCode) {
      sendGAEvent('view_error_page', {
        error_type: finalCode.toString(),
        error_path: window.location.pathname + window.location.search, // 오류 발생 페이지 url
      })
    }
  }, [finalCode])

  const { code, handleClickBack } = useErrorPage({ errorCode: finalCode })

  if (code >= 500) {
    return <ServerErrorView onClickBack={handleClickBack} />
  }

  if (code >= 400) {
    return <ClientErrorView onClickBack={handleClickBack} />
  }
  return null
}

export default ErrorPage

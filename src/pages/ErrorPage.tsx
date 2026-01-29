import { useLocation } from 'react-router-dom'
import ClientErrorView from '../components/error/ClientErrorView'
import ServerErrorView from '../components/error/ServerErrorView'
import { useErrorPage } from '../hooks/useErrorPage'
import type { ErrorPageProps } from '../types/common'

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorCode: defaultErrorCode,
}) => {
  const location = useLocation()

  const stateErrorCode = location.state?.errorCode
  const finalCode = stateErrorCode || defaultErrorCode

  const { code, handleClickBack } = useErrorPage({ errorCode: finalCode })

  if (code >= 500) {
    return <ServerErrorView />
  }

  if (code >= 400) {
    return <ClientErrorView onClickBack={handleClickBack} />
  }
  return null
}

export default ErrorPage

import { useLocation, useMatch, useNavigate } from 'react-router-dom'

export function useNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const chatMatch = useMatch('/chat/:id')
  const closenessMatch = useMatch('/closeness/:id')
  const archiveMatch = useMatch('/archive/:id')
  const instaMatch = useMatch('/insta/:externalId')
  const policyMatch = useMatch('/policy/:id')

  const signupBirthdateMatch = useMatch('/signup/birthdate')
  const signupTermMatch = useMatch('/signup/term')

  const isChatPage = Boolean(chatMatch)
  const currentId =
    chatMatch?.params.id ?? closenessMatch?.params.id ?? archiveMatch?.params.id

  // 뒤로가기
  const goBack = () => {
    if (instaMatch) {
      navigate('/')
      return
    }

    if (signupBirthdateMatch && location.state?.fromOAuth) {
      navigate('/signup/term', {
        replace: true,
        state: location.state,
      })
      return
    }

    if (signupTermMatch && location.state?.fromOAuth) {
      navigate('/login', { replace: true })
      return
    }

    if (policyMatch) {
      const backTo = location.state?.backTo as string | undefined
      if (backTo) {
        navigate(backTo, { replace: true, state: { fromPolicy: true } })
        return
      }
      navigate(-1)
      return
    }

    navigate(-1)
  }

  const handleBookmarkClick = () => {
    if (!currentId) {
      navigate('/archive/1')
      return
    }
    if (chatMatch || closenessMatch) {
      navigate(`/archive/${currentId}`, { state: { from: 'chat' } })
    }
  }

  return {
    goBack,
    handleBookmarkClick,
    isChatPage,
  }
}

interface FormIntroProp {
  children?: React.ReactNode
  variant?: 'signup' | 'onboarding'
}

export default function FormIntro({
  children,
  variant = 'signup',
}: FormIntroProp) {
  const VARIANTS = {
    signup: 'text-title',
    onboarding: 'text-display',
  } as const

  return (
    <div className={`mt-12 mb-10 text-2xl text-gray-800 ${VARIANTS[variant]}`}>
      {children}
    </div>
  )
}

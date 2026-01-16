import type { ReactNode } from 'react'

type BottomSheetProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  closeOnOverlayClick?: boolean
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnOverlayClick = true,
}: BottomSheetProps) {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-gray-800/80"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
        <div className="w-full max-w-md rounded-t-2xl bg-white px-4 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.14)] max-h-[60vh] overflow-hidden flex flex-col">
          <div className="mx-auto my-4 h-[5px] w-[46px] rounded-full bg-gray-800" />

          {(title || description) && (
            <div className="mb-3 text-center">
              {title && (
                <h2 className="text-title text-lg text-gray-800">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-body text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">{children}</div>

          {footer && <div className="pt-3">{footer}</div>}
        </div>
      </div>
    </>
  )
}

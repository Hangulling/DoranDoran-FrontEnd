import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type BottomSheetProps = {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
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
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gray-800/80"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white px-5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.14)]"
            // 드래그해서 닫기
            drag="y"
            dragConstraints={{ top: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose()
            }}
          >
            <div className="mx-auto my-6 h-[5px] w-[46px] rounded-full bg-gray-800" />

            {(title || description) && (
              <div className="mb-4 text-center">
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

            <div className="max-h-[70vh] overflow-y-auto">{children}</div>

            {footer && <div>{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

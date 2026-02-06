import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type BottomSheetProps = {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  description?: string
  children: ReactNode
  footer?: ReactNode
  closeOnOverlayClick?: boolean
  isExpanded?: boolean
  className?: string
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnOverlayClick = true,
  isExpanded = false,
  className,
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
            layout
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'tween',
              ease: 'easeOut',
              duration: 0.3,
            }}
            style={{
              height: isExpanded
                ? 'calc(100% - env(safe-area-inset-top))'
                : 'auto',
              top: isExpanded ? 'env(safe-area-inset-top)' : 'auto',
              bottom: 0,
              maxHeight: isExpanded ? 'none' : '75vh',
            }}
            className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white px-5 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.14)] rounded-t-2xl ${className || ''}`}
            drag="y"
            dragConstraints={{
              top: 0,
              bottom: isExpanded ? 0 : 10000,
            }}
            dragElastic={isExpanded ? 0 : 0.05}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (!isExpanded) {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  onClose()
                }
              }
            }}
          >
            <div className="mx-auto my-6 h-[5px] w-[46px] rounded-full bg-gray-800 shrink-0" />

            {(title || description) && (
              <div className="mb-4 text-center shrink-0">
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

            <div className="flex-auto min-h-0 overflow-y-auto outline-none overscroll-contain">
              {children}
            </div>

            {footer && <div className="shrink-0 pt-[10px]">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

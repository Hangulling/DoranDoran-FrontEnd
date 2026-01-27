export type BadgeVariant = 'Friendly' | 'Polite' | 'Casual'

interface BadgeProps {
  variant: BadgeVariant
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  Friendly: 'text-primary-300',
  Polite: 'text-secondary-500',
  Casual: 'text-primary-300',
}

export default function Badge({ variant }: BadgeProps) {
  return (
    <div
      className={`bg-white/[64%] my-1 px-2 py-1 h-[22px] leading-none text-body text-xs rounded-full  ${VARIANT_STYLES[variant]}`}
    >
      {variant}
    </div>
  )
}

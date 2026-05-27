import { CheckCircle2, Circle } from 'lucide-react'
import type { ServiceStatus } from '@/types'

const STEPS: { value: ServiceStatus; label: string }[] = [
  { value: 'sent',       label: 'Sent'      },
  { value: 'evaluation', label: 'Evaluation' },
  { value: 'in_repair',  label: 'In Repair'  },
  { value: 'ready',      label: 'Ready ✓'   },
  { value: 'delivered',  label: 'Delivered'  },
]

const ORDER: Record<ServiceStatus, number> = {
  sent: 0, evaluation: 1, in_repair: 2, ready: 3, delivered: 4,
}

interface Props {
  current: ServiceStatus | null
  onChange?: (status: ServiceStatus) => void
  readonly?: boolean
}

export function ServiceStatusBar({ current, onChange, readonly = false }: Props) {
  const currentIndex = current ? ORDER[current] : -1

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Service Progress</p>
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const done   = i < currentIndex
          const active = i === currentIndex
          const future = i > currentIndex

          return (
            <button
              key={step.value}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange?.(step.value)}
              className={`flex-1 flex flex-col items-center gap-1 group ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {/* Connector + dot row */}
              <div className="flex items-center w-full">
                {/* Left line */}
                {i > 0 && (
                  <div className={`flex-1 h-0.5 ${done || active ? 'bg-orange-400' : 'bg-gray-200'}`} />
                )}
                {/* Dot */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  active  ? 'bg-orange-500 ring-2 ring-orange-200 scale-110' :
                  done    ? 'bg-orange-400' :
                  future  ? 'bg-gray-100 border border-gray-300' : ''
                } ${!readonly ? 'group-hover:ring-2 group-hover:ring-orange-200' : ''}`}>
                  {done   ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> :
                   active  ? <div className="w-2 h-2 rounded-full bg-white" /> :
                             <Circle className="w-3.5 h-3.5 text-gray-300" />}
                </div>
                {/* Right line */}
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${done ? 'bg-orange-400' : 'bg-gray-200'}`} />
                )}
              </div>
              {/* Label */}
              <span className={`text-[9px] font-medium text-center leading-tight ${
                active ? 'text-orange-600' : done ? 'text-orange-400' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

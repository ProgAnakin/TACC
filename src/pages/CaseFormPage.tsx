import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCase, useCreateCase, useUpdateCase } from '@/hooks/useCases'
import { URGENCY_LABELS } from '@/types'
import type { Category, ServiceStatus } from '@/types'

/* ------------------------------------------------------------------ */
/*  Category card config                                               */
/* ------------------------------------------------------------------ */
const CATEGORY_CARDS: {
  value: Category
  emoji: string
  label: string
  description: string
  activeBg: string
  inactiveBg: string
}[] = [
  {
    value: 'arrival',
    emoji: '📦',
    label: 'Arrival Alert',
    description: 'Client wants to be notified when the product arrives',
    activeBg:   'bg-blue-600 border-transparent text-white shadow-md',
    inactiveBg: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-gray-700',
  },
  {
    value: 'assistance',
    emoji: '🛠️',
    label: 'Service / Repair',
    description: 'Product sent for repair, transfer or technical adjustment',
    activeBg:   'bg-orange-500 border-transparent text-white shadow-md',
    inactiveBg: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-gray-700',
  },
  {
    value: 'lead',
    emoji: '🎯',
    label: 'Lead / Interest',
    description: 'Interested client — target for follow-up with discount or promo',
    activeBg:   'bg-purple-600 border-transparent text-white shadow-md',
    inactiveBg: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-gray-700',
  },
  {
    value: 'problem',
    emoji: '🚨',
    label: 'Inherited Problem',
    description: 'Issue you took over that needs immediate attention',
    activeBg:   'bg-red-600 border-transparent text-white shadow-md',
    inactiveBg: 'bg-red-50 hover:bg-red-100 border-red-200 text-gray-700',
  },
]

/* ------------------------------------------------------------------ */
/*  Form schema                                                        */
/* ------------------------------------------------------------------ */
const schema = z.object({
  client_name:   z.string().min(2, 'Name required (min. 2 characters)'),
  client_phone:  z.string().optional().or(z.literal('')),
  client_email:  z.string().email('Invalid email').optional().or(z.literal('')),
  shopify_order: z.string().optional().or(z.literal('')),
  product_name:  z.string().optional().or(z.literal('')),
  category:      z.enum(['arrival', 'assistance', 'lead', 'problem']),
  urgency:       z.enum(['low', 'normal', 'high', 'critical']),
  expected_date: z.string().optional().or(z.literal('')),
  cause:         z.string().optional().or(z.literal('')),
  notes:         z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function CaseFormPage() {
  const navigate  = useNavigate()
  const { id }    = useParams()
  const isEditing = !!id

  const { data: existingCase, isLoading: loadingCase } = useCase(id)
  const createCase = useCreateCase()
  const updateCase = useUpdateCase()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'arrival', urgency: 'normal' },
  })

  const watchedCategory = watch('category')
  const watchedUrgency  = watch('urgency')

  useEffect(() => {
    if (existingCase) {
      reset({
        client_name:   existingCase.client_name,
        client_phone:  existingCase.client_phone  || '',
        client_email:  existingCase.client_email  || '',
        shopify_order: existingCase.shopify_order || '',
        product_name:  existingCase.product_name  || '',
        category:      existingCase.category,
        urgency:       existingCase.urgency,
        expected_date: existingCase.expected_date || '',
        cause:         existingCase.cause  || '',
        notes:         existingCase.notes  || '',
      })
    }
  }, [existingCase, reset])

  const onSubmit = async (data: FormData) => {
    const payload = {
      client_name:     data.client_name,
      client_phone:    data.client_phone  || null,
      client_email:    data.client_email  || null,
      shopify_order:   data.shopify_order || null,
      product_name:    data.product_name  || null,
      category:        data.category,
      urgency:         data.urgency,
      expected_date:   data.expected_date || null,
      service_status:  isEditing ? (existingCase?.service_status ?? null) : null as ServiceStatus | null,
      cause:           data.cause  || null,
      notes:           data.notes  || null,
      status:          (existingCase?.status || 'open') as 'open' | 'resolved',
      resolved_at:     existingCase?.resolved_at || null,
      last_contact_at: existingCase?.last_contact_at || null,
    }

    try {
      if (isEditing && id) {
        await updateCase.mutateAsync({ id, ...payload })
        toast.success('Case updated!')
        navigate(`/cases/${id}`)
      } else {
        const newCase = await createCase.mutateAsync(payload)
        toast.success('Case created! ✅')
        navigate(`/cases/${newCase.id}`)
      }
    } catch {
      toast.error('Error saving. Check your connection and try again.')
    }
  }

  if (isEditing && loadingCase) {
    return (
      <>
        <Header title="Loading..." showBack />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header title={isEditing ? 'Edit Case' : 'New Case'} showBack />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-4 space-y-6 pb-10">

        {/* ── CASE TYPE ─────────────────────────────────── */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Case Type <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_CARDS.map((cat) => {
              const isSelected = watchedCategory === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setValue('category', cat.value, { shouldValidate: true })}
                  className={`relative text-left rounded-xl border-2 p-3 transition-all active:scale-[0.97] ${
                    isSelected ? cat.activeBg : cat.inactiveBg
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-semibold leading-tight">{cat.label}</div>
                  <div className={`text-[10px] mt-1 leading-tight ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                    {cat.description}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-[10px]">✓</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── URGENCY ───────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-gray-700">Urgency</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {(Object.entries(URGENCY_LABELS) as [FormData['urgency'], string][]).map(([val, lbl]) => {
              const isSelected = watchedUrgency === val
              const colorMap: Record<string, string> = {
                low:      isSelected ? 'bg-gray-500 text-white border-gray-500'     : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
                normal:   isSelected ? 'bg-sky-500 text-white border-sky-500'       : 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
                high:     isSelected ? 'bg-amber-500 text-white border-amber-500'   : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                critical: isSelected ? 'bg-red-600 text-white border-red-600'       : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
              }
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setValue('urgency', val, { shouldValidate: true })}
                  className={`py-2 px-1 rounded-lg border text-xs font-semibold text-center transition-all active:scale-95 ${colorMap[val]}`}
                >
                  {lbl}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── CLIENT ────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Details</p>

          <div className="space-y-1.5">
            <Label htmlFor="client_name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input id="client_name" placeholder="Full name" {...register('client_name')} />
            {errors.client_name && <p className="text-xs text-red-500">{errors.client_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="client_phone">Phone / WhatsApp</Label>
            <Input
              id="client_phone"
              type="tel"
              placeholder="(11) 99999-9999"
              inputMode="tel"
              {...register('client_phone')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="client_email">Email</Label>
            <Input
              id="client_email"
              type="email"
              placeholder="client@email.com"
              inputMode="email"
              {...register('client_email')}
            />
            {errors.client_email && <p className="text-xs text-red-500">{errors.client_email.message}</p>}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* ── PRODUCT ───────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</p>

          <div className="space-y-1.5">
            <Label htmlFor="product_name">Product Name</Label>
            <Input id="product_name" placeholder="e.g. Nike Air Max 270" {...register('product_name')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shopify_order">Order # / Shopify</Label>
            <Input
              id="shopify_order"
              placeholder="e.g. 1234"
              inputMode="numeric"
              {...register('shopify_order')}
            />
          </div>
        </div>

        {/* ── REASON + EXPECTED DATE (service only) ────── */}
        {watchedCategory === 'assistance' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cause">Reason for Service</Label>
              <Textarea
                id="cause"
                placeholder="Describe the issue or reason for sending to service..."
                rows={3}
                className="resize-none"
                {...register('cause')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expected_date">Expected Return Date</Label>
              <Input
                id="expected_date"
                type="date"
                className="block"
                {...register('expected_date')}
              />
              <p className="text-xs text-gray-400">When do you expect the item back from service?</p>
            </div>
          </div>
        )}

        {/* ── NOTES ─────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Extra details, context, next steps..."
            rows={3}
            className="resize-none"
            {...register('notes')}
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEditing ? (
            'Save Changes'
          ) : (
            '+ Create Case'
          )}
        </Button>
      </form>
    </>
  )
}

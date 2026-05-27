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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCase, useCreateCase, useUpdateCase } from '@/hooks/useCases'
import { CATEGORY_LABELS, URGENCY_LABELS } from '@/types'

const schema = z.object({
  client_name: z.string().min(2, 'Nome obrigatório (mín. 2 caracteres)'),
  client_phone: z.string().optional().or(z.literal('')),
  client_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  shopify_order: z.string().optional().or(z.literal('')),
  product_name: z.string().optional().or(z.literal('')),
  category: z.enum(['arrival', 'assistance', 'lead', 'problem']),
  urgency: z.enum(['low', 'normal', 'high', 'critical']),
  cause: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function CaseFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
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
    defaultValues: {
      category: 'arrival',
      urgency: 'normal',
    },
  })

  const watchedCategory = watch('category')

  useEffect(() => {
    if (existingCase) {
      reset({
        client_name: existingCase.client_name,
        client_phone: existingCase.client_phone || '',
        client_email: existingCase.client_email || '',
        shopify_order: existingCase.shopify_order || '',
        product_name: existingCase.product_name || '',
        category: existingCase.category,
        urgency: existingCase.urgency,
        cause: existingCase.cause || '',
        notes: existingCase.notes || '',
      })
    }
  }, [existingCase, reset])

  const onSubmit = async (data: FormData) => {
    const payload = {
      client_name: data.client_name,
      client_phone: data.client_phone || null,
      client_email: data.client_email || null,
      shopify_order: data.shopify_order || null,
      product_name: data.product_name || null,
      category: data.category,
      urgency: data.urgency,
      cause: data.cause || null,
      notes: data.notes || null,
      status: (existingCase?.status || 'open') as 'open' | 'resolved',
      resolved_at: existingCase?.resolved_at || null,
    }

    try {
      if (isEditing && id) {
        await updateCase.mutateAsync({ id, ...payload })
        toast.success('Caso atualizado!')
        navigate(`/cases/${id}`)
      } else {
        const newCase = await createCase.mutateAsync(payload)
        toast.success('Caso criado!')
        navigate(`/cases/${newCase.id}`)
      }
    } catch {
      toast.error('Erro ao salvar caso')
    }
  }

  if (isEditing && loadingCase) {
    return (
      <>
        <Header title="Carregando..." showBack />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header title={isEditing ? 'Editar Caso' : 'Novo Caso'} showBack />

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-4 space-y-5 pb-8">
        {/* Category */}
        <div className="space-y-1.5">
          <Label>Categoria *</Label>
          <Select value={watchedCategory} onValueChange={(v) => setValue('category', v as FormData['category'])}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Urgency */}
        <div className="space-y-1.5">
          <Label>Urgência</Label>
          <Select value={watch('urgency')} onValueChange={(v) => setValue('urgency', v as FormData['urgency'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dados do Cliente</p>
        </div>

        {/* Client name */}
        <div className="space-y-1.5">
          <Label htmlFor="client_name">Nome do Cliente *</Label>
          <Input
            id="client_name"
            placeholder="Nome completo"
            {...register('client_name')}
          />
          {errors.client_name && (
            <p className="text-xs text-red-500">{errors.client_name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="client_phone">Telefone</Label>
          <Input
            id="client_phone"
            type="tel"
            placeholder="(11) 99999-9999"
            inputMode="tel"
            {...register('client_phone')}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="client_email">E-mail</Label>
          <Input
            id="client_email"
            type="email"
            placeholder="cliente@email.com"
            inputMode="email"
            {...register('client_email')}
          />
          {errors.client_email && (
            <p className="text-xs text-red-500">{errors.client_email.message}</p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dados do Produto</p>
        </div>

        {/* Product */}
        <div className="space-y-1.5">
          <Label htmlFor="product_name">Nome do Produto</Label>
          <Input
            id="product_name"
            placeholder="Ex: Tênis Nike Air Max"
            {...register('product_name')}
          />
        </div>

        {/* Shopify order */}
        <div className="space-y-1.5">
          <Label htmlFor="shopify_order">Nº Pedido Shopify</Label>
          <Input
            id="shopify_order"
            placeholder="Ex: 1234"
            {...register('shopify_order')}
          />
        </div>

        {/* Cause — only for assistance */}
        {watchedCategory === 'assistance' && (
          <div className="space-y-1.5">
            <Label htmlFor="cause">Motivo do Envio para Assistência</Label>
            <Textarea
              id="cause"
              placeholder="Descreva o problema ou motivo do envio..."
              rows={3}
              className="resize-none"
              {...register('cause')}
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas Livres</Label>
          <Textarea
            id="notes"
            placeholder="Observações, detalhes extras..."
            rows={3}
            className="resize-none"
            {...register('notes')}
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isEditing ? (
            'Salvar Alterações'
          ) : (
            'Criar Caso'
          )}
        </Button>
      </form>
    </>
  )
}

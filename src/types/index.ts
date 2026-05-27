export type Category      = 'arrival' | 'assistance' | 'lead' | 'problem'
export type Status        = 'open' | 'resolved'
export type Urgency       = 'low' | 'normal' | 'high' | 'critical'
export type ServiceStatus = 'sent' | 'evaluation' | 'in_repair' | 'ready' | 'delivered'

export interface Case {
  id: string
  user_id: string
  client_name: string
  client_phone: string | null
  client_email: string | null
  shopify_order: string | null
  product_name: string | null
  category: Category
  status: Status
  urgency: Urgency
  cause: string | null
  notes: string | null
  call_count: number
  created_at: string
  updated_at: string
  resolved_at: string | null
  /* New fields (added via migration 002) */
  expected_date: string | null
  service_status: ServiceStatus | null
  last_contact_at: string | null
}

export interface CallLog {
  id: string
  case_id: string
  user_id: string
  logged_at: string
  notes: string | null
}

export interface Reminder {
  id: string
  case_id: string
  user_id: string
  remind_at: string
  title: string
  sent: boolean
  created_at: string
  case?: Case
}

/* ------------------------------------------------------------------ */
/*  Display constants                                                  */
/* ------------------------------------------------------------------ */

export const CATEGORY_LABELS: Record<Category, string> = {
  arrival:    '📦 Arrival Alert',
  assistance: '🛠️ Service / Repair',
  lead:       '🎯 Lead / Interest',
  problem:    '🚨 Inherited Problem',
}

export const CATEGORY_SHORT: Record<Category, string> = {
  arrival:    '📦 Arrival',
  assistance: '🛠️ Service',
  lead:       '🎯 Lead',
  problem:    '🚨 Problem',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  arrival:    'bg-blue-100 text-blue-700 border-blue-200',
  assistance: 'bg-orange-100 text-orange-700 border-orange-200',
  lead:       'bg-purple-100 text-purple-700 border-purple-200',
  problem:    'bg-red-100 text-red-700 border-red-200',
}

export const CATEGORY_ICON_COLORS: Record<Category, string> = {
  arrival:    'text-blue-600',
  assistance: 'text-orange-600',
  lead:       'text-purple-600',
  problem:    'text-red-600',
}

export const CATEGORY_BG: Record<Category, string> = {
  arrival:    'bg-blue-50 border-blue-100',
  assistance: 'bg-orange-50 border-orange-100',
  lead:       'bg-purple-50 border-purple-100',
  problem:    'bg-red-50 border-red-100',
}

export const URGENCY_LABELS: Record<Urgency, string> = {
  low:      'Low',
  normal:   'Normal',
  high:     'High',
  critical: 'Critical',
}

export const URGENCY_COLORS: Record<Urgency, string> = {
  low:      'bg-gray-100 text-gray-600 border-gray-200',
  normal:   'bg-sky-100 text-sky-700 border-sky-200',
  high:     'bg-amber-100 text-amber-700 border-amber-200',
  critical: 'bg-red-100 text-red-700 border-red-200',
}

export const STATUS_LABELS: Record<Status, string> = {
  open:     'Open',
  resolved: 'Resolved',
}

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  sent:       'Sent',
  evaluation: 'Evaluation',
  in_repair:  'In Repair',
  ready:      'Ready for Pickup',
  delivered:  'Delivered',
}

export const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  sent:       'bg-gray-100 text-gray-600',
  evaluation: 'bg-blue-100 text-blue-700',
  in_repair:  'bg-orange-100 text-orange-700',
  ready:      'bg-green-100 text-green-700',
  delivered:  'bg-gray-100 text-gray-500',
}

export type SortOption = 'newest' | 'oldest' | 'urgency' | 'name'

export const SORT_LABELS: Record<SortOption, string> = {
  newest:  'Newest first',
  oldest:  'Oldest first',
  urgency: 'By urgency',
  name:    'Client name',
}

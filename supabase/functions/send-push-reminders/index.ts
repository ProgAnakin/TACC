// Supabase Edge Function — called every minute by pg_cron
// Queries due reminders, sends Web Push notifications, marks them sent.
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@caderninho.app'
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  // Only accept requests from Supabase internal (pg_cron / dashboard)
  const auth = req.headers.get('Authorization') ?? ''
  if (auth !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date().toISOString()

  // Fetch all due, unsent reminders with their case info
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select('id, title, case_id, user_id, cases!inner(client_name)')
    .lte('remind_at', now)
    .eq('sent', false)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  if (!reminders?.length) {
    return new Response(JSON.stringify({ sent: 0, processed: 0 }), { status: 200 })
  }

  let sent = 0
  const processedIds: string[] = []

  for (const reminder of reminders) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', reminder.user_id)

    if (!subs?.length) {
      processedIds.push(reminder.id)
      continue
    }

    const clientName = (reminder.cases as { client_name: string } | null)?.client_name
    const payload = JSON.stringify({
      title: `⏰ ${reminder.title}`,
      body: clientName ? `Cliente: ${clientName}` : 'Caderninho Digital',
      url: `/cases/${reminder.case_id}`,
      reminderId: reminder.id,
    })

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          // Subscription expired — clean it up
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        } else {
          console.error('Push error:', err)
        }
      }
    }

    processedIds.push(reminder.id)
  }

  if (processedIds.length > 0) {
    await supabase.from('reminders').update({ sent: true }).in('id', processedIds)
  }

  return new Response(
    JSON.stringify({ sent, processed: processedIds.length }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})

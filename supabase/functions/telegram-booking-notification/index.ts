type BookingRecord = {
  name?: string
  customer_name?: string
  full_name?: string
  phone?: string
  phone_number?: string
  mobile?: string
  category?: string
  service?: string
  service_requested?: string
  consultation_type?: string
  booking_date?: string
  date?: string
  slot?: string
  time?: string
  created_at?: string
}

type WebhookPayload = {
  type?: string
  table?: string
  record?: BookingRecord
  new?: BookingRecord
}

const TELEGRAM_API_BASE = 'https://api.telegram.org'

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')

  if (webhookSecret) {
    const requestSecret = request.headers.get('x-webhook-secret')

    if (requestSecret !== webhookSecret) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }
  }

  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

  if (!botToken || !chatId) {
    return jsonResponse(
      { error: 'Telegram environment variables are missing' },
      500
    )
  }

  let payload: WebhookPayload

  try {
    payload = await request.json()
  } catch (_error) {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const record = payload.record || payload.new || (payload as BookingRecord)

  if (!record) {
    return jsonResponse({ error: 'Booking record not found' }, 400)
  }

  const message = buildTelegramMessage(record, payload.table)
  const telegramResponse = await fetch(
    `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    }
  )

  if (!telegramResponse.ok) {
    const telegramError = await telegramResponse.text()

    return jsonResponse(
      {
        error: 'Telegram notification failed',
        details: telegramError
      },
      502
    )
  }

  return jsonResponse({ ok: true })
})

function buildTelegramMessage(record: BookingRecord, tableName?: string){
  const customerName =
    record.name || record.customer_name || record.full_name || 'Not provided'
  const phone =
    record.phone || record.phone_number || record.mobile || 'Not provided'
  const service =
    record.category ||
    record.service ||
    record.service_requested ||
    record.consultation_type ||
    'Not provided'
  const date = record.booking_date || record.date || 'Not provided'
  const time = record.slot || record.time || 'Not provided'
  const source = tableName || 'booking request'

  return [
    '<b>New consultation request</b>',
    '',
    `<b>Source:</b> ${escapeHtml(source)}`,
    `<b>Customer:</b> ${escapeHtml(customerName)}`,
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    `<b>Service:</b> ${escapeHtml(service)}`,
    `<b>Date:</b> ${escapeHtml(date)}`,
    `<b>Time:</b> ${escapeHtml(time)}`,
    record.created_at
      ? `<b>Submitted:</b> ${escapeHtml(record.created_at)}`
      : ''
  ].filter(Boolean).join('\n')
}

function escapeHtml(value: string){
  return String(value)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;')
}

function jsonResponse(body: Record<string, unknown>, status = 200){
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

# Telegram booking notification Edge Function

This Edge Function sends a Telegram notification to the site owner whenever a new booking is inserted.

## Required Supabase function secrets

Set these in Supabase:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
supabase secrets set TELEGRAM_CHAT_ID="your-telegram-chat-id"
supabase secrets set TELEGRAM_WEBHOOK_SECRET="choose-a-long-random-secret"
```

`TELEGRAM_CHAT_ID` must be your private Telegram chat id. The customer is not notified.

## Deploy

Deploy without JWT verification because the database trigger calls this function directly. The shared secret header still protects the endpoint.

```bash
supabase functions deploy telegram-booking-notification --no-verify-jwt
```

## Database trigger configuration

Run the migration in `supabase/migrations/20260613000000_telegram_booking_notification.sql`.

Then configure these database settings in Supabase SQL Editor:

```sql
alter database postgres
set app.settings.telegram_notification_function_url =
'https://YOUR_PROJECT_REF.functions.supabase.co/telegram-booking-notification';

alter database postgres
set app.settings.telegram_notification_webhook_secret =
'the-same-long-random-secret-used-for-TELEGRAM_WEBHOOK_SECRET';
```

Restart database connections or wait briefly for the database settings to apply.

## Message fields

The Telegram message includes:

- customer name
- phone number
- service requested
- date
- time

The function supports the current `bookings` table fields: `name`, `phone`, `category`, `booking_date`, and `slot`.

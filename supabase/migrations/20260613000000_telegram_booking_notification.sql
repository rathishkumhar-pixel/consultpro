create extension if not exists pg_net with schema extensions;

create or replace function public.notify_telegram_on_booking_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  edge_function_url text;
  webhook_secret text;
begin
  edge_function_url :=
    current_setting(
      'app.settings.telegram_notification_function_url',
      true
    );

  webhook_secret :=
    current_setting(
      'app.settings.telegram_notification_webhook_secret',
      true
    );

  if edge_function_url is null or edge_function_url = '' then
    raise warning
      'Telegram notification skipped: edge function URL is not configured';
    return new;
  end if;

  perform net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type',
      'application/json',
      'x-webhook-secret',
      coalesce(webhook_secret,'')
    ),
    body := jsonb_build_object(
      'type',
      TG_OP,
      'table',
      TG_TABLE_NAME,
      'schema',
      TG_TABLE_SCHEMA,
      'record',
      to_jsonb(new)
    )
  );

  return new;
end;
$$;

drop trigger if exists bookings_telegram_notification on public.bookings;

create trigger bookings_telegram_notification
after insert on public.bookings
for each row
execute function public.notify_telegram_on_booking_insert();

do $$
begin
  if to_regclass('public.consultation_requests') is not null then
    execute
      'drop trigger if exists consultation_requests_telegram_notification on public.consultation_requests';

    execute
      'create trigger consultation_requests_telegram_notification
       after insert on public.consultation_requests
       for each row
       execute function public.notify_telegram_on_booking_insert()';
  end if;
end;
$$;

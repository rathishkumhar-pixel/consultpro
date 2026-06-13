alter table public.bookings
add column if not exists completed boolean not null default false,
add column if not exists completed_at timestamp;

create policy "public_update_bookings"
on public.bookings
for update
to public
using (true)
with check (true);

create table if not exists public.testimonials (
  id bigint generated always as identity primary key,
  customer_name text not null,
  location text not null,
  review text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  is_active boolean not null default true,
  created_at timestamp default now()
);

alter table public.testimonials enable row level security;

create policy "public_select_testimonials"
on public.testimonials
for select
to public
using (true);

create policy "public_insert_testimonials"
on public.testimonials
for insert
to public
with check (true);

create policy "public_update_testimonials"
on public.testimonials
for update
to public
using (true)
with check (true);

create policy "public_delete_testimonials"
on public.testimonials
for delete
to public
using (true);

alter table public.site_content
add column if not exists seo_title text,
add column if not exists seo_description text,
add column if not exists seo_og_image text;

update public.site_content
set
  seo_title = coalesce(seo_title,'RV Consulting | Expert Advice Before Important Decisions'),
  seo_description = coalesce(
    seo_description,
    'Get practical, actionable guidance from experienced professionals before making important business, career, investment, technology, vehicle, and local service decisions.'
  )
where id in (
  select id
  from public.site_content
  order by id
  limit 1
);

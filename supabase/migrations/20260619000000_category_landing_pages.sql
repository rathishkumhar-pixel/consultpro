alter table public.categories
add column if not exists slug text,
add column if not exists page_title text,
add column if not exists page_image text,
add column if not exists page_content text;

create unique index if not exists categories_slug_key
on public.categories (slug)
where slug is not null and slug <> '';

update public.categories
set
  slug = 'career-guidance',
  page_title = coalesce(page_title, title, 'Career Guidance'),
  page_content = coalesce(
    page_content,
    popup_description,
    description,
    'Get practical career guidance from experienced professionals before your next important move.'
  ),
  page_image = coalesce(page_image, popup_image, '')
where lower(coalesce(title, '')) like '%career%'
  and (slug is null or slug = '');

update public.categories
set
  slug = 'business-consulting',
  page_title = coalesce(page_title, title, 'Business Consulting'),
  page_content = coalesce(
    page_content,
    popup_description,
    description,
    'Validate ideas, improve plans, and make stronger business decisions with expert support.'
  ),
  page_image = coalesce(page_image, popup_image, '')
where lower(coalesce(title, '')) like '%business%'
  and (slug is null or slug = '');

update public.categories
set
  slug = 'car-buying-advice',
  page_title = coalesce(page_title, title, 'Car Buying Advice'),
  page_content = coalesce(
    page_content,
    popup_description,
    description,
    'Compare vehicles, budgets, ownership costs, and resale value before you buy.'
  ),
  page_image = coalesce(page_image, popup_image, '')
where (
    lower(coalesce(title, '')) like '%car%'
    or lower(coalesce(title, '')) like '%vehicle%'
    or lower(coalesce(title, '')) like '%auto%'
  )
  and (slug is null or slug = '');

update public.categories
set
  slug = 'investment-guidance',
  page_title = coalesce(page_title, title, 'Investment Guidance'),
  page_content = coalesce(
    page_content,
    popup_description,
    description,
    'Understand risk, planning, and practical investment decision making with clear guidance.'
  ),
  page_image = coalesce(page_image, popup_image, '')
where lower(coalesce(title, '')) like '%invest%'
  and (slug is null or slug = '');

insert into public.categories (
  title,
  description,
  icon,
  popup_title,
  popup_description,
  popup_image,
  slug,
  page_title,
  page_content,
  page_image
)
select
  seed.title,
  seed.description,
  seed.icon,
  seed.page_title,
  seed.page_content,
  '',
  seed.slug,
  seed.page_title,
  seed.page_content,
  ''
from (
  values
    (
      'Career Guidance',
      'Choose the right path and move forward confidently.',
      'CG',
      'Career Guidance',
      'Get practical career guidance from experienced professionals before your next important move.',
      'career-guidance'
    ),
    (
      'Business Consulting',
      'Validate ideas and make stronger business decisions.',
      'BC',
      'Business Consulting',
      'Validate ideas, improve plans, and make stronger business decisions with expert support.',
      'business-consulting'
    ),
    (
      'Car Buying Advice',
      'Compare vehicles and ownership costs before buying.',
      'CA',
      'Car Buying Advice',
      'Compare vehicles, budgets, ownership costs, and resale value before you buy.',
      'car-buying-advice'
    ),
    (
      'Investment Guidance',
      'Understand risk and practical investment planning.',
      'IG',
      'Investment Guidance',
      'Understand risk, planning, and practical investment decision making with clear guidance.',
      'investment-guidance'
    )
) as seed(title, description, icon, page_title, page_content, slug)
where not exists (
  select 1
  from public.categories existing
  where existing.slug = seed.slug
);

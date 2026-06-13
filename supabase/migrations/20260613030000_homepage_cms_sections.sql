alter table public.site_content
add column if not exists hero_eyebrow text,
add column if not exists hero_secondary_button text,
add column if not exists hero_illustration text,
add column if not exists hero_image_alt text,
add column if not exists trust_badges jsonb default '[]'::jsonb,
add column if not exists why_title text,
add column if not exists features_json jsonb default '[]'::jsonb,
add column if not exists services_title text,
add column if not exists services_json jsonb default '[]'::jsonb,
add column if not exists categories_title text,
add column if not exists steps_title text,
add column if not exists steps_json jsonb default '[]'::jsonb,
add column if not exists testimonials_title text,
add column if not exists faq_title text,
add column if not exists faqs_json jsonb default '[]'::jsonb,
add column if not exists booking_eyebrow text,
add column if not exists booking_title text,
add column if not exists booking_description text,
add column if not exists cta_title text,
add column if not exists cta_description text,
add column if not exists cta_button text,
add column if not exists footer_brand text,
add column if not exists footer_description text;

update public.site_content
set
  hero_eyebrow = coalesce(hero_eyebrow,'RV Consulting'),
  hero_title = coalesce(nullif(hero_title,''),'Expert Advice Before Important Decisions'),
  hero_description = coalesce(
    nullif(hero_description,''),
    'Get practical, actionable guidance from experienced professionals. No generic advice. No endless internet research. Just solutions that work.'
  ),
  hero_button = coalesce(nullif(hero_button,''),'Book Consultation'),
  hero_secondary_button = coalesce(hero_secondary_button,'How It Works'),
  hero_image_alt = coalesce(hero_image_alt,'Customer consulting with experts'),
  trust_badges = case
    when trust_badges is null or trust_badges = '[]'::jsonb then
      '["Practical Advice","Local Experts","Real Experience","Multiple Domains"]'::jsonb
    else trust_badges
  end,
  why_title = coalesce(why_title,'Why Choose RV Consulting?'),
  features_json = case
    when features_json is null or features_json = '[]'::jsonb then
      '[
        {
          "title":"Practical Advice, Not Theory",
          "description":"Receive clear recommendations and next steps instead of generic motivational guidance."
        },
        {
          "title":"Experts Across Multiple Fields",
          "description":"Connect with professionals experienced in business, careers, investments, technology, vehicles and more."
        },
        {
          "title":"Support In Your Language",
          "description":"Communicate comfortably with experts who understand your language and local context."
        },
        {
          "title":"Local Knowledge Matters",
          "description":"Get recommendations based on local vendors, services, pricing and practical ground realities."
        }
      ]'::jsonb
    else features_json
  end,
  services_title = coalesce(services_title,'Services We Help With'),
  services_json = case
    when services_json is null or services_json = '[]'::jsonb then
      '[
        {
          "icon":"BUS",
          "title":"Business Consultation",
          "description":"Validate ideas, improve plans, and make stronger business decisions.",
          "button":"Book Now"
        },
        {
          "icon":"CAR",
          "title":"Career Guidance",
          "description":"Choose the right path, prepare better, and move forward confidently.",
          "button":"Book Now"
        },
        {
          "icon":"TECH",
          "title":"Technology Advice",
          "description":"Get help with tools, software choices, IT careers, and digital decisions.",
          "button":"Book Now"
        },
        {
          "icon":"AUTO",
          "title":"Vehicle Purchase Consultation",
          "description":"Compare vehicles, budgets, ownership costs, and resale value before buying.",
          "button":"Book Now"
        },
        {
          "icon":"INV",
          "title":"Investment Guidance",
          "description":"Understand risk, planning, and practical investment decision making.",
          "button":"Book Now"
        },
        {
          "icon":"LOC",
          "title":"Local Vendor Recommendations",
          "description":"Find practical options based on local pricing, availability, and service quality.",
          "button":"Book Now"
        }
      ]'::jsonb
    else services_json
  end,
  categories_title = coalesce(categories_title,'Consultation Categories'),
  steps_title = coalesce(steps_title,'How It Works'),
  steps_json = case
    when steps_json is null or steps_json = '[]'::jsonb then
      '[
        {"step":"Step 1","title":"Submit Requirement"},
        {"step":"Step 2","title":"Get Matched With Expert"},
        {"step":"Step 3","title":"Attend Consultation"},
        {"step":"Step 4","title":"Receive Action Plan"},
        {"step":"Step 5","title":"Implement With Confidence"}
      ]'::jsonb
    else steps_json
  end,
  testimonials_title = coalesce(testimonials_title,'Customer Stories'),
  faq_title = coalesce(faq_title,'Frequently Asked Questions'),
  faqs_json = case
    when faqs_json is null or faqs_json = '[]'::jsonb then
      '[
        {
          "question":"Why should I use RV Consulting?",
          "answer":"RV Consulting helps you make important decisions with practical guidance from experienced professionals instead of relying on scattered internet research."
        },
        {
          "question":"How are experts selected?",
          "answer":"Experts are selected based on real experience, domain knowledge, practical communication, and their ability to give clear next steps."
        },
        {
          "question":"Can I consult in my local language?",
          "answer":"Yes. The goal is to make consultations comfortable and useful, including support for local language and context wherever available."
        },
        {
          "question":"How do online consultations work?",
          "answer":"Submit your requirement, choose a suitable service and time, then attend the consultation online with the matched expert."
        },
        {
          "question":"What industries are covered?",
          "answer":"Business, career, technology, vehicles, investments, local vendors, construction, higher studies, relationship advice, and more."
        }
      ]'::jsonb
    else faqs_json
  end,
  booking_eyebrow = coalesce(booking_eyebrow,'Book Consultation'),
  booking_title = coalesce(booking_title,'Tell us what you need help with'),
  booking_description = coalesce(
    booking_description,
    'Share your requirement and preferred slot. We will help you connect with the right expert.'
  ),
  cta_title = coalesce(cta_title,'Stop Guessing. Start Making Better Decisions.'),
  cta_description = coalesce(
    cta_description,
    'Get guidance from experienced professionals before making important choices.'
  ),
  cta_button = coalesce(cta_button,'Book Consultation'),
  footer_brand = coalesce(footer_brand,'RV Consulting'),
  footer_description = coalesce(footer_description,'Expert consulting sessions, booked online.')
where id in (
  select id
  from public.site_content
  order by id
  limit 1
);

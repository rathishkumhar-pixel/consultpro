import HomeClient from './home-client'

export async function generateMetadata(){
  const content = await getSeoContent()
  const title = content?.seo_title || 'RV Consulting'
  const description =
    content?.seo_description ||
    'Get practical consulting advice from experienced professionals before making important decisions.'
  const ogImage = content?.seo_og_image

  return {
    title,
    description,
    openGraph:{
      title,
      description,
      images:ogImage ? [{ url:ogImage }] : []
    },
    twitter:{
      card:'summary_large_image',
      title,
      description,
      images:ogImage ? [ogImage] : []
    }
  }
}

export default async function Home(){
  return <HomeClient {...await getHomepageData()} />
}

async function getSeoContent(){
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if(!supabaseUrl || !supabaseAnonKey){
    return null
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_content?select=seo_title,seo_description,seo_og_image&limit=1`,
      {
        headers:{
          apikey:supabaseAnonKey,
          Authorization:`Bearer ${supabaseAnonKey}`
        },
        next:{
          revalidate:60
        }
      }
    )

    if(!response.ok){
      return null
    }

    const rows = await response.json()
    return rows?.[0] || null
  } catch (_error) {
    return null
  }
}

async function getHomepageData(){
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if(!supabaseUrl || !supabaseAnonKey){
    return {}
  }

  const headers = {
    apikey:supabaseAnonKey,
    Authorization:`Bearer ${supabaseAnonKey}`
  }

  try {
    const [content, categories, testimonials] = await Promise.all([
      fetchSupabaseRows(
        `${supabaseUrl}/rest/v1/site_content?select=*&limit=1`,
        headers
      ),
      fetchSupabaseRows(
        `${supabaseUrl}/rest/v1/categories?select=*`,
        headers
      ),
      fetchSupabaseRows(
        `${supabaseUrl}/rest/v1/testimonials?select=*&is_active=eq.true&order=created_at.desc`,
        headers
      )
    ])

    return {
      initialContent:content?.[0] || null,
      initialCategories:categories || [],
      initialTestimonials:testimonials || []
    }
  } catch (_error) {
    return {}
  }
}

async function fetchSupabaseRows(url, headers){
  const response = await fetch(url, {
    headers,
    next:{
      revalidate:60
    }
  })

  if(!response.ok){
    return []
  }

  return response.json()
}

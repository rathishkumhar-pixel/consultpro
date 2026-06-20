const RESERVED_SLUGS = new Set([
  'admin',
  'login',
  'contact',
  'api'
])

function getSupabaseConfig(){
  return {
    url:process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

export function isReservedSlug(slug){
  return RESERVED_SLUGS.has(slug)
}

export async function fetchCategorySlugs(){
  const { url,key } = getSupabaseConfig()

  if(!url || !key){
    return []
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/categories?select=slug&slug=not.is.null`,
      {
        headers:{
          apikey:key,
          Authorization:`Bearer ${key}`
        },
        next:{
          revalidate:60
        }
      }
    )

    if(!response.ok){
      return []
    }

    const rows = await response.json()
    return rows
      .map((row)=>row.slug)
      .filter((slug)=>slug && !isReservedSlug(slug))
  } catch (_error) {
    return []
  }
}

export async function fetchCategoryBySlug(slug){
  if(!slug || isReservedSlug(slug)){
    return null
  }

  const { url,key } = getSupabaseConfig()

  if(!url || !key){
    return null
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/categories?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      {
        headers:{
          apikey:key,
          Authorization:`Bearer ${key}`
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

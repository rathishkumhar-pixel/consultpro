import { notFound } from 'next/navigation'
import CategoryPageClient from './category-client'
import {
  fetchCategoryBySlug,
  fetchCategorySlugs,
  isReservedSlug
} from '../../lib/categories-server'

export async function generateStaticParams(){
  const slugs = await fetchCategorySlugs()

  return slugs.map((slug)=>({ slug }))
}

export async function generateMetadata({ params }){
  const category = await fetchCategoryBySlug(params.slug)

  if(!category){
    return {
      title:'Category'
    }
  }

  const title = category.page_title || category.title

  return {
    title,
    description:
      category.page_content ||
      category.description ||
      `Book a ${title} consultation.`
  }
}

export default async function CategoryPage({ params }){
  if(isReservedSlug(params.slug)){
    notFound()
  }

  const category = await fetchCategoryBySlug(params.slug)

  if(!category){
    notFound()
  }

  return <CategoryPageClient category={category} />
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const AUTH_STORAGE_KEY = 'admin-auth'

export default function Admin(){
  const router = useRouter()
  const [isAuthorized,setIsAuthorized] = useState(false)
  const [isCheckingAuth,setIsCheckingAuth] = useState(true)
  const [content,setContent] = useState({
    hero_title:'',
    hero_description:'',
    hero_button:'',
    hero_image:'',
    hero_eyebrow:'',
    hero_secondary_button:'',
    hero_illustration:'',
    hero_image_alt:'',
    trust_badges:'[]',
    why_title:'',
    features_json:'[]',
    services_title:'',
    services_json:'[]',
    categories_title:'',
    steps_title:'',
    steps_json:'[]',
    testimonials_title:'',
    faq_title:'',
    faqs_json:'[]',
    booking_eyebrow:'',
    booking_title:'',
    booking_description:'',
    cta_title:'',
    cta_description:'',
    cta_button:'',
    footer_brand:'',
    footer_description:'',
    seo_title:'',
    seo_description:'',
    seo_og_image:'',
    contact_title:'',
    contact_description:'',
    contact_phone:'',
    contact_email:'',
    contact_address:'',
    contact_hours:''
  })
  const [categories,setCategories] = useState([])
  const [testimonials,setTestimonials] = useState([])
  const [newCategory,setNewCategory] = useState('')
  const [newTestimonial,setNewTestimonial] = useState({
    customer_name:'',
    location:'',
    review:'',
    rating:'5'
  })
  const [message,setMessage] = useState('')

  useEffect(()=>{
    const hasAdminSession =
      window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'

    if(!hasAdminSession){
      setIsCheckingAuth(false)
      router.replace('/login')
      window.location.replace('/login')
      return
    }

    setIsAuthorized(true)
    setIsCheckingAuth(false)
  },[router])

  useEffect(()=>{
    if(isAuthorized){
      loadData()
    }
  },[isAuthorized])

  async function loadData(){
    const { data:contentData } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)
      .single()

    if(contentData){
      setContent(contentData)
    }

    const { data:categoryData } = await supabase
      .from('categories')
      .select('*')

    setCategories(categoryData || [])

    const { data:testimonialData } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at',{ ascending:false })

    setTestimonials(testimonialData || [])
  }

  async function saveContent(){
    await persistContent(content,'Updated successfully')
  }

  async function persistContent(nextContent,successMessage){
    const { data:existing } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)

    let response

    if(existing && existing.length > 0){
      response = await supabase
        .from('site_content')
        .update({
          hero_title:nextContent.hero_title,
          hero_description:nextContent.hero_description,
          hero_button:nextContent.hero_button,
          hero_image:nextContent.hero_image,
          hero_eyebrow:nextContent.hero_eyebrow,
          hero_secondary_button:nextContent.hero_secondary_button,
          hero_illustration:nextContent.hero_illustration,
          hero_image_alt:nextContent.hero_image_alt,
          trust_badges:normalizeJsonField(nextContent.trust_badges),
          why_title:nextContent.why_title,
          features_json:normalizeJsonField(nextContent.features_json),
          services_title:nextContent.services_title,
          services_json:normalizeJsonField(nextContent.services_json),
          categories_title:nextContent.categories_title,
          steps_title:nextContent.steps_title,
          steps_json:normalizeJsonField(nextContent.steps_json),
          testimonials_title:nextContent.testimonials_title,
          faq_title:nextContent.faq_title,
          faqs_json:normalizeJsonField(nextContent.faqs_json),
          booking_eyebrow:nextContent.booking_eyebrow,
          booking_title:nextContent.booking_title,
          booking_description:nextContent.booking_description,
          cta_title:nextContent.cta_title,
          cta_description:nextContent.cta_description,
          cta_button:nextContent.cta_button,
          footer_brand:nextContent.footer_brand,
          footer_description:nextContent.footer_description,
          seo_title:nextContent.seo_title,
          seo_description:nextContent.seo_description,
          seo_og_image:nextContent.seo_og_image,
          contact_title:nextContent.contact_title,
          contact_description:nextContent.contact_description,
          contact_phone:nextContent.contact_phone,
          contact_email:nextContent.contact_email,
          contact_address:nextContent.contact_address,
          contact_hours:nextContent.contact_hours
        })
        .eq('id', existing[0].id)
    } else {
      response = await supabase
        .from('site_content')
        .insert({
          hero_title:nextContent.hero_title,
          hero_description:nextContent.hero_description,
          hero_button:nextContent.hero_button,
          hero_image:nextContent.hero_image,
          hero_eyebrow:nextContent.hero_eyebrow,
          hero_secondary_button:nextContent.hero_secondary_button,
          hero_illustration:nextContent.hero_illustration,
          hero_image_alt:nextContent.hero_image_alt,
          trust_badges:normalizeJsonField(nextContent.trust_badges),
          why_title:nextContent.why_title,
          features_json:normalizeJsonField(nextContent.features_json),
          services_title:nextContent.services_title,
          services_json:normalizeJsonField(nextContent.services_json),
          categories_title:nextContent.categories_title,
          steps_title:nextContent.steps_title,
          steps_json:normalizeJsonField(nextContent.steps_json),
          testimonials_title:nextContent.testimonials_title,
          faq_title:nextContent.faq_title,
          faqs_json:normalizeJsonField(nextContent.faqs_json),
          booking_eyebrow:nextContent.booking_eyebrow,
          booking_title:nextContent.booking_title,
          booking_description:nextContent.booking_description,
          cta_title:nextContent.cta_title,
          cta_description:nextContent.cta_description,
          cta_button:nextContent.cta_button,
          footer_brand:nextContent.footer_brand,
          footer_description:nextContent.footer_description,
          seo_title:nextContent.seo_title,
          seo_description:nextContent.seo_description,
          seo_og_image:nextContent.seo_og_image,
          contact_title:nextContent.contact_title,
          contact_description:nextContent.contact_description,
          contact_phone:nextContent.contact_phone,
          contact_email:nextContent.contact_email,
          contact_address:nextContent.contact_address,
          contact_hours:nextContent.contact_hours
        })
    }

    if(response.error){
      setMessage(`Update failed: ${response.error.message}`)
      return false
    } else {
      setMessage(successMessage)
      return true
    }
  }

  async function addCategory(){
    if(!newCategory.trim()){
      return
    }

    const { error } = await supabase
      .from('categories')
      .insert({
        title:newCategory.trim(),
        description:'Consulting service',
        icon:'*',
        slug:slugify(newCategory),
        page_title:newCategory.trim(),
        page_content:'Consulting service',
        page_image:'',
        popup_title:newCategory.trim(),
        popup_description:'Consulting service',
        popup_image:''
      })

    if(error){
      setMessage('Category add failed')
    } else {
      setMessage('Category added')
      setNewCategory('')
      loadData()
    }
  }

  function updateCategoryField(categoryId,field,value){
    setCategories((currentCategories)=>
      currentCategories.map((category)=>
        category.id === categoryId
          ? {
              ...category,
              [field]:value
            }
          : category
      )
    )
  }

  async function saveCategory(category){
    const { error } = await supabase
      .from('categories')
      .update({
        title:category.title,
        description:category.description,
        icon:category.icon,
        slug:category.slug,
        page_title:category.page_title,
        page_content:category.page_content,
        page_image:category.page_image,
        popup_title:category.page_title || category.popup_title,
        popup_description:category.page_content || category.popup_description,
        popup_image:category.page_image || category.popup_image
      })
      .eq('id', category.id)

    if(error){
      setMessage(`Category update failed: ${error.message}`)
    } else {
      setMessage('Category landing page updated')
      loadData()
    }
  }

  function uploadCategoryImage(event,category,fieldName){
    const file = event.target.files?.[0]

    if(!file){
      return
    }

    if(!file.type.startsWith('image/')){
      setMessage('Please upload an image file')
      return
    }

    if(file.size > 1024 * 1024 * 2){
      setMessage('Image must be under 2MB')
      return
    }

    const reader = new FileReader()

    reader.onload = ()=>{
      updateCategoryField(category.id,fieldName,reader.result)
      setMessage('Category image ready. Save category to publish it.')
    }

    reader.onerror = ()=>{
      setMessage('Category image upload failed')
    }

    reader.readAsDataURL(file)
  }

  function removeCategoryImage(categoryId,fieldName){
    updateCategoryField(categoryId,fieldName,'')
    setMessage('Category image removed. Save category to publish it.')
  }

  async function addTestimonial(){
    if(
      !newTestimonial.customer_name.trim() ||
      !newTestimonial.location.trim() ||
      !newTestimonial.review.trim()
    ){
      setMessage('Please fill all testimonial fields')
      return
    }

    const { error } = await supabase
      .from('testimonials')
      .insert({
        customer_name:newTestimonial.customer_name.trim(),
        location:newTestimonial.location.trim(),
        review:newTestimonial.review.trim(),
        rating:Number(newTestimonial.rating || 5),
        is_active:true
      })

    if(error){
      setMessage(`Testimonial add failed: ${error.message}`)
      return
    }

    setNewTestimonial({
      customer_name:'',
      location:'',
      review:'',
      rating:'5'
    })
    setMessage('Testimonial added')
    loadData()
  }

  async function toggleTestimonial(testimonial){
    const { error } = await supabase
      .from('testimonials')
      .update({
        is_active:!testimonial.is_active
      })
      .eq('id',testimonial.id)

    if(error){
      setMessage(`Testimonial update failed: ${error.message}`)
      return
    }

    setMessage('Testimonial updated')
    loadData()
  }

  async function deleteTestimonial(testimonialId){
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id',testimonialId)

    if(error){
      setMessage(`Testimonial delete failed: ${error.message}`)
      return
    }

    setMessage('Testimonial deleted')
    loadData()
  }

  function uploadHeroImage(event){
    uploadContentImage(event,'hero_image','Hero banner image published to homepage')
  }

  function uploadHeroIllustration(event){
    uploadContentImage(event,'hero_illustration','Hero illustration published to homepage')
  }

  function uploadSeoOgImage(event){
    uploadContentImage(event,'seo_og_image','Open Graph image saved')
  }

  function uploadContentImage(event,fieldName,successMessage){
    const file = event.target.files?.[0]

    if(!file){
      return
    }

    if(!file.type.startsWith('image/')){
      setMessage('Please upload an image file')
      return
    }

    if(file.size > 1024 * 1024 * 2){
      setMessage('Image must be under 2MB')
      return
    }

    const reader = new FileReader()

    reader.onload = async ()=>{
      const nextContent = {
        ...content,
        [fieldName]:reader.result
      }

      setContent(nextContent)
      setMessage('Publishing image...')

      await persistContent(
        nextContent,
        successMessage
      )
    }

    reader.onerror = ()=>{
      setMessage('Image upload failed')
    }

    reader.readAsDataURL(file)
  }

  async function removeHeroImage(){
    const nextContent = {
      ...content,
      hero_image:''
    }

    setContent(nextContent)
    setMessage('Removing hero image...')

    await persistContent(
      nextContent,
      'Hero image removed from homepage'
    )
  }

  async function removeHeroIllustration(){
    const nextContent = {
      ...content,
      hero_illustration:''
    }

    setContent(nextContent)
    setMessage('Removing hero illustration...')

    await persistContent(
      nextContent,
      'Hero illustration removed from homepage'
    )
  }

  async function removeSeoOgImage(){
    const nextContent = {
      ...content,
      seo_og_image:''
    }

    setContent(nextContent)
    setMessage('Removing Open Graph image...')

    await persistContent(
      nextContent,
      'Open Graph image removed'
    )
  }

  function logout(){
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    router.replace('/login')
  }

  if(isCheckingAuth){
    return(
      <main style={styles.loadingPage}>
        <div style={styles.loadingCard}>Checking admin access...</div>
      </main>
    )
  }

  if(!isAuthorized){
    return(
      <main style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <p style={styles.redirectText}>Redirecting to login...</p>
          <button
            type="button"
            onClick={()=>window.location.replace('/login')}
            style={styles.primaryButton}
          >
            Go to Login
          </button>
        </div>
      </main>
    )
  }

  return(
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Secure admin</p>
          <h1 style={styles.title}>ConsultPro CMS</h1>
        </div>

        <div style={styles.headerActions}>
          <Link href="/admin/bookings" style={styles.navButton}>
            View Bookings
          </Link>

          <Link href="/admin/referrals" style={styles.navButton}>
            View Referrals
          </Link>

          <button
            type="button"
            onClick={logout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </header>

      <section style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Homepage Content</h2>
            <p style={styles.cardText}>
              Update the primary landing page copy.
            </p>
          </div>

          <label style={styles.label} htmlFor="hero-title">
            Hero title
          </label>
          <input
            id="hero-eyebrow"
            placeholder="Hero eyebrow"
            value={content.hero_eyebrow || ''}
            onChange={(e)=>
              setContent({
                ...content,
                hero_eyebrow:e.target.value
              })
            }
            style={styles.input}
          />
          <input
            id="hero-title"
            placeholder="Hero title"
            value={content.hero_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                hero_title:e.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="hero-description">
            Hero description
          </label>
          <textarea
            id="hero-description"
            placeholder="Hero description"
            value={content.hero_description || ''}
            onChange={(e)=>
              setContent({
                ...content,
                hero_description:e.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'120px',
              resize:'vertical'
            }}
          />

          <label style={styles.label} htmlFor="hero-button">
            Button text
          </label>
          <input
            id="hero-button"
            placeholder="Button text"
            value={content.hero_button || ''}
            onChange={(e)=>
              setContent({
                ...content,
                hero_button:e.target.value
              })
            }
            style={styles.input}
          />

          <input
            placeholder="Secondary button text"
            value={content.hero_secondary_button || ''}
            onChange={(e)=>
              setContent({
                ...content,
                hero_secondary_button:e.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="hero-image">
            Hero banner image
          </label>
          <label htmlFor="hero-image" style={styles.uploadBox}>
            <span style={styles.uploadTitle}>
              Upload image from local drive
            </span>
            <span style={styles.uploadText}>
              JPG, PNG, or WebP under 2MB
            </span>
          </label>
          <input
            id="hero-image"
            type="file"
            accept="image/*"
            onChange={uploadHeroImage}
            style={styles.fileInput}
          />

          {content.hero_image && (
            <div style={styles.previewWrap}>
              <img
                src={content.hero_image}
                alt="Hero banner preview"
                style={styles.previewImage}
              />
              <button
                type="button"
                onClick={removeHeroImage}
                style={styles.secondaryButton}
              >
                Remove Image
              </button>
            </div>
          )}

          <label style={styles.label} htmlFor="hero-illustration">
            Hero illustration image
          </label>
          <label htmlFor="hero-illustration" style={styles.uploadBox}>
            <span style={styles.uploadTitle}>
              Upload right-side hero image
            </span>
            <span style={styles.uploadText}>
              JPG, PNG, or WebP under 2MB
            </span>
          </label>
          <input
            id="hero-illustration"
            type="file"
            accept="image/*"
            onChange={uploadHeroIllustration}
            style={styles.fileInput}
          />

          {content.hero_illustration && (
            <div style={styles.previewWrap}>
              <img
                src={content.hero_illustration}
                alt="Hero illustration preview"
                style={styles.previewImage}
              />
              <button
                type="button"
                onClick={removeHeroIllustration}
                style={styles.secondaryButton}
              >
                Remove Illustration
              </button>
            </div>
          )}

          <input
            placeholder="Hero image alt text"
            value={content.hero_image_alt || ''}
            onChange={(e)=>
              setContent({
                ...content,
                hero_image_alt:e.target.value
              })
            }
            style={styles.input}
          />

          <JsonField
            id="trust-badges"
            label="Trust badges JSON"
            value={content.trust_badges}
            onChange={(value)=>
              setContent({
                ...content,
                trust_badges:value
              })
            }
          />

          <button
            type="button"
            onClick={saveContent}
            style={styles.primaryButton}
          >
            Save Content
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>SEO</h2>
            <p style={styles.cardText}>
              Configure homepage search and social sharing metadata.
            </p>
          </div>

          <label style={styles.label} htmlFor="seo-title">
            Meta title
          </label>
          <input
            id="seo-title"
            placeholder="Meta title"
            value={content.seo_title || ''}
            onChange={(event)=>
              setContent({
                ...content,
                seo_title:event.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="seo-description">
            Meta description
          </label>
          <textarea
            id="seo-description"
            placeholder="Meta description"
            value={content.seo_description || ''}
            onChange={(event)=>
              setContent({
                ...content,
                seo_description:event.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'110px',
              resize:'vertical'
            }}
          />

          <label style={styles.label} htmlFor="seo-og-image">
            Open Graph image
          </label>
          <input
            placeholder="Open Graph image public URL"
            value={content.seo_og_image || ''}
            onChange={(event)=>
              setContent({
                ...content,
                seo_og_image:event.target.value
              })
            }
            style={styles.input}
          />
          <label htmlFor="seo-og-image" style={styles.uploadBox}>
            <span style={styles.uploadTitle}>
              Upload Open Graph image
            </span>
            <span style={styles.uploadText}>
              Use a public URL for best social sharing support. Uploads are saved as image data.
            </span>
          </label>
          <input
            id="seo-og-image"
            type="file"
            accept="image/*"
            onChange={uploadSeoOgImage}
            style={styles.fileInput}
          />

          {content.seo_og_image && (
            <div style={styles.previewWrap}>
              <img
                src={content.seo_og_image}
                alt="Open Graph preview"
                style={styles.previewImage}
              />
              <button
                type="button"
                onClick={removeSeoOgImage}
                style={styles.secondaryButton}
              >
                Remove Open Graph Image
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={saveContent}
            style={styles.primaryButton}
          >
            Save SEO
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Homepage Sections</h2>
            <p style={styles.cardText}>
              Configure homepage sections. Empty section titles or empty JSON arrays will hide those sections.
            </p>
          </div>

          <label style={styles.label} htmlFor="why-title">
            Why section title
          </label>
          <input
            id="why-title"
            value={content.why_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                why_title:e.target.value
              })
            }
            style={styles.input}
          />
          <JsonField
            id="features-json"
            label="Feature cards JSON"
            value={content.features_json}
            onChange={(value)=>
              setContent({
                ...content,
                features_json:value
              })
            }
          />

          <label style={styles.label} htmlFor="services-title">
            Services section title
          </label>
          <input
            id="services-title"
            value={content.services_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                services_title:e.target.value
              })
            }
            style={styles.input}
          />
          <JsonField
            id="services-json"
            label="Service cards JSON"
            value={content.services_json}
            onChange={(value)=>
              setContent({
                ...content,
                services_json:value
              })
            }
          />

          <label style={styles.label} htmlFor="categories-title">
            Categories section title
          </label>
          <input
            id="categories-title"
            value={content.categories_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                categories_title:e.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="steps-title">
            Timeline section title
          </label>
          <input
            id="steps-title"
            value={content.steps_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                steps_title:e.target.value
              })
            }
            style={styles.input}
          />
          <JsonField
            id="steps-json"
            label="Timeline steps JSON"
            value={content.steps_json}
            onChange={(value)=>
              setContent({
                ...content,
                steps_json:value
              })
            }
          />

          <label style={styles.label} htmlFor="testimonials-title">
            Testimonials section title
          </label>
          <input
            id="testimonials-title"
            value={content.testimonials_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                testimonials_title:e.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="faq-title">
            FAQ section title
          </label>
          <input
            id="faq-title"
            value={content.faq_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                faq_title:e.target.value
              })
            }
            style={styles.input}
          />
          <JsonField
            id="faqs-json"
            label="FAQ JSON"
            value={content.faqs_json}
            onChange={(value)=>
              setContent({
                ...content,
                faqs_json:value
              })
            }
          />

          <label style={styles.label} htmlFor="booking-eyebrow">
            Booking eyebrow
          </label>
          <input
            id="booking-eyebrow"
            value={content.booking_eyebrow || ''}
            onChange={(e)=>
              setContent({
                ...content,
                booking_eyebrow:e.target.value
              })
            }
            style={styles.input}
          />
          <input
            placeholder="Booking title"
            value={content.booking_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                booking_title:e.target.value
              })
            }
            style={styles.input}
          />
          <textarea
            placeholder="Booking description"
            value={content.booking_description || ''}
            onChange={(e)=>
              setContent({
                ...content,
                booking_description:e.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'90px',
              resize:'vertical'
            }}
          />

          <input
            placeholder="CTA title"
            value={content.cta_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                cta_title:e.target.value
              })
            }
            style={styles.input}
          />
          <textarea
            placeholder="CTA description"
            value={content.cta_description || ''}
            onChange={(e)=>
              setContent({
                ...content,
                cta_description:e.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'90px',
              resize:'vertical'
            }}
          />
          <input
            placeholder="CTA button"
            value={content.cta_button || ''}
            onChange={(e)=>
              setContent({
                ...content,
                cta_button:e.target.value
              })
            }
            style={styles.input}
          />

          <input
            placeholder="Footer brand"
            value={content.footer_brand || ''}
            onChange={(e)=>
              setContent({
                ...content,
                footer_brand:e.target.value
              })
            }
            style={styles.input}
          />
          <textarea
            placeholder="Footer description"
            value={content.footer_description || ''}
            onChange={(e)=>
              setContent({
                ...content,
                footer_description:e.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'90px',
              resize:'vertical'
            }}
          />

          <button
            type="button"
            onClick={saveContent}
            style={styles.primaryButton}
          >
            Save Homepage Sections
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Contact Page</h2>
            <p style={styles.cardText}>
              Update the footer contact page details.
            </p>
          </div>

          <label style={styles.label} htmlFor="contact-title">
            Contact title
          </label>
          <input
            id="contact-title"
            placeholder="Contact title"
            value={content.contact_title || ''}
            onChange={(e)=>
              setContent({
                ...content,
                contact_title:e.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="contact-description">
            Contact description
          </label>
          <textarea
            id="contact-description"
            placeholder="Contact description"
            value={content.contact_description || ''}
            onChange={(e)=>
              setContent({
                ...content,
                contact_description:e.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'110px',
              resize:'vertical'
            }}
          />

          <label style={styles.label} htmlFor="contact-phone">
            Phone
          </label>
          <input
            id="contact-phone"
            placeholder="Phone"
            value={content.contact_phone || ''}
            onChange={(e)=>
              setContent({
                ...content,
                contact_phone:e.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            placeholder="Email"
            value={content.contact_email || ''}
            onChange={(e)=>
              setContent({
                ...content,
                contact_email:e.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="contact-address">
            Address
          </label>
          <textarea
            id="contact-address"
            placeholder="Address"
            value={content.contact_address || ''}
            onChange={(e)=>
              setContent({
                ...content,
                contact_address:e.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'90px',
              resize:'vertical'
            }}
          />

          <label style={styles.label} htmlFor="contact-hours">
            Business hours
          </label>
          <input
            id="contact-hours"
            placeholder="Business hours"
            value={content.contact_hours || ''}
            onChange={(e)=>
              setContent({
                ...content,
                contact_hours:e.target.value
              })
            }
            style={styles.input}
          />

          <button
            type="button"
            onClick={saveContent}
            style={styles.primaryButton}
          >
            Save Contact Page
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Categories</h2>
            <p style={styles.cardText}>
              Add consulting categories with dedicated landing pages.
            </p>
          </div>

          <label style={styles.label} htmlFor="new-category">
            New category
          </label>
          <input
            id="new-category"
            placeholder="New category"
            value={newCategory}
            onChange={(e)=>setNewCategory(e.target.value)}
            style={styles.input}
          />

          <button
            type="button"
            onClick={addCategory}
            style={styles.primaryButton}
          >
            Add Category
          </button>

          <div style={styles.categoryList}>
            {categories.length === 0 ? (
              <p style={styles.emptyText}>No categories yet.</p>
            ) : (
              categories.map((item)=>(
                <div key={item.id} style={styles.categoryEditor}>
                  <div style={styles.categoryEditorHeader}>
                    <span style={styles.categoryIcon}>
                      {item.icon || '*'}
                    </span>
                    <strong>{item.title}</strong>
                  </div>

                  <label style={styles.label} htmlFor={`category-icon-${item.id}`}>
                    Icon
                  </label>
                  <input
                    id={`category-icon-${item.id}`}
                    value={item.icon || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'icon',
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />

                  <label style={styles.label} htmlFor={`category-title-${item.id}`}>
                    Card title
                  </label>
                  <input
                    id={`category-title-${item.id}`}
                    value={item.title || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'title',
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />

                  <label style={styles.label} htmlFor={`category-description-${item.id}`}>
                    Card description
                  </label>
                  <textarea
                    id={`category-description-${item.id}`}
                    value={item.description || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'description',
                        event.target.value
                      )
                    }
                    style={{
                      ...styles.input,
                      minHeight:'90px',
                      resize:'vertical'
                    }}
                  />

                  <label style={styles.label} htmlFor={`category-slug-${item.id}`}>
                    Landing page URL slug
                  </label>
                  <input
                    id={`category-slug-${item.id}`}
                    placeholder="career-guidance"
                    value={item.slug || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'slug',
                        slugify(event.target.value)
                      )
                    }
                    style={styles.input}
                  />
                  {item.slug && (
                    <p style={styles.slugPreview}>
                      Public page: /{item.slug}
                    </p>
                  )}

                  <label style={styles.label} htmlFor={`page-title-${item.id}`}>
                    Landing page title
                  </label>
                  <input
                    id={`page-title-${item.id}`}
                    value={item.page_title || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'page_title',
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />

                  <label style={styles.label} htmlFor={`page-content-${item.id}`}>
                    Landing page text
                  </label>
                  <textarea
                    id={`page-content-${item.id}`}
                    value={item.page_content || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'page_content',
                        event.target.value
                      )
                    }
                    style={{
                      ...styles.input,
                      minHeight:'140px',
                      resize:'vertical'
                    }}
                  />

                  <label style={styles.label} htmlFor={`page-image-${item.id}`}>
                    Landing page image
                  </label>
                  <label htmlFor={`page-image-${item.id}`} style={styles.uploadBox}>
                    <span style={styles.uploadTitle}>
                      Upload landing page image
                    </span>
                    <span style={styles.uploadText}>
                      JPG, PNG, or WebP under 2MB
                    </span>
                  </label>
                  <input
                    id={`page-image-${item.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(event)=>uploadCategoryImage(event,item,'page_image')}
                    style={styles.fileInput}
                  />

                  {item.page_image && (
                    <div style={styles.previewWrap}>
                      <img
                        src={item.page_image}
                        alt={`${item.title} landing page preview`}
                        style={styles.previewImage}
                      />
                      <button
                        type="button"
                        onClick={()=>removeCategoryImage(item.id,'page_image')}
                        style={styles.secondaryButton}
                      >
                        Remove Landing Page Image
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={()=>saveCategory(item)}
                    style={styles.primaryButton}
                  >
                    Save Category
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Testimonials</h2>
            <p style={styles.cardText}>
              Add customer reviews shown in the homepage carousel.
            </p>
          </div>

          <label style={styles.label} htmlFor="testimonial-name">
            Customer name
          </label>
          <input
            id="testimonial-name"
            value={newTestimonial.customer_name}
            onChange={(event)=>
              setNewTestimonial({
                ...newTestimonial,
                customer_name:event.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="testimonial-location">
            Location
          </label>
          <input
            id="testimonial-location"
            value={newTestimonial.location}
            onChange={(event)=>
              setNewTestimonial({
                ...newTestimonial,
                location:event.target.value
              })
            }
            style={styles.input}
          />

          <label style={styles.label} htmlFor="testimonial-review">
            Review
          </label>
          <textarea
            id="testimonial-review"
            value={newTestimonial.review}
            onChange={(event)=>
              setNewTestimonial({
                ...newTestimonial,
                review:event.target.value
              })
            }
            style={{
              ...styles.input,
              minHeight:'110px',
              resize:'vertical'
            }}
          />

          <label style={styles.label} htmlFor="testimonial-rating">
            Rating
          </label>
          <select
            id="testimonial-rating"
            value={newTestimonial.rating}
            onChange={(event)=>
              setNewTestimonial({
                ...newTestimonial,
                rating:event.target.value
              })
            }
            style={styles.input}
          >
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <button
            type="button"
            onClick={addTestimonial}
            style={styles.primaryButton}
          >
            Add Testimonial
          </button>

          <div style={styles.categoryList}>
            {testimonials.length === 0 ? (
              <p style={styles.emptyText}>No testimonials yet.</p>
            ) : (
              testimonials.map((testimonial)=>(
                <div key={testimonial.id} style={styles.categoryEditor}>
                  <div style={styles.categoryEditorHeader}>
                    <strong>{testimonial.customer_name}</strong>
                    <span style={styles.testimonialStatus}>
                      {testimonial.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p style={styles.cardText}>{testimonial.review}</p>
                  <p style={styles.emptyText}>
                    {testimonial.location} · {testimonial.rating || 5} stars
                  </p>
                  <div style={styles.rowActions}>
                    <button
                      type="button"
                      onClick={()=>toggleTestimonial(testimonial)}
                      style={styles.secondaryButton}
                    >
                      {testimonial.is_active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={()=>deleteTestimonial(testimonial.id)}
                      style={styles.dangerButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {message && (
        <p style={styles.message}>
          {message}
        </p>
      )}
    </main>
  )
}

function slugify(value){
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
}

function JsonField({ id,label,value,onChange }){
  return(
    <>
      <label style={styles.label} htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={formatJsonForEdit(value)}
        onChange={(event)=>onChange(event.target.value)}
        style={{
          ...styles.input,
          minHeight:'170px',
          resize:'vertical',
          fontFamily:'Consolas,monospace',
          fontSize:'13px'
        }}
      />
    </>
  )
}

function formatJsonForEdit(value){
  if(!value){
    return '[]'
  }

  if(typeof value === 'string'){
    try {
      return JSON.stringify(JSON.parse(value),null,2)
    } catch (_error) {
      return value
    }
  }

  return JSON.stringify(value,null,2)
}

function normalizeJsonField(value){
  if(Array.isArray(value)){
    return value
  }

  if(!value){
    return []
  }

  if(typeof value !== 'string'){
    return value
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (_error) {
    return []
  }
}

const styles = {
  page:{
    minHeight:'100vh',
    padding:'24px',
    background:'#f3f6fb',
    fontFamily:'Inter,Arial,sans-serif'
  },
  loadingPage:{
    minHeight:'100vh',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    padding:'24px',
    background:'#f3f6fb',
    fontFamily:'Inter,Arial,sans-serif'
  },
  loadingCard:{
    width:'100%',
    maxWidth:'360px',
    padding:'22px',
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'16px',
    boxShadow:'0 18px 50px rgba(15,23,42,0.10)',
    color:'#334155',
    textAlign:'center',
    fontWeight:700
  },
  redirectText:{
    color:'#334155',
    fontSize:'15px',
    lineHeight:1.5,
    marginBottom:'16px'
  },
  header:{
    width:'100%',
    maxWidth:'1120px',
    margin:'0 auto 24px',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    gap:'16px',
    flexWrap:'wrap'
  },
  eyebrow:{
    color:'#2563eb',
    fontSize:'13px',
    fontWeight:800,
    letterSpacing:'0',
    textTransform:'uppercase',
    marginBottom:'8px'
  },
  title:{
    color:'#0f172a',
    fontSize:'clamp(28px,4vw,42px)',
    lineHeight:1.1
  },
  logoutButton:{
    minHeight:'44px',
    padding:'0 18px',
    border:'1px solid #cbd5e1',
    borderRadius:'12px',
    background:'#ffffff',
    color:'#0f172a',
    fontWeight:800,
    cursor:'pointer'
  },
  headerActions:{
    display:'flex',
    alignItems:'center',
    gap:'10px',
    flexWrap:'wrap'
  },
  navButton:{
    minHeight:'44px',
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    padding:'0 18px',
    border:'none',
    borderRadius:'12px',
    background:'#2563eb',
    color:'#ffffff',
    fontWeight:800,
    textDecoration:'none'
  },
  grid:{
    width:'100%',
    maxWidth:'1120px',
    margin:'0 auto',
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
    gap:'20px',
    alignItems:'start'
  },
  card:{
    background:'#ffffff',
    padding:'22px',
    borderRadius:'18px',
    border:'1px solid #e5e7eb',
    boxShadow:'0 18px 50px rgba(15,23,42,0.08)'
  },
  cardHeader:{
    marginBottom:'20px'
  },
  cardTitle:{
    color:'#0f172a',
    fontSize:'22px',
    lineHeight:1.2,
    marginBottom:'8px'
  },
  cardText:{
    color:'#64748b',
    fontSize:'14px',
    lineHeight:1.6
  },
  label:{
    display:'block',
    color:'#334155',
    fontSize:'14px',
    fontWeight:800,
    marginBottom:'8px'
  },
  input:{
    width:'100%',
    minHeight:'48px',
    padding:'12px 14px',
    margin:'0 0 16px',
    border:'1px solid #cbd5e1',
    borderRadius:'12px',
    color:'#0f172a',
    background:'#ffffff',
    fontSize:'16px',
    outlineColor:'#2563eb'
  },
  primaryButton:{
    width:'100%',
    minHeight:'48px',
    border:'none',
    borderRadius:'12px',
    background:'#2563eb',
    color:'#ffffff',
    fontSize:'15px',
    fontWeight:800,
    cursor:'pointer'
  },
  secondaryButton:{
    width:'100%',
    minHeight:'44px',
    border:'1px solid #cbd5e1',
    borderRadius:'12px',
    background:'#ffffff',
    color:'#0f172a',
    fontSize:'14px',
    fontWeight:800,
    cursor:'pointer'
  },
  uploadBox:{
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    minHeight:'120px',
    padding:'18px',
    marginBottom:'16px',
    border:'1px dashed #94a3b8',
    borderRadius:'14px',
    background:'#f8fafc',
    cursor:'pointer',
    textAlign:'center'
  },
  uploadTitle:{
    color:'#0f172a',
    fontSize:'15px',
    fontWeight:800,
    marginBottom:'6px'
  },
  uploadText:{
    color:'#64748b',
    fontSize:'13px',
    lineHeight:1.5
  },
  fileInput:{
    position:'absolute',
    width:'1px',
    height:'1px',
    padding:0,
    margin:'-1px',
    overflow:'hidden',
    clip:'rect(0,0,0,0)',
    whiteSpace:'nowrap',
    border:0
  },
  previewWrap:{
    display:'grid',
    gap:'12px',
    marginBottom:'16px'
  },
  previewImage:{
    width:'100%',
    aspectRatio:'16 / 9',
    objectFit:'cover',
    borderRadius:'14px',
    border:'1px solid #e5e7eb',
    background:'#f8fafc'
  },
  categoryList:{
    marginTop:'20px',
    display:'grid',
    gap:'16px'
  },
  categoryEditor:{
    display:'grid',
    gap:'0',
    padding:'16px',
    border:'1px solid #e5e7eb',
    borderRadius:'14px',
    background:'#f8fafc'
  },
  categoryEditorHeader:{
    display:'flex',
    alignItems:'center',
    gap:'10px',
    marginBottom:'16px',
    color:'#0f172a'
  },
  categoryItem:{
    display:'flex',
    alignItems:'center',
    gap:'10px',
    padding:'12px',
    border:'1px solid #e5e7eb',
    borderRadius:'12px',
    color:'#0f172a',
    background:'#f8fafc',
    fontSize:'15px',
    fontWeight:700
  },
  categoryIcon:{
    width:'28px',
    height:'28px',
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:'8px',
    background:'#dbeafe',
    color:'#1d4ed8',
    fontWeight:900
  },
  slugPreview:{
    margin:'-8px 0 16px',
    color:'#64748b',
    fontSize:'13px',
    fontWeight:700
  },
  emptyText:{
    color:'#64748b',
    fontSize:'14px'
  },
  message:{
    width:'100%',
    maxWidth:'1120px',
    margin:'20px auto 0',
    padding:'14px 16px',
    borderRadius:'12px',
    background:'#ecfdf5',
    border:'1px solid #bbf7d0',
    color:'#047857',
    fontWeight:800
  },
  rowActions:{
    display:'grid',
    gridTemplateColumns:'1fr 1fr',
    gap:'10px',
    marginTop:'14px'
  },
  dangerButton:{
    width:'100%',
    minHeight:'44px',
    border:'1px solid #fecaca',
    borderRadius:'12px',
    background:'#fef2f2',
    color:'#b91c1c',
    fontSize:'14px',
    fontWeight:800,
    cursor:'pointer'
  },
  testimonialStatus:{
    marginLeft:'auto',
    padding:'6px 10px',
    borderRadius:'999px',
    background:'#dbeafe',
    color:'#1d4ed8',
    fontSize:'12px',
    fontWeight:900
  }
}

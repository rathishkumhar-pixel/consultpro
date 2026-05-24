'use client'

import { useEffect, useState } from 'react'
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
    contact_title:'',
    contact_description:'',
    contact_phone:'',
    contact_email:'',
    contact_address:'',
    contact_hours:''
  })
  const [categories,setCategories] = useState([])
  const [newCategory,setNewCategory] = useState('')
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
        popup_title:category.popup_title,
        popup_description:category.popup_description,
        popup_image:category.popup_image
      })
      .eq('id', category.id)

    if(error){
      setMessage(`Category update failed: ${error.message}`)
    } else {
      setMessage('Category popup updated')
      loadData()
    }
  }

  function uploadCategoryImage(event,category){
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
      updateCategoryField(category.id,'popup_image',reader.result)
      setMessage('Category image ready. Save category to publish it.')
    }

    reader.onerror = ()=>{
      setMessage('Category image upload failed')
    }

    reader.readAsDataURL(file)
  }

  function removeCategoryImage(categoryId){
    updateCategoryField(categoryId,'popup_image','')
    setMessage('Category image removed. Save category to publish it.')
  }

  function uploadHeroImage(event){
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
        hero_image:reader.result
      }

      setContent(nextContent)
      setMessage('Publishing hero image...')

      await persistContent(
        nextContent,
        'Hero image published to homepage'
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

        <button
          type="button"
          onClick={logout}
          style={styles.logoutButton}
        >
          Logout
        </button>
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
              Add consulting service categories.
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

                  <label style={styles.label} htmlFor={`popup-title-${item.id}`}>
                    Popup title
                  </label>
                  <input
                    id={`popup-title-${item.id}`}
                    value={item.popup_title || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'popup_title',
                        event.target.value
                      )
                    }
                    style={styles.input}
                  />

                  <label style={styles.label} htmlFor={`popup-description-${item.id}`}>
                    Popup text
                  </label>
                  <textarea
                    id={`popup-description-${item.id}`}
                    value={item.popup_description || ''}
                    onChange={(event)=>
                      updateCategoryField(
                        item.id,
                        'popup_description',
                        event.target.value
                      )
                    }
                    style={{
                      ...styles.input,
                      minHeight:'120px',
                      resize:'vertical'
                    }}
                  />

                  <label style={styles.label} htmlFor={`popup-image-${item.id}`}>
                    Popup image
                  </label>
                  <label htmlFor={`popup-image-${item.id}`} style={styles.uploadBox}>
                    <span style={styles.uploadTitle}>
                      Upload popup image
                    </span>
                    <span style={styles.uploadText}>
                      JPG, PNG, or WebP under 2MB
                    </span>
                  </label>
                  <input
                    id={`popup-image-${item.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(event)=>uploadCategoryImage(event,item)}
                    style={styles.fileInput}
                  />

                  {item.popup_image && (
                    <div style={styles.previewWrap}>
                      <img
                        src={item.popup_image}
                        alt={`${item.title} popup preview`}
                        style={styles.previewImage}
                      />
                      <button
                        type="button"
                        onClick={()=>removeCategoryImage(item.id)}
                        style={styles.secondaryButton}
                      >
                        Remove Popup Image
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
      </section>

      {message && (
        <p style={styles.message}>
          {message}
        </p>
      )}
    </main>
  )
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
  }
}

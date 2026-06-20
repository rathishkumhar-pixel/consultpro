'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home({
  initialContent = null,
  initialCategories = [],
  initialTestimonials = []
}) {
  const [content, setContent] = useState(initialContent)
  const [categories, setCategories] = useState(initialCategories)
  const [testimonials, setTestimonials] = useState(initialTestimonials)
  const [openFaq, setOpenFaq] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    booking_date: '',
    slot: '',
    referrer_phone: ''
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')

    if(!category){
      return
    }

    setFormData((current)=>({
      ...current,
      category
    }))

    window.requestAnimationFrame(()=>{
      document
        .getElementById('booking-form')
        ?.scrollIntoView({
          behavior:'smooth',
          block:'start'
        })
    })
  }, [])

  async function loadContent() {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)
      .maybeSingle()

    if(data){
      setContent(data)
    }

    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')

    setCategories(categoryData || [])

    const { data: testimonialData } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at',{ ascending:false })

    setTestimonials(testimonialData || [])
  }

  function scrollToBooking() {
    document
      .getElementById('booking-form')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
  }

  function scrollToHowItWorks() {
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
  }

  async function submitBooking() {
    setMessage('')
    setMessageType('success')

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.category ||
      !formData.booking_date ||
      !formData.slot
    ) {
      setMessageType('error')
      setMessage('Please fill all fields')
      return
    }

    const customerPhone = normalizeIndianMobile(formData.phone)
    const referrerPhone = normalizeIndianMobile(formData.referrer_phone)

    if (!isValidIndianMobile(customerPhone)) {
      setMessageType('error')
      setMessage('Customer mobile number must be a valid Indian number')
      return
    }

    if (formData.referrer_phone && !isValidIndianMobile(referrerPhone)) {
      setMessageType('error')
      setMessage('Referrer mobile number must be a valid Indian number')
      return
    }

    if (referrerPhone && referrerPhone === customerPhone) {
      setMessageType('error')
      setMessage('Referrer mobile number cannot be the same as customer mobile number')
      return
    }

    const selectedDate = new Date(`${formData.booking_date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      setMessageType('error')
      setMessage('Please select a future date')
      return
    }

    const { data,error } = await supabase
      .rpc('create_booking_with_referral',{
        p_name:formData.name.trim(),
        p_phone:customerPhone,
        p_category:formData.category,
        p_booking_date:formData.booking_date,
        p_slot:formData.slot,
        p_referrer_phone:referrerPhone || null
      })

    if (error) {
      setMessageType('error')
      setMessage(getReadableError(error,'Booking failed'))
    } else {
      setMessageType('success')
      setMessage(data?.referral_id
        ? 'Booking successful. Referral created with Pending status.'
        : 'Booking successful')
      setFormData({
        name: '',
        phone: '',
        category: '',
        booking_date: '',
        slot: '',
        referrer_phone: ''
      })
    }
  }

  const trustBadges = parseJsonArray(content?.trust_badges)
  const features = parseJsonArray(content?.features_json)
  const services = parseJsonArray(content?.services_json)
  const steps = parseJsonArray(content?.steps_json)
  const faqs = parseJsonArray(content?.faqs_json)
  const heroMedia = content?.hero_image || content?.hero_illustration

  const hasHero =
    content?.hero_title ||
    content?.hero_description ||
    heroMedia
  const hasFeatures = content?.why_title && features.length > 0
  const hasServices = content?.services_title && services.length > 0
  const hasCategories = content?.categories_title && categories.length > 0
  const hasSteps = content?.steps_title && steps.length > 0
  const hasTestimonials = content?.testimonials_title && testimonials.length > 0
  const hasFaqs = content?.faq_title && faqs.length > 0
  const hasBooking =
    content?.booking_title ||
    content?.booking_description ||
    content?.booking_eyebrow
  const hasCta =
    content?.cta_title ||
    content?.cta_description ||
    content?.cta_button
  const hasFooter =
    content?.footer_brand ||
    content?.footer_description

  return (
    <main style={styles.page}>
      {hasHero && (
        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            {content?.hero_eyebrow && (
              <p style={styles.eyebrow}>{content.hero_eyebrow}</p>
            )}
            {content?.hero_title && (
              <h1 style={styles.heroTitle}>{content.hero_title}</h1>
            )}
            {content?.hero_description && (
              <p style={styles.heroText}>{content.hero_description}</p>
            )}

            {(content?.hero_button || content?.hero_secondary_button) && (
              <div style={styles.heroActions}>
                {content?.hero_button && hasBooking && (
                  <button type="button" onClick={scrollToBooking} style={styles.primaryButton}>
                    {content.hero_button}
                  </button>
                )}
                {content?.hero_secondary_button && hasSteps && (
                  <button type="button" onClick={scrollToHowItWorks} style={styles.secondaryButton}>
                    {content.hero_secondary_button}
                  </button>
                )}
              </div>
            )}

            {trustBadges.length > 0 && (
              <div style={styles.badgeGrid}>
                {trustBadges.map((badge)=>(
                  <span key={badge} style={styles.badge}>{badge}</span>
                ))}
              </div>
            )}
          </div>

          {heroMedia && (
            <div style={styles.heroVisual}>
              <img
                src={heroMedia}
                alt={content.hero_image_alt || 'Consulting illustration'}
                style={styles.heroImage}
              />
            </div>
          )}
        </section>
      )}

      {hasFeatures && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{content.why_title}</h2>
          <div style={styles.featureGrid}>
            {features.map((feature)=>(
              <article key={feature.title} style={styles.featureCard}>
                <h3 style={styles.cardTitle}>{feature.title}</h3>
                <p style={styles.mutedText}>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasServices && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{content.services_title}</h2>
          <div style={styles.serviceGrid}>
            {services.map((service)=>(
              <article key={service.title} style={styles.serviceCard}>
                {service.image ? (
                  <img src={service.image} alt={service.title} style={styles.serviceImage} />
                ) : (
                  <span style={styles.serviceIcon}>{service.icon || 'RV'}</span>
                )}
                <h3 style={styles.cardTitle}>{service.title}</h3>
                <p style={styles.mutedText}>{service.description}</p>
                {hasBooking && (
                  <button
                    type="button"
                    onClick={()=>{
                      setFormData({
                        ...formData,
                        category:service.title
                      })
                      scrollToBooking()
                    }}
                    style={styles.cardButton}
                  >
                    {service.button || 'Book Now'}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {hasCategories && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{content.categories_title}</h2>
          <div style={styles.categoryGrid}>
            {categories.map((item) => (
              item.slug ? (
                <Link
                  key={item.id}
                  href={`/${item.slug}`}
                  style={styles.categoryCard}
                >
                  <h3 style={styles.cardTitle}>{item.icon} {item.title}</h3>
                  <p style={styles.mutedText}>{item.description}</p>
                </Link>
              ) : (
                <div key={item.id} style={styles.categoryCard}>
                  <h3 style={styles.cardTitle}>{item.icon} {item.title}</h3>
                  <p style={styles.mutedText}>{item.description}</p>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {hasSteps && (
        <section id="how-it-works" style={styles.section}>
          <h2 style={styles.sectionTitle}>{content.steps_title}</h2>
          <div style={styles.timeline}>
            {steps.map((step)=>(
              <article key={`${step.step}-${step.title}`} style={styles.stepCard}>
                <span style={styles.stepLabel}>{step.step}</span>
                <strong style={styles.stepTitle}>{step.title}</strong>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasTestimonials && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{content.testimonials_title}</h2>
          <div style={styles.testimonialScroller}>
            {testimonials.map((testimonial)=>(
              <article key={testimonial.id} style={styles.testimonialCard}>
                <div style={styles.rating}>{'*'.repeat(Number(testimonial.rating || 5))}</div>
                <p style={styles.reviewText}>{testimonial.review}</p>
                <strong style={styles.customerName}>{testimonial.customer_name}</strong>
                <span style={styles.location}>{testimonial.location}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasFaqs && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{content.faq_title}</h2>
          <div style={styles.accordion}>
            {faqs.map((faq,index)=>(
              <article key={faq.question} style={styles.faqItem}>
                <button
                  type="button"
                  onClick={()=>setOpenFaq(openFaq === index ? -1 : index)}
                  style={styles.faqQuestion}
                >
                  <span>{faq.question}</span>
                  <strong>{openFaq === index ? '-' : '+'}</strong>
                </button>
                {openFaq === index && (
                  <p style={styles.faqAnswer}>{faq.answer}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {hasBooking && (
        <section id="booking-form" style={styles.bookingSection}>
          <div>
            {content?.booking_eyebrow && (
              <p style={styles.eyebrow}>{content.booking_eyebrow}</p>
            )}
            {content?.booking_title && (
              <h2 style={styles.sectionTitle}>{content.booking_title}</h2>
            )}
            {content?.booking_description && (
              <p style={styles.mutedText}>{content.booking_description}</p>
            )}
          </div>

          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value
                })
              }
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value.replace(/\D/g, '')
                })
              }
              inputMode="numeric"
              pattern="[0-9]*"
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Referred By Mobile Number (optional)"
              value={formData.referrer_phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  referrer_phone: e.target.value.replace(/\D/g, '')
                })
              }
              inputMode="numeric"
              pattern="[0-9]*"
              style={styles.input}
            />

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value
                })
              }
              style={styles.input}
            >
              <option value="">Select Category</option>
              {[...services.map((item)=>item.title), ...categories.map((item)=>item.title)]
                .filter((value,index,array)=>value && array.indexOf(value) === index)
                .map((title)=>(
                  <option key={title} value={title}>{title}</option>
                ))}
            </select>

            <input
              type="date"
              value={formData.booking_date}
              min={getTomorrowDate()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  booking_date: e.target.value
                })
              }
              style={styles.input}
            />

            <select
              value={formData.slot}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slot: e.target.value
                })
              }
              style={styles.input}
            >
              <option value="">Select Time Slot</option>
              <option>09:00 AM</option>
              <option>09:30 AM</option>
              <option>10:00 AM</option>
              <option>10:30 AM</option>
              <option>11:00 AM</option>
              <option>11:30 AM</option>
              <option>12:00 PM</option>
              <option>12:30 PM</option>
              <option>01:00 PM</option>
              <option>01:30 PM</option>
              <option>02:00 PM</option>
              <option>02:30 PM</option>
              <option>03:00 PM</option>
              <option>03:30 PM</option>
              <option>04:00 PM</option>
              <option>04:30 PM</option>
            </select>

            <button type="button" onClick={submitBooking} style={styles.formButton}>
              Confirm Booking
            </button>

            {message && (
              <p style={messageType === 'error' ? styles.formError : styles.formMessage}>
                {message}
              </p>
            )}
          </div>
        </section>
      )}

      {hasCta && (
        <section style={styles.ctaBanner}>
          {content?.cta_title && <h2 style={styles.ctaTitle}>{content.cta_title}</h2>}
          {content?.cta_description && <p style={styles.ctaText}>{content.cta_description}</p>}
          {content?.cta_button && hasBooking && (
            <button type="button" onClick={scrollToBooking} style={styles.ctaButton}>
              {content.cta_button}
            </button>
          )}
        </section>
      )}

      {hasFooter && (
        <footer style={styles.footer}>
          <div>
            {content?.footer_brand && (
              <strong style={styles.footerBrand}>{content.footer_brand}</strong>
            )}
            {content?.footer_description && (
              <p style={styles.footerText}>{content.footer_description}</p>
            )}
          </div>
          <Link href="/contact" style={styles.footerLink}>
            Contact Us
          </Link>
        </footer>
      )}
    </main>
  )
}

function parseJsonArray(value){
  if(Array.isArray(value)){
    return value
  }

  if(!value){
    return []
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (_error) {
    return []
  }
}

function normalizeIndianMobile(value){
  let digits = String(value || '').replace(/\D/g,'')

  if(digits.length === 12 && digits.startsWith('91')){
    digits = digits.slice(2)
  }

  return digits
}

function isValidIndianMobile(value){
  return /^[6-9][0-9]{9}$/.test(value)
}

function getReadableError(error,fallback){
  const message = error?.message || fallback
  return message.replace(/^Error:\s*/,'')
}

function getTomorrowDate(){
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const year = tomorrow.getFullYear()
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
  const day = String(tomorrow.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const styles = {
  page:{
    minHeight:'100vh',
    background:'#f5f7fb',
    padding:'clamp(16px,3vw,32px)',
    fontFamily:'Arial,sans-serif',
    color:'#111827'
  },
  hero:{
    minHeight:'calc(100vh - 64px)',
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,420px),1fr))',
    alignItems:'center',
    gap:'clamp(32px,5vw,72px)',
    maxWidth:'1240px',
    margin:'0 auto',
    padding:'18px 0 68px'
  },
  heroCopy:{
    maxWidth:'640px',
    alignSelf:'center'
  },
  eyebrow:{
    color:'#2563eb',
    fontSize:'13px',
    fontWeight:800,
    textTransform:'uppercase',
    marginBottom:'12px'
  },
  heroTitle:{
    fontSize:'clamp(42px,5.5vw,78px)',
    lineHeight:1.05,
    marginBottom:'20px',
    color:'#0f172a'
  },
  heroText:{
    color:'#475569',
    fontSize:'clamp(17px,2vw,20px)',
    lineHeight:1.7,
    marginBottom:'28px',
    maxWidth:'680px'
  },
  heroActions:{
    display:'flex',
    gap:'12px',
    flexWrap:'wrap',
    marginBottom:'28px'
  },
  primaryButton:{
    minHeight:'48px',
    padding:'0 20px',
    border:'none',
    borderRadius:'12px',
    background:'#2563eb',
    color:'#ffffff',
    fontSize:'15px',
    fontWeight:800,
    cursor:'pointer'
  },
  secondaryButton:{
    minHeight:'48px',
    padding:'0 20px',
    border:'1px solid #cbd5e1',
    borderRadius:'12px',
    background:'#ffffff',
    color:'#0f172a',
    fontSize:'15px',
    fontWeight:800,
    cursor:'pointer'
  },
  badgeGrid:{
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',
    gap:'12px',
    maxWidth:'620px',
    marginTop:'4px'
  },
  badge:{
    minHeight:'56px',
    display:'flex',
    alignItems:'center',
    padding:'12px 14px',
    borderRadius:'12px',
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    color:'#334155',
    fontSize:'14px',
    fontWeight:800
  },
  heroVisual:{
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    minWidth:0
  },
  heroImage:{
    width:'100%',
    maxWidth:'680px',
    minHeight:'clamp(320px,38vw,500px)',
    aspectRatio:'16 / 11',
    objectFit:'cover',
    borderRadius:'28px',
    boxShadow:'0 30px 90px rgba(15,23,42,0.20)'
  },
  section:{
    maxWidth:'1180px',
    margin:'0 auto',
    padding:'56px 0'
  },
  sectionTitle:{
    fontSize:'clamp(30px,4vw,46px)',
    lineHeight:1.08,
    color:'#0f172a',
    marginBottom:'24px'
  },
  featureGrid:{
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',
    gap:'18px'
  },
  featureCard:{
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'18px',
    padding:'24px',
    boxShadow:'0 12px 34px rgba(15,23,42,0.06)'
  },
  cardTitle:{
    fontSize:'20px',
    lineHeight:1.25,
    color:'#0f172a',
    marginBottom:'10px'
  },
  mutedText:{
    color:'#64748b',
    fontSize:'15px',
    lineHeight:1.65
  },
  serviceGrid:{
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',
    gap:'18px'
  },
  serviceCard:{
    minHeight:'250px',
    display:'flex',
    flexDirection:'column',
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'18px',
    padding:'24px',
    boxShadow:'0 12px 34px rgba(15,23,42,0.06)'
  },
  serviceIcon:{
    width:'46px',
    height:'46px',
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    borderRadius:'14px',
    background:'#dbeafe',
    color:'#1d4ed8',
    fontSize:'15px',
    fontWeight:900,
    marginBottom:'16px'
  },
  serviceImage:{
    width:'100%',
    aspectRatio:'16 / 10',
    objectFit:'cover',
    borderRadius:'14px',
    marginBottom:'18px',
    background:'#e5e7eb'
  },
  cardButton:{
    marginTop:'auto',
    minHeight:'44px',
    border:'none',
    borderRadius:'12px',
    background:'#eff6ff',
    color:'#1d4ed8',
    fontWeight:800,
    cursor:'pointer'
  },
  categoryGrid:{
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',
    gap:'18px'
  },
  categoryCard:{
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'18px',
    padding:'24px',
    boxShadow:'0 12px 34px rgba(15,23,42,0.06)',
    cursor:'pointer',
    textDecoration:'none',
    color:'inherit',
    display:'block'
  },
  timeline:{
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',
    gap:'14px'
  },
  stepCard:{
    padding:'22px',
    borderRadius:'18px',
    background:'#0f172a',
    color:'#ffffff'
  },
  stepLabel:{
    display:'block',
    color:'#93c5fd',
    fontSize:'13px',
    fontWeight:800,
    marginBottom:'10px'
  },
  stepTitle:{
    fontSize:'19px',
    lineHeight:1.3
  },
  testimonialScroller:{
    display:'grid',
    gridAutoFlow:'column',
    gridAutoColumns:'minmax(280px,360px)',
    gap:'18px',
    overflowX:'auto',
    paddingBottom:'8px',
    scrollSnapType:'x mandatory'
  },
  testimonialCard:{
    scrollSnapAlign:'start',
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'18px',
    padding:'24px',
    boxShadow:'0 12px 34px rgba(15,23,42,0.06)'
  },
  rating:{
    color:'#f59e0b',
    fontSize:'18px',
    marginBottom:'14px'
  },
  reviewText:{
    color:'#334155',
    fontSize:'16px',
    lineHeight:1.7,
    marginBottom:'18px'
  },
  customerName:{
    display:'block',
    color:'#0f172a',
    fontSize:'16px',
    marginBottom:'4px'
  },
  location:{
    color:'#64748b',
    fontSize:'14px'
  },
  accordion:{
    display:'grid',
    gap:'12px'
  },
  faqItem:{
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'16px',
    overflow:'hidden'
  },
  faqQuestion:{
    width:'100%',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    gap:'16px',
    padding:'18px',
    border:'none',
    background:'#ffffff',
    color:'#0f172a',
    fontSize:'16px',
    fontWeight:800,
    textAlign:'left',
    cursor:'pointer'
  },
  faqAnswer:{
    color:'#64748b',
    fontSize:'15px',
    lineHeight:1.7,
    padding:'0 18px 18px'
  },
  bookingSection:{
    maxWidth:'1180px',
    margin:'56px auto 0',
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',
    gap:'clamp(28px,4vw,48px)',
    alignItems:'start',
    background:'#ffffff',
    padding:'32px',
    borderRadius:'22px',
    border:'1px solid #e5e7eb',
    boxShadow:'0 18px 50px rgba(15,23,42,0.08)'
  },
  formGrid:{
    display:'grid',
    gap:'14px'
  },
  input:{
    width:'100%',
    minHeight:'48px',
    padding:'12px 14px',
    borderRadius:'12px',
    border:'1px solid #d1d5db',
    fontSize:'15px',
    background:'#ffffff'
  },
  formButton:{
    minHeight:'50px',
    border:'none',
    borderRadius:'12px',
    background:'#2563eb',
    color:'#ffffff',
    cursor:'pointer',
    fontSize:'16px',
    fontWeight:800
  },
  formMessage:{
    color:'#16a34a',
    fontWeight:800
  },
  formError:{
    color:'#dc2626',
    fontWeight:800
  },
  ctaBanner:{
    maxWidth:'1180px',
    margin:'56px auto 0',
    padding:'44px 28px',
    borderRadius:'24px',
    background:'#111827',
    color:'#ffffff',
    textAlign:'center'
  },
  ctaTitle:{
    fontSize:'clamp(32px,5vw,54px)',
    lineHeight:1.05,
    marginBottom:'16px'
  },
  ctaText:{
    maxWidth:'680px',
    margin:'0 auto 24px',
    color:'#d1d5db',
    fontSize:'18px',
    lineHeight:1.6
  },
  ctaButton:{
    minHeight:'50px',
    padding:'0 22px',
    border:'none',
    borderRadius:'12px',
    background:'#ffffff',
    color:'#111827',
    fontSize:'16px',
    fontWeight:900,
    cursor:'pointer'
  },
  footer:{
    maxWidth:'1180px',
    margin:'56px auto 0',
    padding:'24px',
    borderRadius:'18px',
    background:'#ffffff',
    color:'#111827',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    gap:'18px',
    flexWrap:'wrap',
    border:'1px solid #e5e7eb'
  },
  footerBrand:{
    display:'block',
    fontSize:'20px',
    marginBottom:'6px'
  },
  footerText:{
    color:'#64748b',
    fontSize:'14px',
    lineHeight:1.5
  },
  footerLink:{
    color:'#111827',
    textDecoration:'none',
    border:'1px solid #d1d5db',
    borderRadius:'12px',
    padding:'12px 16px',
    fontWeight:800
  },
  modalOverlay:{
    position:'fixed',
    inset:0,
    zIndex:1000,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    padding:'20px',
    background:'rgba(15,23,42,0.62)'
  },
  modal:{
    position:'relative',
    width:'100%',
    maxWidth:'560px',
    maxHeight:'88vh',
    overflow:'auto',
    background:'#ffffff',
    borderRadius:'18px',
    boxShadow:'0 28px 80px rgba(15,23,42,0.28)'
  },
  closeButton:{
    position:'absolute',
    top:'12px',
    right:'12px',
    zIndex:2,
    width:'40px',
    height:'40px',
    border:'none',
    borderRadius:'999px',
    background:'#ffffff',
    color:'#111827',
    fontSize:'22px',
    lineHeight:1,
    cursor:'pointer',
    boxShadow:'0 8px 24px rgba(15,23,42,0.16)'
  },
  modalImage:{
    width:'100%',
    aspectRatio:'16 / 9',
    objectFit:'cover',
    background:'#e5e7eb'
  },
  modalContent:{
    padding:'24px'
  },
  modalTitle:{
    color:'#111827',
    fontSize:'28px',
    lineHeight:1.2,
    marginBottom:'12px'
  },
  modalText:{
    color:'#4b5563',
    fontSize:'16px',
    lineHeight:1.7,
    whiteSpace:'pre-wrap'
  }
}

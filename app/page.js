'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [content, setContent] = useState(null)
  const [categories, setCategories] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [openFaq, setOpenFaq] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    booking_date: '',
    slot: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)
      .single()

    setContent(data)

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
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.category ||
      !formData.booking_date ||
      !formData.slot
    ) {
      setMessage('Please fill all fields')
      return
    }

    if (!/^[0-9]+$/.test(formData.phone)) {
      setMessage('Phone number must contain only numbers')
      return
    }

    const selectedDate = new Date(`${formData.booking_date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      setMessage('Please select a future date')
      return
    }

    const { error } = await supabase
      .from('bookings')
      .insert([{
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone.trim()
      }])

    if (error) {
      setMessage('Booking failed')
    } else {
      setMessage('Booking successful')
      setFormData({
        name: '',
        phone: '',
        category: '',
        booking_date: '',
        slot: ''
      })
    }
  }

  const trustBadges = parseJsonArray(content?.trust_badges)
  const features = parseJsonArray(content?.features_json)
  const services = parseJsonArray(content?.services_json)
  const steps = parseJsonArray(content?.steps_json)
  const faqs = parseJsonArray(content?.faqs_json)

  const hasHero =
    content?.hero_title ||
    content?.hero_description ||
    content?.hero_image ||
    content?.hero_illustration
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
                  <span key={badge} style={styles.badge}>OK {badge}</span>
                ))}
              </div>
            )}
          </div>

          {(content?.hero_illustration || content?.hero_image) && (
            <div style={styles.heroVisual}>
              <img
                src={content.hero_illustration || content.hero_image}
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
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCategory(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedCategory(item)
                  }
                }}
                style={styles.categoryCard}
              >
                <h3 style={styles.cardTitle}>{item.icon} {item.title}</h3>
                <p style={styles.mutedText}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {selectedCategory && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCategory(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={selectedCategory.popup_title || selectedCategory.title}
            style={styles.modal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close category details"
              onClick={() => setSelectedCategory(null)}
              style={styles.closeButton}
            >
              x
            </button>

            {selectedCategory.popup_image && (
              <img
                src={selectedCategory.popup_image}
                alt={selectedCategory.popup_title || selectedCategory.title}
                style={styles.modalImage}
              />
            )}

            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>
                {selectedCategory.popup_title || selectedCategory.title}
              </h2>
              <p style={styles.modalText}>
                {selectedCategory.popup_description || selectedCategory.description}
              </p>
            </div>
          </section>
        </div>
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

            {message && <p style={styles.formMessage}>{message}</p>}
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
    padding:'20px',
    fontFamily:'Arial,sans-serif',
    color:'#111827'
  },
  hero:{
    minHeight:'calc(100vh - 40px)',
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',
    alignItems:'center',
    gap:'32px',
    maxWidth:'1180px',
    margin:'0 auto',
    padding:'48px 0'
  },
  heroCopy:{
    maxWidth:'620px'
  },
  eyebrow:{
    color:'#2563eb',
    fontSize:'13px',
    fontWeight:800,
    textTransform:'uppercase',
    marginBottom:'12px'
  },
  heroTitle:{
    fontSize:'clamp(44px,7vw,78px)',
    lineHeight:1,
    marginBottom:'22px',
    color:'#0f172a'
  },
  heroText:{
    color:'#475569',
    fontSize:'19px',
    lineHeight:1.7,
    marginBottom:'28px'
  },
  heroActions:{
    display:'flex',
    gap:'12px',
    flexWrap:'wrap',
    marginBottom:'26px'
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
    gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',
    gap:'10px',
    maxWidth:'520px'
  },
  badge:{
    padding:'10px 12px',
    borderRadius:'12px',
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    color:'#334155',
    fontSize:'14px',
    fontWeight:800
  },
  heroVisual:{
    display:'flex',
    justifyContent:'center'
  },
  heroImage:{
    width:'100%',
    maxWidth:'520px',
    borderRadius:'24px',
    boxShadow:'0 24px 70px rgba(15,23,42,0.16)'
  },
  section:{
    maxWidth:'1180px',
    margin:'0 auto',
    padding:'54px 0'
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
    aspectRatio:'16 / 9',
    objectFit:'cover',
    borderRadius:'14px',
    marginBottom:'16px',
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
    cursor:'pointer'
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
    margin:'54px auto 0',
    display:'grid',
    gridTemplateColumns:'minmax(0,0.85fr) minmax(280px,1.15fr)',
    gap:'24px',
    background:'#ffffff',
    padding:'28px',
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

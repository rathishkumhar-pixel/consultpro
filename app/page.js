'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {

  const [content, setContent] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

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
  }

  function scrollToBooking() {
    document
      .getElementById('booking-form')
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

  return (

    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '20px',
        fontFamily: 'Arial'
      }}
    >

      {/* HERO SECTION */}

      <section style={heroSectionStyle(content?.hero_image)}>
        {content?.hero_image && (
          <img
            src={content.hero_image}
            alt="ConsultPro hero banner"
            style={heroImageStyle}
          />
        )}

        <div style={heroOverlayStyle(content?.hero_image)}>

        <h1
          style={{
            fontSize: '42px',
            marginBottom: '20px',
            color: content?.hero_image ? '#ffffff' : '#111827'
          }}
        >
          {content?.hero_title || 'ConsultPro'}
        </h1>

        <p
          style={{
            maxWidth: '700px',
            margin: 'auto',
            color: content?.hero_image ? '#e5e7eb' : '#6b7280',
            fontSize: '18px',
            lineHeight: '1.6'
          }}
        >
          {content?.hero_description}
        </p>

        <button
          type="button"
          onClick={scrollToBooking}
          style={{
            marginTop: '30px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          {content?.hero_button || 'Book Now'}
        </button>

        </div>

      </section>

      {/* CATEGORIES */}

      <section
        style={{
          marginTop: '40px'
        }}
      >

        <h2
          style={{
            marginBottom: '20px',
            color: '#111827'
          }}
        >
          Consultation Categories
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: '20px'
          }}
        >

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
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                border: '1px solid #e5e7eb'
              }}
            >

              <h3
                style={{
                  marginBottom: '10px'
                }}
              >
                {item.icon} {item.title}
              </h3>

              <p
                style={{
                  color: '#6b7280'
                }}
              >
                {item.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {selectedCategory && (
        <div style={modalOverlayStyle} onClick={() => setSelectedCategory(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={selectedCategory.popup_title || selectedCategory.title}
            style={modalStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close category details"
              onClick={() => setSelectedCategory(null)}
              style={closeButtonStyle}
            >
              x
            </button>

            {selectedCategory.popup_image && (
              <img
                src={selectedCategory.popup_image}
                alt={selectedCategory.popup_title || selectedCategory.title}
                style={modalImageStyle}
              />
            )}

            <div style={modalContentStyle}>
              <h2 style={modalTitleStyle}>
                {selectedCategory.popup_title || selectedCategory.title}
              </h2>
              <p style={modalTextStyle}>
                {selectedCategory.popup_description || selectedCategory.description}
              </p>
            </div>
          </section>
        </div>
      )}

      {/* BOOKING FORM */}

      <section
        id="booking-form"
        style={{
          marginTop: '60px',
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}
      >

        <h2
          style={{
            marginBottom: '20px'
          }}
        >
          Book Consultation
        </h2>

        <div
          style={{
            display: 'grid',
            gap: '16px'
          }}
        >

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
            style={inputStyle}
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
            style={inputStyle}
          />

          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value
              })
            }
            style={inputStyle}
          >

            <option value="">
              Select Category
            </option>

            {categories.map((item) => (
              <option
                key={item.id}
                value={item.title}
              >
                {item.title}
              </option>
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
            style={inputStyle}
          />

          <select
            value={formData.slot}
            onChange={(e) =>
              setFormData({
                ...formData,
                slot: e.target.value
              })
            }
            style={inputStyle}
          >

            <option value="">
              Select Time Slot
            </option>

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

          <button
            type="button"
            onClick={submitBooking}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Confirm Booking
          </button>

          <p
            style={{
              color: '#16a34a'
            }}
          >
            {message}
          </p>

        </div>

      </section>

    </main>

  )
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid #d1d5db',
  fontSize: '15px'
}

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  background: 'rgba(15,23,42,0.62)'
}

const modalStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '560px',
  maxHeight: '88vh',
  overflow: 'auto',
  background: '#ffffff',
  borderRadius: '18px',
  boxShadow: '0 28px 80px rgba(15,23,42,0.28)'
}

const closeButtonStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  zIndex: 2,
  width: '40px',
  height: '40px',
  border: 'none',
  borderRadius: '999px',
  background: '#ffffff',
  color: '#111827',
  fontSize: '22px',
  lineHeight: 1,
  cursor: 'pointer',
  boxShadow: '0 8px 24px rgba(15,23,42,0.16)'
}

const modalImageStyle = {
  width: '100%',
  aspectRatio: '16 / 9',
  objectFit: 'cover',
  background: '#e5e7eb'
}

const modalContentStyle = {
  padding: '24px'
}

const modalTitleStyle = {
  color: '#111827',
  fontSize: '28px',
  lineHeight: 1.2,
  marginBottom: '12px'
}

const modalTextStyle = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap'
}

function heroSectionStyle(hasImage){
  return {
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
    minHeight: hasImage ? '420px' : 'auto',
    padding: hasImage ? '0' : '60px 20px',
    borderRadius: hasImage ? '24px' : '0',
    background: hasImage ? '#111827' : 'transparent'
  }
}

const heroImageStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover'
}

function heroOverlayStyle(hasImage){
  return {
    position: 'relative',
    zIndex: 1,
    minHeight: hasImage ? '420px' : 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: hasImage ? '72px 20px' : '0',
    background: hasImage
      ? 'linear-gradient(90deg,rgba(15,23,42,0.82),rgba(15,23,42,0.42))'
      : 'transparent'
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

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {

  const [content, setContent] = useState(null)
  const [categories, setCategories] = useState([])

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

  async function submitBooking() {

    if (
      !formData.name ||
      !formData.phone ||
      !formData.category ||
      !formData.booking_date ||
      !formData.slot
    ) {
      setMessage('Please fill all fields')
      return
    }

    const { error } = await supabase
      .from('bookings')
      .insert([formData])

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

      <section
        style={{
          textAlign: 'center',
          padding: '60px 20px'
        }}
      >

        <h1
          style={{
            fontSize: '42px',
            marginBottom: '20px',
            color: '#111827'
          }}
        >
          {content?.hero_title || 'ConsultPro'}
        </h1>

        <p
          style={{
            maxWidth: '700px',
            margin: 'auto',
            color: '#6b7280',
            fontSize: '18px',
            lineHeight: '1.6'
          }}
        >
          {content?.hero_description}
        </p>

        <button
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
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
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

      {/* BOOKING FORM */}

      <section
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
                phone: e.target.value
              })
            }
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
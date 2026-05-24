
'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home(){

  const [form,setForm] = useState({
    name:'',
    phone:'',
    category:'IT Career Advice',
    booking_date:'',
    slot:''
  })

  async function bookNow(){

    const { error } = await supabase
      .from('bookings')
      .insert([form])

    if(error){
      alert('Booking failed')
    }else{
      alert('Booking confirmed successfully')
    }
  }

  return(
    <div>

      <div className="navbar">
        <h2>ConsultPro</h2>
        <div>☰</div>
      </div>

      <section className="hero">

        <div>
          <span style={{background:'#1e40af',padding:'8px 14px',borderRadius:'999px'}}>
            #1 Consulting Platform
          </span>

          <h1>
            Get Expert Advice.
            Achieve Your Goals.
          </h1>

          <p>
            Book one-on-one consultation sessions with verified experts.
          </p>

          <button className="btn-primary">
            Explore Categories
          </button>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200"
          />
        </div>

      </section>

      <section className="section">

        <h2 className="section-title">
          Popular Categories
        </h2>

        <div className="grid">

          {[
            'IT Career Advice',
            'Stocks Guidance',
            'Business Ideas',
            'Car Buying Advice',
            'Sports Consulting',
            'General Consulting'
          ].map((item)=>(

            <div className="card" key={item}>
              <h3>{item}</h3>

              <p>
                Expert guidance and personalized consultation.
              </p>

              <div className="price">
                ₹999 / 30 mins
              </div>
            </div>

          ))}

        </div>

      </section>

      <section className="section">

        <div className="booking-box">

          <h2 className="section-title">
            Book Consultation
          </h2>

          <input
            placeholder="Full Name"
            onChange={(e)=>setForm({...form,name:e.target.value})}
          />

          <input
            placeholder="Phone Number"
            onChange={(e)=>setForm({...form,phone:e.target.value})}
          />

          <select
            onChange={(e)=>setForm({...form,category:e.target.value})}
          >
            <option>IT Career Advice</option>
            <option>Stocks Guidance</option>
            <option>Business Ideas</option>
            <option>Sports Consulting</option>
          </select>

          <input
            type="date"
            onChange={(e)=>setForm({...form,booking_date:e.target.value})}
          />

          <select
            onChange={(e)=>setForm({...form,slot:e.target.value})}
          >
            <option>Select Slot</option>
            <option>10:00 AM</option>
            <option>10:30 AM</option>
            <option>11:00 AM</option>
            <option>11:30 AM</option>
          </select>

          <textarea
            rows="5"
            placeholder="Your question or notes"
          ></textarea>

          <button
            className="btn-primary"
            onClick={bookNow}
          >
            Confirm Booking
          </button>

        </div>

      </section>

      <section className="section">

        <div className="stats">

          <div className="stat-card">
            <h2>2500+</h2>
            <p>Happy Clients</p>
          </div>

          <div className="stat-card">
            <h2>50+</h2>
            <p>Experts</p>
          </div>

          <div className="stat-card">
            <h2>10+</h2>
            <p>Categories</p>
          </div>

          <div className="stat-card">
            <h2>4.9/5</h2>
            <p>Ratings</p>
          </div>

        </div>

      </section>

      <div className="bottom-nav">
        <div>🏠 Home</div>
        <div>📂 Categories</div>
        <div>📅 Bookings</div>
        <div>👤 Profile</div>
      </div>

    </div>
  )
}

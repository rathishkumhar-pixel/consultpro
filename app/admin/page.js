
'use client'

import { useEffect,useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Admin(){

  const [bookings,setBookings] = useState([])

  useEffect(()=>{
    loadBookings()
  },[])

  async function loadBookings(){
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at',{ascending:false})

    setBookings(data || [])
  }

  return(

    <div className="admin-layout">

      <div className="sidebar">

        <h2>ConsultPro Admin</h2>

        <div>Dashboard</div>
        <div>Bookings</div>
        <div>Categories</div>
        <div>Time Slots</div>
        <div>Users</div>
        <div>Payments</div>
        <div>Settings</div>

      </div>

      <div className="admin-content">

        <h1 style={{marginBottom:'20px'}}>
          Dashboard
        </h1>

        <div className="stats">

          <div className="stat-card">
            <h2>{bookings.length}</h2>
            <p>Total Bookings</p>
          </div>

          <div className="stat-card">
            <h2>₹1,28,550</h2>
            <p>Revenue</p>
          </div>

          <div className="stat-card">
            <h2>45</h2>
            <p>Upcoming Sessions</p>
          </div>

          <div className="stat-card">
            <h2>98%</h2>
            <p>Client Satisfaction</p>
          </div>

        </div>

        <div style={{marginTop:'30px'}}>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Category</th>
                <th>Date</th>
                <th>Slot</th>
              </tr>
            </thead>

            <tbody>

              {bookings.map((b)=>(
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.phone}</td>
                  <td>{b.category}</td>
                  <td>{b.booking_date}</td>
                  <td>{b.slot}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  )
}

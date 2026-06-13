'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const AUTH_STORAGE_KEY = 'admin-auth'

export default function AdminBookingsPage(){
  const router = useRouter()
  const [isAuthorized,setIsAuthorized] = useState(false)
  const [isCheckingAuth,setIsCheckingAuth] = useState(true)
  const [bookings,setBookings] = useState([])
  const [message,setMessage] = useState('')
  const [isLoading,setIsLoading] = useState(false)

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
      loadBookings()
    }
  },[isAuthorized])

  const bookingCounts = useMemo(()=>{
    const completed = bookings.filter((booking)=>booking.completed).length

    return {
      total:bookings.length,
      pending:bookings.length - completed,
      completed
    }
  },[bookings])

  async function loadBookings(){
    setIsLoading(true)
    setMessage('')

    const { data,error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at',{ ascending:false })

    if(error){
      setMessage(`Unable to load bookings: ${error.message}`)
      setBookings([])
    } else {
      setBookings(data || [])
    }

    setIsLoading(false)
  }

  async function markCompleted(bookingId){
    setMessage('')

    const { error } = await supabase
      .from('bookings')
      .update({
        completed:true,
        completed_at:new Date().toISOString()
      })
      .eq('id',bookingId)

    if(error){
      setMessage(`Unable to mark completed: ${error.message}`)
      return
    }

    setBookings((currentBookings)=>
      currentBookings.map((booking)=>
        booking.id === bookingId
          ? {
              ...booking,
              completed:true,
              completed_at:new Date().toISOString()
            }
          : booking
      )
    )
    setMessage('Booking marked as completed')
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
          <h1 style={styles.title}>Bookings</h1>
        </div>

        <div style={styles.headerActions}>
          <Link href="/admin" style={styles.secondaryLink}>
            CMS
          </Link>
          <button type="button" onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total</span>
          <strong style={styles.statValue}>{bookingCounts.total}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Pending</span>
          <strong style={styles.statValue}>{bookingCounts.pending}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Completed</span>
          <strong style={styles.statValue}>{bookingCounts.completed}</strong>
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Booking Requests</h2>
            <p style={styles.panelText}>
              Review consultation requests and mark completed sessions.
            </p>
          </div>

          <button type="button" onClick={loadBookings} style={styles.refreshButton}>
            Refresh
          </button>
        </div>

        {message && (
          <p style={message.startsWith('Unable') ? styles.error : styles.message}>
            {message}
          </p>
        )}

        {isLoading ? (
          <div style={styles.emptyState}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div style={styles.emptyState}>No bookings yet.</div>
        ) : (
          <div style={styles.bookingList}>
            {bookings.map((booking)=>(
              <article key={booking.id} style={styles.bookingCard}>
                <div style={styles.bookingTop}>
                  <div>
                    <h3 style={styles.customerName}>
                      {booking.name || 'Unnamed customer'}
                    </h3>
                    <p style={styles.createdAt}>
                      Requested {formatDateTime(booking.created_at)}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.statusPill,
                      ...(booking.completed
                        ? styles.completedPill
                        : styles.pendingPill)
                    }}
                  >
                    {booking.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div style={styles.detailGrid}>
                  <Detail label="Phone" value={booking.phone} />
                  <Detail label="Service" value={booking.category} />
                  <Detail label="Date" value={formatDate(booking.booking_date)} />
                  <Detail label="Time" value={booking.slot} />
                </div>

                <div style={styles.cardActions}>
                  {booking.completed ? (
                    <span style={styles.completedText}>
                      Completed {formatDateTime(booking.completed_at)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={()=>markCompleted(booking.id)}
                      style={styles.primaryButton}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function Detail({ label,value }){
  return(
    <div style={styles.detailItem}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value || 'Not provided'}</strong>
    </div>
  )
}

function formatDate(value){
  if(!value){
    return 'Not provided'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN',{
    day:'2-digit',
    month:'short',
    year:'numeric'
  })
}

function formatDateTime(value){
  if(!value){
    return 'Not available'
  }

  return new Date(value).toLocaleString('en-IN',{
    day:'2-digit',
    month:'short',
    year:'numeric',
    hour:'2-digit',
    minute:'2-digit'
  })
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
  headerActions:{
    display:'flex',
    alignItems:'center',
    gap:'10px',
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
  secondaryLink:{
    minHeight:'44px',
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    padding:'0 18px',
    border:'1px solid #cbd5e1',
    borderRadius:'12px',
    background:'#ffffff',
    color:'#0f172a',
    fontWeight:800,
    textDecoration:'none'
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
  statsGrid:{
    width:'100%',
    maxWidth:'1120px',
    margin:'0 auto 20px',
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
    gap:'14px'
  },
  statCard:{
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'16px',
    padding:'18px',
    boxShadow:'0 10px 32px rgba(15,23,42,0.06)'
  },
  statLabel:{
    display:'block',
    color:'#64748b',
    fontSize:'13px',
    fontWeight:800,
    textTransform:'uppercase',
    marginBottom:'8px'
  },
  statValue:{
    color:'#0f172a',
    fontSize:'30px',
    lineHeight:1
  },
  panel:{
    width:'100%',
    maxWidth:'1120px',
    margin:'0 auto',
    background:'#ffffff',
    padding:'22px',
    borderRadius:'18px',
    border:'1px solid #e5e7eb',
    boxShadow:'0 18px 50px rgba(15,23,42,0.08)'
  },
  panelHeader:{
    display:'flex',
    alignItems:'flex-start',
    justifyContent:'space-between',
    gap:'16px',
    flexWrap:'wrap',
    marginBottom:'18px'
  },
  panelTitle:{
    color:'#0f172a',
    fontSize:'22px',
    lineHeight:1.2,
    marginBottom:'8px'
  },
  panelText:{
    color:'#64748b',
    fontSize:'14px',
    lineHeight:1.6
  },
  refreshButton:{
    minHeight:'42px',
    padding:'0 16px',
    border:'1px solid #cbd5e1',
    borderRadius:'12px',
    background:'#ffffff',
    color:'#0f172a',
    fontWeight:800,
    cursor:'pointer'
  },
  bookingList:{
    display:'grid',
    gap:'14px'
  },
  bookingCard:{
    border:'1px solid #e5e7eb',
    borderRadius:'16px',
    padding:'18px',
    background:'#f8fafc'
  },
  bookingTop:{
    display:'flex',
    alignItems:'flex-start',
    justifyContent:'space-between',
    gap:'12px',
    marginBottom:'16px'
  },
  customerName:{
    color:'#0f172a',
    fontSize:'20px',
    lineHeight:1.2,
    marginBottom:'6px'
  },
  createdAt:{
    color:'#64748b',
    fontSize:'13px'
  },
  statusPill:{
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    minHeight:'30px',
    padding:'0 10px',
    borderRadius:'999px',
    fontSize:'12px',
    fontWeight:900,
    whiteSpace:'nowrap'
  },
  pendingPill:{
    background:'#fef3c7',
    color:'#92400e'
  },
  completedPill:{
    background:'#dcfce7',
    color:'#166534'
  },
  detailGrid:{
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',
    gap:'12px'
  },
  detailItem:{
    padding:'12px',
    borderRadius:'12px',
    background:'#ffffff',
    border:'1px solid #e5e7eb'
  },
  detailLabel:{
    display:'block',
    color:'#64748b',
    fontSize:'12px',
    fontWeight:800,
    textTransform:'uppercase',
    marginBottom:'6px'
  },
  detailValue:{
    color:'#0f172a',
    fontSize:'15px',
    lineHeight:1.4,
    overflowWrap:'anywhere'
  },
  cardActions:{
    marginTop:'16px',
    display:'flex',
    justifyContent:'flex-end'
  },
  primaryButton:{
    minHeight:'44px',
    padding:'0 16px',
    border:'none',
    borderRadius:'12px',
    background:'#2563eb',
    color:'#ffffff',
    fontSize:'14px',
    fontWeight:800,
    cursor:'pointer'
  },
  completedText:{
    color:'#166534',
    fontSize:'14px',
    fontWeight:800
  },
  emptyState:{
    padding:'28px',
    borderRadius:'14px',
    background:'#f8fafc',
    color:'#64748b',
    textAlign:'center',
    fontWeight:800
  },
  message:{
    margin:'0 0 16px',
    padding:'14px 16px',
    borderRadius:'12px',
    background:'#ecfdf5',
    border:'1px solid #bbf7d0',
    color:'#047857',
    fontWeight:800
  },
  error:{
    margin:'0 0 16px',
    padding:'14px 16px',
    borderRadius:'12px',
    background:'#fef2f2',
    border:'1px solid #fecaca',
    color:'#b91c1c',
    fontWeight:800
  }
}

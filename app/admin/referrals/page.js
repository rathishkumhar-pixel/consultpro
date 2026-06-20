'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

const AUTH_STORAGE_KEY = 'admin-auth'

export default function AdminReferralsPage(){
  const router = useRouter()
  const [isAuthorized,setIsAuthorized] = useState(false)
  const [isCheckingAuth,setIsCheckingAuth] = useState(true)
  const [referrals,setReferrals] = useState([])
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
      loadReferrals()
    }
  },[isAuthorized])

  const referralCounts = useMemo(()=>{
    const completed = referrals.filter((referral)=>referral.status === 'Completed').length

    return {
      total:referrals.length,
      pending:referrals.length - completed,
      completed
    }
  },[referrals])

  async function loadReferrals(){
    setIsLoading(true)
    setMessage('')

    const { data,error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at',{ ascending:false })

    if(error){
      setMessage(`Unable to load referrals: ${error.message}`)
      setReferrals([])
    } else {
      setReferrals(data || [])
    }

    setIsLoading(false)
  }

  async function updateStatus(referralId,status){
    setMessage('')

    const { data,error } = await supabase
      .rpc('update_referral_status',{
        p_referral_id:referralId,
        p_status:status
      })

    if(error){
      setMessage(`Unable to update referral: ${error.message}`)
      return
    }

    setReferrals((currentReferrals)=>
      currentReferrals.map((referral)=>
        referral.id === referralId
          ? data
          : referral
      )
    )
    setMessage(`Referral marked as ${status}`)
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
          <h1 style={styles.title}>Referrals</h1>
        </div>

        <div style={styles.headerActions}>
          <Link href="/admin" style={styles.secondaryLink}>
            CMS
          </Link>
          <Link href="/admin/bookings" style={styles.secondaryLink}>
            Bookings
          </Link>
          <button type="button" onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total</span>
          <strong style={styles.statValue}>{referralCounts.total}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Pending</span>
          <strong style={styles.statValue}>{referralCounts.pending}</strong>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Completed</span>
          <strong style={styles.statValue}>{referralCounts.completed}</strong>
        </div>
      </section>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Referral Requests</h2>
            <p style={styles.panelText}>
              Review valid referral entries and manually control their status.
            </p>
          </div>

          <button type="button" onClick={loadReferrals} style={styles.refreshButton}>
            Refresh
          </button>
        </div>

        {message && (
          <p style={message.startsWith('Unable') ? styles.error : styles.message}>
            {message}
          </p>
        )}

        {isLoading ? (
          <div style={styles.emptyState}>Loading referrals...</div>
        ) : referrals.length === 0 ? (
          <div style={styles.emptyState}>No referrals yet.</div>
        ) : (
          <div style={styles.referralList}>
            {referrals.map((referral)=>(
              <article key={referral.id} style={styles.referralCard}>
                <div style={styles.referralTop}>
                  <div>
                    <h3 style={styles.customerName}>
                      {referral.customer_name || 'Unnamed customer'}
                    </h3>
                    <p style={styles.createdAt}>
                      Created {formatDateTime(referral.created_at)}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.statusPill,
                      ...(referral.status === 'Completed'
                        ? styles.completedPill
                        : styles.pendingPill)
                    }}
                  >
                    {referral.status}
                  </span>
                </div>

                <div style={styles.detailGrid}>
                  <Detail label="Customer Phone" value={referral.referred_phone} />
                  <Detail label="Referred By" value={referral.referrer_phone} />
                  <Detail label="Service" value={referral.service_requested} />
                  <Detail label="Date" value={formatDate(referral.booking_date)} />
                  <Detail label="Time" value={referral.slot} />
                  <Detail label="Booking ID" value={referral.booking_id} />
                </div>

                {referral.fraud_notes && (
                  <p style={styles.warningText}>{referral.fraud_notes}</p>
                )}

                <div style={styles.cardActions}>
                  {referral.status === 'Completed' ? (
                    <button
                      type="button"
                      onClick={()=>updateStatus(referral.id,'Pending')}
                      style={styles.secondaryButton}
                    >
                      Mark Pending
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={()=>updateStatus(referral.id,'Completed')}
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
  referralList:{
    display:'grid',
    gap:'14px'
  },
  referralCard:{
    border:'1px solid #e5e7eb',
    borderRadius:'16px',
    padding:'18px',
    background:'#f8fafc'
  },
  referralTop:{
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
    padding:'0 12px',
    borderRadius:'999px',
    fontSize:'13px',
    fontWeight:800
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
    gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
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
    lineHeight:1.35,
    overflowWrap:'anywhere'
  },
  warningText:{
    marginTop:'14px',
    padding:'12px',
    borderRadius:'12px',
    background:'#fff7ed',
    color:'#9a3412',
    fontWeight:700
  },
  cardActions:{
    display:'flex',
    justifyContent:'flex-end',
    gap:'10px',
    flexWrap:'wrap',
    marginTop:'16px'
  },
  primaryButton:{
    minHeight:'42px',
    padding:'0 16px',
    border:'none',
    borderRadius:'12px',
    background:'#2563eb',
    color:'#ffffff',
    fontWeight:800,
    cursor:'pointer'
  },
  secondaryButton:{
    minHeight:'42px',
    padding:'0 16px',
    border:'1px solid #cbd5e1',
    borderRadius:'12px',
    background:'#ffffff',
    color:'#0f172a',
    fontWeight:800,
    cursor:'pointer'
  },
  message:{
    color:'#16a34a',
    fontWeight:800,
    marginBottom:'14px'
  },
  error:{
    color:'#dc2626',
    fontWeight:800,
    marginBottom:'14px'
  },
  emptyState:{
    padding:'24px',
    borderRadius:'14px',
    background:'#f8fafc',
    color:'#64748b',
    textAlign:'center',
    fontWeight:800
  }
}

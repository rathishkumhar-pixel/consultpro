'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const AUTH_STORAGE_KEY = 'admin-auth'
const FALLBACK_ADMIN_USERNAME = 'admin'
const FALLBACK_ADMIN_PASSWORD = 'vgr123'

export default function LoginPage(){
  const router = useRouter()
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const [isSubmitting,setIsSubmitting] = useState(false)

  useEffect(()=>{
    if(window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true'){
      router.replace('/admin')
    }
  },[router])

  function handleSubmit(event){
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const adminUsername =
      process.env.NEXT_PUBLIC_ADMIN_USERNAME || FALLBACK_ADMIN_USERNAME
    const adminPassword =
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD

    if(
      username.trim() === adminUsername &&
      password === adminPassword
    ){
      window.localStorage.setItem(AUTH_STORAGE_KEY,'true')
      router.replace('/admin')
      return
    }

    setError('Invalid username or password.')
    setIsSubmitting(false)
  }

  return(
    <main style={styles.page}>
      <section style={styles.panel}>
        <div style={styles.brandBlock}>
          <p style={styles.eyebrow}>Admin portal</p>
          <h1 style={styles.heading}>Sign in to ConsultPro</h1>
          <p style={styles.copy}>
            Access content, category, and booking management.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="admin-username">
            Username
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(event)=>setUsername(event.target.value)}
            autoComplete="username"
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event)=>setPassword(event.target.value)}
            autoComplete="current-password"
            required
            style={styles.input}
          />

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.button,
              opacity:isSubmitting ? 0.75 : 1,
              cursor:isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

const styles = {
  page:{
    minHeight:'100vh',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    padding:'24px',
    background:'linear-gradient(135deg,#eef4ff 0%,#f8fafc 48%,#ecfeff 100%)'
  },
  panel:{
    width:'100%',
    maxWidth:'430px',
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    borderRadius:'18px',
    boxShadow:'0 24px 70px rgba(15,23,42,0.12)',
    padding:'28px'
  },
  brandBlock:{
    marginBottom:'26px'
  },
  eyebrow:{
    color:'#2563eb',
    fontSize:'13px',
    fontWeight:700,
    letterSpacing:'0',
    textTransform:'uppercase',
    marginBottom:'10px'
  },
  heading:{
    color:'#0f172a',
    fontSize:'30px',
    lineHeight:1.15,
    marginBottom:'10px'
  },
  copy:{
    color:'#64748b',
    fontSize:'15px',
    lineHeight:1.6
  },
  form:{
    display:'flex',
    flexDirection:'column'
  },
  label:{
    color:'#334155',
    fontSize:'14px',
    fontWeight:700,
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
  error:{
    color:'#b91c1c',
    background:'#fef2f2',
    border:'1px solid #fecaca',
    borderRadius:'12px',
    padding:'12px',
    fontSize:'14px',
    margin:'0 0 16px'
  },
  button:{
    width:'100%',
    minHeight:'50px',
    border:'none',
    borderRadius:'12px',
    background:'#2563eb',
    color:'#ffffff',
    fontSize:'16px',
    fontWeight:800
  }
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import BrandLogo from '../components/Logo'

export default function ContactPage(){
  const [content,setContent] = useState(null)

  useEffect(()=>{
    loadContent()
  },[])

  async function loadContent(){
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .limit(1)
      .single()

    setContent(data)
  }

  return(
    <main style={styles.page}>
      <header style={styles.topbar}>
        <Link href="/" style={styles.brandLink}>
          <BrandLogo size={34} />
        </Link>
      </header>

      <section style={styles.hero}>
        <Link href="/" style={styles.backLink}>
          Back to Home
        </Link>

        <p style={styles.eyebrow}>Contact us</p>
        <h1 style={styles.title}>
          {content?.contact_title || 'Talk to Kashv Consultancy'}
        </h1>
        <p style={styles.description}>
          {content?.contact_description ||
            'Have a question before booking? Reach out and we will help you choose the right consultation.'}
        </p>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <span style={styles.label}>Phone</span>
          <a
            href={`tel:${content?.contact_phone || ''}`}
            style={styles.value}
          >
            {content?.contact_phone || 'Add phone in CMS'}
          </a>
        </div>

        <div style={styles.card}>
          <span style={styles.label}>Email</span>
          <a
            href={`mailto:${content?.contact_email || ''}`}
            style={styles.value}
          >
            {content?.contact_email || 'Add email in CMS'}
          </a>
        </div>

        <div style={styles.card}>
          <span style={styles.label}>Address</span>
          <p style={styles.value}>
            {content?.contact_address || 'Add address in CMS'}
          </p>
        </div>

        <div style={styles.card}>
          <span style={styles.label}>Business hours</span>
          <p style={styles.value}>
            {content?.contact_hours || 'Add business hours in CMS'}
          </p>
        </div>
      </section>

      <footer style={styles.footer}>
        <strong>Kashv Consultancy</strong>
        <Link href="/" style={styles.footerLink}>
          Home
        </Link>
      </footer>
    </main>
  )
}

const styles = {
  page:{
    minHeight:'100vh',
    padding:'20px',
    background:'#0f2138',
    fontFamily:'Arial,sans-serif'
  },
  topbar:{
    maxWidth:'900px',
    margin:'0 auto',
    padding:'8px 0 0'
  },
  brandLink:{
    textDecoration:'none'
  },
  hero:{
    maxWidth:'900px',
    margin:'0 auto',
    padding:'40px 0 32px'
  },
  backLink:{
    display:'inline-flex',
    marginBottom:'28px',
    color:'#f2643c',
    textDecoration:'none',
    fontWeight:700
  },
  eyebrow:{
    color:'#f2643c',
    fontSize:'14px',
    fontWeight:800,
    textTransform:'uppercase',
    letterSpacing:'2px',
    marginBottom:'10px'
  },
  title:{
    color:'#f5f1e6',
    fontSize:'clamp(34px,6vw,58px)',
    lineHeight:1.05,
    marginBottom:'18px'
  },
  description:{
    maxWidth:'720px',
    color:'#93a5bd',
    fontSize:'18px',
    lineHeight:1.7
  },
  grid:{
    maxWidth:'900px',
    margin:'0 auto',
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
    gap:'18px'
  },
  card:{
    minHeight:'150px',
    padding:'22px',
    borderRadius:'18px',
    background:'#16304d',
    border:'1px solid rgba(245,241,230,0.1)',
    boxShadow:'0 12px 34px rgba(0,0,0,0.25)'
  },
  label:{
    display:'block',
    color:'#93a5bd',
    fontSize:'13px',
    fontWeight:800,
    textTransform:'uppercase',
    marginBottom:'14px'
  },
  value:{
    color:'#f5f1e6',
    fontSize:'18px',
    lineHeight:1.5,
    fontWeight:700,
    textDecoration:'none',
    whiteSpace:'pre-wrap'
  },
  footer:{
    maxWidth:'900px',
    margin:'56px auto 0',
    padding:'24px',
    borderRadius:'18px',
    background:'#0a1a2c',
    color:'#f5f1e6',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    gap:'16px',
    border:'1px solid rgba(245,241,230,0.1)'
  },
  footerLink:{
    color:'#f5f1e6',
    textDecoration:'none',
    fontWeight:700
  }
}

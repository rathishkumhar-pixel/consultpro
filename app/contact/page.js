'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

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
      <section style={styles.hero}>
        <Link href="/" style={styles.backLink}>
          Back to Home
        </Link>

        <p style={styles.eyebrow}>Contact us</p>
        <h1 style={styles.title}>
          {content?.contact_title || 'Talk to ConsultPro'}
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
        <strong>ConsultPro</strong>
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
    background:'#f5f7fb',
    fontFamily:'Arial,sans-serif'
  },
  hero:{
    maxWidth:'900px',
    margin:'0 auto',
    padding:'58px 0 32px'
  },
  backLink:{
    display:'inline-flex',
    marginBottom:'28px',
    color:'#2563eb',
    textDecoration:'none',
    fontWeight:700
  },
  eyebrow:{
    color:'#2563eb',
    fontSize:'14px',
    fontWeight:800,
    textTransform:'uppercase',
    marginBottom:'10px'
  },
  title:{
    color:'#111827',
    fontSize:'clamp(34px,6vw,58px)',
    lineHeight:1.05,
    marginBottom:'18px'
  },
  description:{
    maxWidth:'720px',
    color:'#4b5563',
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
    background:'#ffffff',
    border:'1px solid #e5e7eb',
    boxShadow:'0 2px 12px rgba(0,0,0,0.05)'
  },
  label:{
    display:'block',
    color:'#6b7280',
    fontSize:'13px',
    fontWeight:800,
    textTransform:'uppercase',
    marginBottom:'14px'
  },
  value:{
    color:'#111827',
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
    background:'#111827',
    color:'#ffffff',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    gap:'16px'
  },
  footerLink:{
    color:'#ffffff',
    textDecoration:'none',
    fontWeight:700
  }
}

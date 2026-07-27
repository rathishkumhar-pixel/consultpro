'use client'

import Link from 'next/link'
import BrandLogo from '../components/Logo'

export default function CategoryPageClient({ category }){
  const pageTitle = category.page_title || category.title
  const pageContent =
    category.page_content ||
    category.popup_description ||
    category.description ||
    ''
  const pageImage = category.page_image || category.popup_image || ''
  const bookingHref = `/?category=${encodeURIComponent(category.title)}#booking-form`

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

        <p style={styles.eyebrow}>Consultation category</p>
        <h1 style={styles.title}>{pageTitle}</h1>
      </section>

      <section style={styles.contentSection}>
        {pageImage && (
          <div style={styles.imageWrap}>
            <img
              src={pageImage}
              alt={pageTitle}
              style={styles.image}
            />
          </div>
        )}

        <div style={styles.textWrap}>
          {pageContent.split('\n').map((paragraph,index)=>(
            paragraph.trim() ? (
              <p key={`${index}-${paragraph.slice(0, 12)}`} style={styles.paragraph}>
                {paragraph}
              </p>
            ) : null
          ))}

          <Link href={bookingHref} style={styles.bookButton}>
            Book Now
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>
        <strong>{pageTitle}</strong>
        <div style={styles.footerLinks}>
          <Link href="/contact" style={styles.footerLink}>
            Contact
          </Link>
          <Link href="/" style={styles.footerLink}>
            Home
          </Link>
        </div>
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
    maxWidth:'980px',
    margin:'0 auto',
    padding:'8px 0 0'
  },
  brandLink:{
    textDecoration:'none'
  },
  hero:{
    maxWidth:'980px',
    margin:'0 auto',
    padding:'40px 0 24px'
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
    lineHeight:1.05
  },
  contentSection:{
    maxWidth:'980px',
    margin:'0 auto',
    display:'grid',
    gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))',
    gap:'28px',
    alignItems:'start'
  },
  imageWrap:{
    width:'100%'
  },
  image:{
    width:'100%',
    aspectRatio:'16 / 10',
    objectFit:'cover',
    borderRadius:'22px',
    border:'1px solid rgba(245,241,230,0.1)',
    boxShadow:'0 18px 50px rgba(0,0,0,0.3)',
    background:'#16304d'
  },
  textWrap:{
    display:'grid',
    gap:'16px',
    padding:'8px 0'
  },
  paragraph:{
    color:'#d7dee8',
    fontSize:'17px',
    lineHeight:1.75,
    whiteSpace:'pre-wrap'
  },
  bookButton:{
    display:'inline-flex',
    alignItems:'center',
    justifyContent:'center',
    minHeight:'50px',
    width:'fit-content',
    padding:'0 22px',
    marginTop:'8px',
    borderRadius:'12px',
    background:'#f2643c',
    color:'#ffffff',
    fontWeight:800,
    textDecoration:'none'
  },
  footer:{
    maxWidth:'980px',
    margin:'56px auto 0',
    padding:'24px',
    borderRadius:'18px',
    background:'#0a1a2c',
    color:'#f5f1e6',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    gap:'16px',
    flexWrap:'wrap',
    border:'1px solid rgba(245,241,230,0.1)'
  },
  footerLinks:{
    display:'flex',
    gap:'16px',
    flexWrap:'wrap'
  },
  footerLink:{
    color:'#f5f1e6',
    textDecoration:'none',
    fontWeight:700
  }
}

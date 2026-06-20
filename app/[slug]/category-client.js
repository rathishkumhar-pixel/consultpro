'use client'

import Link from 'next/link'

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
    background:'#f5f7fb',
    fontFamily:'Arial,sans-serif'
  },
  hero:{
    maxWidth:'980px',
    margin:'0 auto',
    padding:'48px 0 24px'
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
    border:'1px solid #e5e7eb',
    boxShadow:'0 18px 50px rgba(15,23,42,0.10)',
    background:'#e5e7eb'
  },
  textWrap:{
    display:'grid',
    gap:'16px',
    padding:'8px 0'
  },
  paragraph:{
    color:'#334155',
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
    background:'#2563eb',
    color:'#ffffff',
    fontWeight:800,
    textDecoration:'none'
  },
  footer:{
    maxWidth:'980px',
    margin:'56px auto 0',
    padding:'24px',
    borderRadius:'18px',
    background:'#111827',
    color:'#ffffff',
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    gap:'16px',
    flexWrap:'wrap'
  },
  footerLinks:{
    display:'flex',
    gap:'16px',
    flexWrap:'wrap'
  },
  footerLink:{
    color:'#ffffff',
    textDecoration:'none',
    fontWeight:700
  }
}

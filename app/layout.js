
import './globals.css'

export const metadata = {
  title:'ConsultPro Mobile First',
  description:'Consulting Platform'
}

export default function RootLayout({children}){
  return(
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

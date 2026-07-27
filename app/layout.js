
import './globals.css'

export const metadata = {
  title:'Kashv Consultancy',
  description:'Expert advice before your big decisions'
}

export default function RootLayout({children}){
  return(
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

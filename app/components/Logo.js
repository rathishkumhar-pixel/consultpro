import { colors } from '../../lib/theme'

export function LogoMark({ size = 40 }){
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="32" y1="18" x2="32" y2="84" stroke={colors.cream} strokeWidth="13" strokeLinecap="round" />
      <line x1="32" y1="56" x2="66" y2="84" stroke={colors.cream} strokeWidth="13" strokeLinecap="round" />
      <line x1="34" y1="60" x2="78" y2="22" stroke={colors.coral} strokeWidth="12" strokeLinecap="round" />
      <polygon points="78,22 60,25 73,36" fill={colors.coral} />
    </svg>
  )
}

export default function BrandLogo({ size = 36, withWordmark = true, brandName = 'Kashv Consultancy' }){
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'12px' }}>
      <LogoMark size={size} />
      {withWordmark && (
        <span style={{ fontSize:`${Math.round(size * 0.55)}px`, fontWeight:800, color:colors.cream, lineHeight:1 }}>
          {brandName}
        </span>
      )}
    </span>
  )
}

import { Loader2 } from 'lucide-react'

export default function Loader({ label = 'Loading...', fullscreen = false }) {
  return (
    <div className={fullscreen ? 'loader loader--fullscreen' : 'loader'}>
      <Loader2 size={20} className="spin" />
      <span>{label}</span>
    </div>
  )
}

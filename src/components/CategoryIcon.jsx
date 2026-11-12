import { HardDrive, HelpCircle, Printer, Cpu, Wifi } from 'lucide-react'

const ICONS = {
  Hardware: HardDrive,
  Software: Cpu,
  Network: Wifi,
  Printer: Printer,
  Other: HelpCircle,
}

export default function CategoryIcon({ category, size = 15 }) {
  const Icon = ICONS[category] || HelpCircle
  return <Icon size={size} />
}

export { ICONS as CATEGORY_ICONS }

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import ComplaintTable from '../components/ComplaintTable.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { complaintsApi, errorMessage } from '../services/api.js'

const STATUSES = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved']
const CATEGORIES = ['All', 'Hardware', 'Software', 'Network', 'Printer', 'Other']

export default function MyComplaints() {
  const { notify } = useToast()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [category, setCategory] = useState('All')

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === 'All' ? undefined : status,
      category: category === 'All' ? undefined : category,
    }),
    [search, status, category],
  )

  const load = useCallback(
    async (query) => {
      setLoading(true)
      try {
        setComplaints(await complaintsApi.list(query))
      } catch (err) {
        notify(errorMessage(err, 'Could not load your complaints.'), 'error')
      } finally {
        setLoading(false)
      }
    },
    [notify],
  )

  // Debounce so typing in the search box does not hit the API on every key.
  useEffect(() => {
    const timer = setTimeout(() => load(params), 300)
    return () => clearTimeout(timer)
  }, [params, load])

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>My complaints</h1>
          <p className="muted">Select a complaint to see its progress and remarks from the IT Cell.</p>
        </div>
      </div>

      <section className="card">
        <div className="filter-bar">
          <span className="search-input">
            <Search size={16} />
            <input
              type="text"
              value={search}
              placeholder="Search by ticket ID or title..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All status' : s}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All category' : c}
              </option>
            ))}
          </select>
        </div>

        <ComplaintTable
          complaints={complaints}
          showChevron
          loading={loading}
          skeletonRows={5}
          emptyText="No complaint matches these filters."
        />
        {!loading && complaints.length > 0 && (
          <p className="table-footnote">
            Showing {complaints.length} of {complaints.length} complaints
          </p>
        )}
      </section>
    </div>
  )
}

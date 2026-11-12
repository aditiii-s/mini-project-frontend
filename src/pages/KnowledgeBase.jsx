import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, LifeBuoy, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import CategoryIcon from '../components/CategoryIcon.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { errorMessage, knowledgeBaseApi } from '../services/api.js'

const CATEGORIES = ['All', 'Hardware', 'Software', 'Network', 'Printer', 'Other']

function ArticleSkeleton() {
  return (
    <article className="kb-article" aria-busy="true">
      <div className="kb-article__head">
        <Skeleton width={34} height={34} radius={9} />
        <span className="kb-article__title">
          <Skeleton width="62%" height={15} />
          <Skeleton width="84%" height={12} className="skeleton--gap-sm" />
        </span>
      </div>
    </article>
  )
}

export default function KnowledgeBase() {
  const { notify } = useToast()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [openSlug, setOpenSlug] = useState(null)

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      category: category === 'All' ? undefined : category,
    }),
    [search, category],
  )

  const load = useCallback(
    async (query) => {
      setLoading(true)
      try {
        setArticles(await knowledgeBaseApi.list(query))
      } catch (err) {
        notify(errorMessage(err, 'Could not load the help articles.'), 'error')
      } finally {
        setLoading(false)
      }
    },
    [notify],
  )

  useEffect(() => {
    const timer = setTimeout(() => load(params), 300)
    return () => clearTimeout(timer)
  }, [params, load])

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Knowledge base</h1>
          <p className="muted">
            Common IT problems and how to fix them yourself before raising a complaint.
          </p>
        </div>
      </div>

      <section className="card">
        <div className="filter-bar filter-bar--kb">
          <span className="search-input">
            <Search size={16} />
            <input
              type="text"
              value={search}
              placeholder="Search questions, for example printer or VPN..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All categories' : c}
              </option>
            ))}
          </select>
        </div>

        <div className="kb-list">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <ArticleSkeleton key={i} />)
          ) : articles.length === 0 ? (
            <div className="empty-state">
              No article matches that search. Try a different word, or raise a complaint.
            </div>
          ) : (
            articles.map((article) => {
              const open = openSlug === article.slug
              return (
                <article
                  className={`kb-article ${open ? 'kb-article--open' : ''}`}
                  key={article.slug}
                >
                  <button
                    type="button"
                    className="kb-article__head"
                    aria-expanded={open}
                    onClick={() => setOpenSlug(open ? null : article.slug)}
                  >
                    <span className="kb-article__icon">
                      <CategoryIcon category={article.category} size={17} />
                    </span>
                    <span className="kb-article__title">
                      <strong>{article.question}</strong>
                      <small>{article.summary}</small>
                    </span>
                    <ChevronDown size={18} className="kb-article__chevron" />
                  </button>

                  {open && (
                    <div className="kb-article__body">
                      <ol>
                        {article.steps
                          .split('\n')
                          .map((step) => step.trim())
                          .filter(Boolean)
                          .map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                      </ol>
                    </div>
                  )}
                </article>
              )
            })
          )}
        </div>
      </section>

      <section className="card kb-footer">
        <span className="kb-footer__icon">
          <LifeBuoy size={20} />
        </span>
        <div>
          <strong>Still stuck?</strong>
          <p className="muted">
            If none of these steps help, raise a complaint and the IT Cell will assign an engineer.
          </p>
        </div>
        <Link className="btn btn--primary" to="/raise-complaint">
          Raise a complaint
        </Link>
      </section>
    </div>
  )
}

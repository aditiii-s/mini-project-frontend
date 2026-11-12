/**
 * Shimmering placeholders shown while data loads.
 *
 * Each skeleton mirrors the shape of the real content it stands in for, so the
 * layout does not jump when the data arrives.
 */

export default function Skeleton({ width = '100%', height = 14, radius = 6, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}

export function StatCardSkeleton() {
  return (
    <article className="card stat-card" aria-busy="true">
      <header>
        <Skeleton width="45%" height={13} />
        <Skeleton width={36} height={36} radius={10} />
      </header>
      <Skeleton width={56} height={32} radius={8} className="skeleton--gap" />
      <Skeleton width="38%" height={11} />
    </article>
  )
}

export function TableSkeleton({ rows = 4, showChevron = false }) {
  return (
    <div className="table-scroll" aria-busy="true">
      <table className="data-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Complaint</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Filed</th>
            {showChevron && <th aria-label="Open" />}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              <td>
                <Skeleton width={96} />
              </td>
              <td>
                <Skeleton width="78%" />
                <Skeleton width="42%" height={11} className="skeleton--gap-sm" />
              </td>
              <td>
                <Skeleton width={78} />
              </td>
              <td>
                <Skeleton width={58} height={20} radius={999} />
              </td>
              <td>
                <Skeleton width={84} height={22} radius={999} />
              </td>
              <td>
                <Skeleton width={74} />
              </td>
              {showChevron && (
                <td>
                  <Skeleton width={16} height={16} radius={4} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SummaryListSkeleton({ rows = 5 }) {
  return (
    <dl className="summary-list" aria-busy="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index}>
          <dt>
            <Skeleton width={84} height={12} />
          </dt>
          <dd>
            <Skeleton width={116} height={13} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function TimelineSkeleton({ steps = 4 }) {
  return (
    <ol className="timeline" aria-busy="true">
      {Array.from({ length: steps }).map((_, index) => (
        <li className="timeline__item" key={index}>
          <span className="timeline__dot timeline__dot--skeleton" />
          <div>
            <Skeleton width={104} height={14} />
            <Skeleton width={148} height={11} className="skeleton--gap-sm" />
            <Skeleton width="70%" height={12} className="skeleton--gap-sm" />
          </div>
        </li>
      ))}
    </ol>
  )
}

export function DetailsSkeleton() {
  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <Skeleton width={150} height={12} />
          <Skeleton width={190} height={28} radius={8} className="skeleton--gap" />
          <Skeleton width={320} height={14} className="skeleton--gap-sm" />
        </div>
        <div className="badge-row">
          <Skeleton width={62} height={24} radius={999} />
          <Skeleton width={92} height={24} radius={999} />
        </div>
      </div>

      <div className="details-grid">
        <div className="stack">
          <section className="card" aria-busy="true">
            <Skeleton width={168} height={16} radius={6} />
            <div className="skeleton-lines">
              <Skeleton />
              <Skeleton />
              <Skeleton width="64%" />
            </div>
          </section>
          <section className="card" aria-busy="true">
            <Skeleton width={84} height={16} radius={6} />
            <div className="skeleton--gap">
              <TimelineSkeleton />
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card" aria-busy="true">
            <Skeleton width={128} height={16} radius={6} />
            <div className="skeleton--gap">
              <SummaryListSkeleton rows={6} />
            </div>
          </section>
          <section className="card" aria-busy="true">
            <Skeleton width={136} height={16} radius={6} />
            <Skeleton width="74%" className="skeleton--gap" />
          </section>
          <section className="card" aria-busy="true">
            <Skeleton width={78} height={16} radius={6} />
            <div className="skeleton-lines skeleton--gap">
              <Skeleton width="58%" />
              <Skeleton width="42%" height={12} />
              <Skeleton width="50%" height={12} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

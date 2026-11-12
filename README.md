# BSPHCL IT Helpdesk — Frontend

React frontend for the **Bihar State Power (Holding) Company Ltd. (BSPHCL)** IT Helpdesk
Management System. Employees sign in with their Employee ID, raise IT complaints, track them
by ticket ID and follow the IT Cell's progress on each ticket.

Built with React 18, Vite, React Router, Axios and Lucide icons, styled with a plain-CSS
design system (no UI framework).

## Running locally

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

The app expects the FastAPI backend on <http://localhost:8000>; Vite proxies `/api` to it
(see `vite.config.js`), so no extra setup is needed. To point at a deployed API instead,
copy `.env.example` to `.env` and set:

```ini
VITE_API_BASE_URL=https://your-api-host/api
```

`npm run build` produces a static bundle in `dist/`.

## Demo login

| Employee ID | Password | Role |
|---|---|---|
| `EMP1024` | `demo123` | Employee |
| `ITADMIN` | `admin123` | IT Cell admin |

Both are shown on the sign-in screen and fill the form on one click.

## Structure

```
src/
├── components/   ProtectedRoute, ComplaintTable, badges, loader
├── context/      AuthContext (JWT session), ToastContext (notifications)
├── layouts/      AppLayout — sidebar, top bar, page frame
├── pages/        Login, Dashboard, RaiseComplaint, MyComplaints, ComplaintDetails
├── services/     api.js (Axios instance + endpoints), format.js
└── index.css     design tokens and all component styles
```

## Screens

| Route | Page |
|---|---|
| `/login` | Split sign-in screen with demo account cards |
| `/dashboard` | Greeting, four live statistics cards, "Track a complaint" card with category shortcuts, recent complaints table |
| `/raise-complaint` | Category tiles, subject and description, priority, optional asset tag / extension / attachment, success screen with the new ticket ID |
| `/my-complaints` | Search by ticket ID or subject, status and category filters, complaints table |
| `/complaints/:ticketId` | Description, Submitted → Assigned → In Progress → Resolved timeline, assigned engineer, resolution remarks |

All dashboard figures and complaint records come from the backend API — nothing is hardcoded.
The JWT is kept in `localStorage`; an expired or invalid token clears the session and returns
to the sign-in screen.

## Notes

This is a demo portal with fictional data and is not connected to any real BSPHCL system.

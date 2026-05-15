# Pawpet - Vet Teleconsulting Platform

Pawpet connects pet owners with licensed veterinarians for real-time teleconsultations — both urgent and scheduled. It features live video calls via Jitsi Meet, an urgent-matching queue backed by Redis, a community forum, and a full consultation lifecycle from booking through payment and review.

---

## Tech Stack

| Layer       | Technology                                        |
|-------------|---------------------------------------------------|
| Frontend    | Next.js 14, React 18, Tailwind CSS, Socket.io-client |
| Backend     | Node.js, Express 4, Socket.io 4, Prisma ORM 5     |
| Database    | PostgreSQL 15                                     |
| Queue       | Redis 7                                           |
| Video Calls | Jitsi Meet (self-hosted, stable-9111)             |
| Proxy       | Nginx (Alpine)                                    |
| Runtime     | Docker / Docker Compose                           |

---

## Architecture

```
                        ┌─────────────┐
                        │   Browser   │
                        └──────┬──────┘
                               │ :80
                        ┌──────▼──────┐
                        │    Nginx    │  (reverse proxy)
                        └──┬──────┬──┘
                           │      │
              /api/*  ┌────┘      └────┐  /*
         /socket.io/* │                │
                ┌─────▼──────┐  ┌──────▼──────┐
                │  Backend   │  │  Frontend   │
                │ Express +  │  │  Next.js 14 │
                │ Socket.io  │  │  :3000      │
                │  :5000     │  └─────────────┘
                └─────┬──────┘
                      │
           ┌──────────┼──────────┐
           │                     │
    ┌──────▼──────┐      ┌───────▼──────┐
    │ PostgreSQL  │      │    Redis 7   │
    │    :5432    │      │    :6379     │
    └─────────────┘      └─────────────┘

Jitsi Meet cluster (separate meet.jitsi network):
  jitsi-web :8080/:8443  →  jitsi-prosody (XMPP)
                         →  jitsi-jicofo  (Conference Focus)
                         →  jitsi-jvb     (Video Bridge :10000/udp)
```

---

## Getting Started

### Prerequisites

- Docker >= 24
- Docker Compose v2 (`docker compose` — note: no hyphen)

### 1. Clone & configure

```bash
cp .env.example .env
# Edit .env if you need custom secrets (optional for local dev)
```

### 2. Start all services

```bash
docker compose up --build -d
```

On first boot the backend container will automatically:

1. Run `npx prisma db push` — syncs the schema to PostgreSQL (no migration files needed)
2. Run `node prisma/seed.js` — seeds default accounts and mock data
3. Start the Express + Socket.io server

### 3. Tear down

```bash
# Stop containers (keep volumes)
docker compose down

# Stop and wipe all data
docker compose down -v
```

---

## Service URLs

| Service             | URL                              | Notes                          |
|---------------------|----------------------------------|--------------------------------|
| Web App             | http://localhost                 | Proxied via Nginx              |
| Web App (direct)    | http://localhost:3000            | Next.js dev server             |
| REST API            | http://localhost/api             | Proxied via Nginx              |
| API (direct)        | http://localhost:5000/api        | Express server                 |
| Health check        | http://localhost:5000/health     |                                |
| Jitsi Meet          | http://localhost:8080            | Video call interface           |
| Jitsi (HTTPS)       | https://localhost:8443           | Self-signed cert               |
| Jitsi JVB metrics   | http://localhost:8888            | JVB health/stats               |
| PostgreSQL          | localhost:5432                   | DB: pawpet / user: pawpet      |
| Redis               | localhost:6379                   |                                |

---

## Default Accounts (from seed data)

| Role      | Name              | Email                          | Password    |
|-----------|-------------------|--------------------------------|-------------|
| Pet Owner | Mahboob Rabin     | mahboob@example.com            | password123 |
| Pet Owner | Priya Sharma      | priya@example.com              | password123 |
| Vet       | Dr. Aisha Rahman  | aisha.rahman@pawpet.vet        | password123 |
| Vet       | Dr. Tanvir Ahmed  | tanvir.ahmed@pawpet.vet        | password123 |
| Vet       | Dr. Mitu Saha     | mitu.saha@pawpet.vet           | password123 |
| Vet       | Dr. Shohel Islam  | shohel.islam@pawpet.vet        | password123 |
| Vet       | Dr. Piya Nandi    | piya.nandi@pawpet.vet          | password123 |
| Vet       | Dr. Kamal Hossain | kamal.hossain@pawpet.vet       | password123 |

---

## Mock Data

The seed script (`backend/prisma/seed.js`) populates the database with:

- **Users** — 1 admin, multiple vets with full profiles (specialty, fees, availability), multiple pet owners
- **Pets** — dogs, cats, and birds linked to each owner with species, breed, age, and sex
- **VetProfiles** — ratings, experience years, consultation fees, urgent fees, and supported languages
- **Consultations** — sample completed, in-progress, and pending consultations with different urgency levels
- **Community Posts** — posts across all categories (urgent rescue, lost & found, adoption, medical help, etc.)
- **Reviews** — ratings and comments for completed consultations

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable            | Description                         | Default                          |
|---------------------|-------------------------------------|----------------------------------|
| `POSTGRES_PASSWORD` | PostgreSQL password                 | `pawpet123`                      |
| `JWT_SECRET`        | Secret used to sign JWT tokens      | `pawpet-super-secret-jwt-key-2024` |
| `JWT_EXPIRES_IN`    | Token expiry                        | `7d`                             |
| `JITSI_APP_ID`      | Jitsi app identifier                | `pawpet`                         |
| `JITSI_SECRET`      | Jitsi JWT signing secret            | `jitsi-secret-key`               |
| `NODE_ENV`          | Node environment                    | `development`                    |

---

## Jitsi Config Directories

The `jitsi-config/` tree is mounted into the Jitsi containers at runtime. The directories are empty on first run — Jitsi auto-generates its configuration on startup. You can customise:

| Path                                        | Purpose                         |
|---------------------------------------------|---------------------------------|
| `jitsi-config/web/`                         | Jitsi Meet web app config       |
| `jitsi-config/prosody/config/`              | Prosody XMPP server config      |
| `jitsi-config/prosody/prosody-plugins-custom/` | Custom Prosody plugins       |
| `jitsi-config/jicofo/`                      | Jicofo conference focus config  |
| `jitsi-config/jvb/`                         | Jitsi Video Bridge config       |

---

## Notes

- **Hot reload**: The backend volume-mounts `./backend:/app` so source changes are reflected immediately in development (uses `node` directly — add `nodemon` for auto-restart).
- **Video calls**: Jitsi is configured without authentication (`ENABLE_AUTH=0`) so any participant can join a room by name. The backend generates `jitsiRoomId` per consultation.
- **Urgent queue**: Redis stores the urgent-matching queue. Vets are notified via Socket.io when a high-urgency request is created.
- **Payments**: The payment flow is mocked in seed data; integrate a real gateway (bKash, Nagad, Stripe) via the `Payment` model.

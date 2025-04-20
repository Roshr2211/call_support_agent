# Trip Booking Call Center

A backend system built with **Node.js**, **Express**, and **PostgreSQL** to support agents handling customer calls, bookings, and support interactions in a travel call center environment.

---

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS (optional)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Query Builder**: pg / pg-pool
- **Testing**: Postman

---

## Features

- Manage **calls**, **bookings**, **modification requests**, **customers**, **notes**
- Track call statuses and agent assignments
- Log and process booking changes
- Attach notes to bookings, calls, and customer profiles
- Support ticket-style flows for resolving customer issues

---

## Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/your-username/call_support_agent.git
cd call_suppport_agent
```

## Install dependencies
```bash
npm install
```

## Configure environment
Create a .env file in the root:
```bash
PORT=5000
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<database>
```

## Run server 
```bash
node server.js
```
Or nodemon
```bash
nodemon server.js
```
server runs at 5000

# Trip Booking Call Center API

A Node.js + Express backend API for managing agents, customers, calls, bookings, and notes in a call support system. PostgreSQL is used as the primary database. The service is Dockerized and deployable on platforms like Render.

## 🌐 Live API

**Base URL:**  
[https://call-support-agent.onrender.com](https://call-support-agent.onrender.com)

---

## 📦 API Endpoints

All endpoints are prefixed with `/api`.

### 👩‍💼 Agents

| Method | Endpoint                 | Description                           |
|--------|--------------------------|---------------------------------------|
| GET    | `/api/agents`            | Get all agents                        |
| GET    | `/api/agents/:id`        | Get agent by ID                       |
| PATCH  | `/api/agents/:id/status` | Update agent status                   |
| GET    | `/api/agents/:id/stats`  | Get agent call stats (by period)      |

**Query Parameters (for stats):**
- `period=day|week|month`

### 👥 Customers

| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | `/api/customers`      | Get all customers   |
| GET    | `/api/customers/:id`  | Get customer by ID  |

### 📞 Calls

| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| GET    | `/api/calls`       | Get all calls          |
| GET    | `/api/calls/:id`   | Get call by ID         |
| POST   | `/api/calls`       | Create a new call      |

### 📚 Bookings

| Method | Endpoint               | Description                |
|--------|------------------------|----------------------------|
| GET    | `/api/bookings`        | Get all bookings           |
| GET    | `/api/bookings/:id`    | Get booking by ID          |
| POST   | `/api/bookings`        | Create a new booking       |
| PATCH  | `/api/bookings/:id`    | Modify a booking (e.g., status or info) |

### 📝 Notes

| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| GET    | `/api/notes/customer/:id`         | Get all notes       |
| POST   | `/api/notes`         | Add a note          |

---




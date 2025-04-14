# Trip Booking Call Center

A backend system built with **Node.js**, **Express**, and **PostgreSQL** to support agents handling customer calls, bookings, and support interactions in a travel call center environment.

---

## 🛠 Tech Stack

- **Frontend**: Vite + React + Tailwind CSS (optional)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Query Builder**: pg / pg-pool
- **Testing**: Postman

---

## 📦 Features

- Manage **calls**, **bookings**, **modification requests**, **customers**, **notes**
- Track call statuses and agent assignments
- Log and process booking changes
- Attach notes to bookings, calls, and customer profiles
- Support ticket-style flows for resolving customer issues

---

## 🚀 Setup & Installation

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

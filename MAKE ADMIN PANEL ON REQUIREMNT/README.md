# NexVault Admin Panel

Premium admin dashboard built with Node.js, Express, MongoDB, EJS, and Bootstrap 5.

## Features

- Passport.js authentication (signup, login, logout, sessions)
- Forgot password with OTP via Nodemailer
- Dashboard with statistics and recent activity
- Profile management with avatar upload
- Full CRUD for Categories, Subcategories, Extra Categories, and Products
- Image upload with Multer
- Search, pagination, and sorting
- Cascading dropdowns for category hierarchy
- Flash messages and server-side validation
- Premium dark theme UI

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string

## Setup

```bash
cd project
npm install
```

Copy environment variables and update as needed:

```bash
copy .env.example .env
```

Edit `.env` with your MongoDB URI and SMTP credentials (required for forgot password OTP emails).

## Run

```bash
npm start
```

Development mode with auto-reload:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Login

1. Visit `/auth/signup` to create an admin account
2. Sign in at `/auth/login`
3. You'll be redirected to the dashboard

## Project Structure

```
project/
├── config/          Database, Passport, Mailer
├── controllers/     Business logic
├── middlewares/     Auth, upload, validation, errors
├── models/          Mongoose schemas
├── routes/          Express routers
├── views/           EJS templates
├── public/          CSS, JS, static assets
├── uploads/         Uploaded product/avatar images
└── server.js        Entry point
```

## SMTP Setup (Gmail Example)

1. Enable 2FA on your Google account
2. Generate an App Password
3. Set `SMTP_USER` and `SMTP_PASS` in `.env`

## Tech Stack

Node.js · Express · MongoDB · Mongoose · EJS · Bootstrap 5 · Passport · Multer · Nodemailer

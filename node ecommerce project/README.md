<div align="center">




> [!IMPORTANT]
> Use the following credentials to log in as **Admin** and access the full Admin Dashboard.

| Field | Value |
|-------|-------|
| 🌐 **Login URL** | `http://localhost:5173/login` |
| 📧 **Admin Email** | `admin@admin.com` |
| 🔒 **Password** | `admin@123` |

After logging in, you will be automatically redirected to the **Admin Dashboard** at `/admin` where you can manage products, categories, orders, and users.

---


<br/>

<!-- Badges -->
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-ISC-gold?style=for-the-badge)](LICENSE)

<br/>

> **✨ Wear The Moment** — A modern, full-featured fashion ecommerce platform built with the MERN stack, featuring Google OAuth, Razorpay payments, cloud image uploads, and a pixel-perfect premium UI.

<br/>



</div>

---

## 📸 Screenshots

| Home Page | Shop by Category | Product Page |
|-----------|-----------------|--------------|
| Hero carousel with animated slides | Vibrant category grid with hover effects | Detailed product view with size selection |

| Login / Auth | Admin Dashboard | Cart & Checkout |
|-------------|-----------------|-----------------|
| Split-panel with brand quote | Full CRUD management panel | Multi-step checkout with payment |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🛍️ Shopping Experience
- 🎠 **Hero Carousel** — Auto-rotating banner with 3 slides
- 🗂️ **Shop by Category** — Visual grid with hover animations
- 🔍 **Advanced Filtering** — By category, tag, price range
- ❤️ **Wishlist** — Save favourite items for later
- 🛒 **Smart Cart** — Persistent cart with size selection
- ⭐ **Product Tags** — New Arrivals, Best Sellers, Trending

</td>
<td width="50%">

### 🔐 Authentication & Users
- 📧 **Email / Password** login with bcrypt hashing
- 🔵 **Google OAuth 2.0** — One-click sign-in
- 🛡️ **JWT Tokens** — Secure session management
- 👤 **User Dashboard** — Order history & profile
- 📦 **Order Tracking** — Real-time status updates
- 🏠 **Address Management** — Multiple saved addresses

</td>
</tr>
<tr>
<td width="50%">

### 💳 Payments & Orders
- 💰 **Razorpay Integration** — Full payment gateway
- 🧾 **Order Management** — Admin can update statuses
- 📧 **Email Notifications** — Order confirmation via Nodemailer
- 🔒 **Secure Checkout** — Rate-limited & validated
- 📊 **Order Analytics** — Admin revenue tracking

</td>
<td width="50%">

### 🛠️ Admin Panel
- 📦 **Product CRUD** — Add, edit, delete products
- 🗂️ **Category Manager** — Manage all categories
- 👥 **User Management** — View all users & roles
- 🖼️ **ImageKit Upload** — Cloud image hosting
- 📈 **Dashboard Stats** — Sales, orders, users overview
- 🔑 **Role-based Access** — Admin-only routes

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
jyots-collection/
├── 📁 backend/                    # Node.js + Express API
│   ├── 📁 models/
│   │   ├── User.js               # User schema (auth, roles, addresses)
│   │   ├── Product.js            # Product schema (variants, tags, images)
│   │   ├── Order.js              # Order schema (items, payment, status)
│   │   └── Category.js           # Category schema (name, image)
│   ├── 📁 routes/
│   │   ├── authRoutes.js         # Register, login, Google OAuth, profile
│   │   ├── productRoutes.js      # CRUD products, search & filter
│   │   ├── orderRoutes.js        # Place order, update status, history
│   │   ├── paymentRoutes.js      # Razorpay order create & verify
│   │   ├── categoryRoutes.js     # CRUD categories
│   │   └── uploadRoutes.js       # ImageKit signed URL upload
│   ├── 📁 middleware/            # Auth guard, role check
│   ├── 📁 lib/                   # Helpers (email, etc.)
│   ├── 📁 services/              # Business logic layer
│   ├── 📁 scripts/               # CLI utilities (make-admin)
│   ├── 📁 data/                  # Seeder scripts
│   ├── server.js                 # Express app entry point
│   └── .env.example              # Environment variable template
│
└── 📁 frontend/                   # React 19 + Vite SPA
    ├── 📁 src/
    │   ├── 📁 pages/
    │   │   ├── HomePage.jsx       # Landing page with all sections
    │   │   ├── CategoryPage.jsx   # Product listing + filters
    │   │   ├── ProductPage.jsx    # Product detail + cart
    │   │   ├── CartPage.jsx       # Shopping cart
    │   │   ├── CheckoutPage.jsx   # Multi-step checkout
    │   │   ├── LoginPage.jsx      # Auth with Google OAuth
    │   │   ├── RegisterPage.jsx   # User registration
    │   │   ├── AdminPage.jsx      # Full admin dashboard
    │   │   ├── UserDashboardPage.jsx
    │   │   └── ...more pages
    │   ├── 📁 components/
    │   │   ├── Navbar.jsx         # Responsive nav + cart badge
    │   │   ├── ProductCard.jsx    # Reusable product card
    │   │   ├── HeroCarousel.jsx   # Auto-sliding hero
    │   │   ├── Footer.jsx         # Site footer
    │   │   └── Preloader.jsx      # Page load animation
    │   ├── 📁 context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── 📁 lib/
    │   │   └── api.js             # API base URL config
    │   └── index.css              # Full design system (CSS vars, utilities)
    └── vite.config.js
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI library with hooks |
| **Build Tool** | Vite 6 | Lightning-fast HMR dev server |
| **Styling** | Tailwind CSS v4 + Vanilla CSS | Design system & utilities |
| **Routing** | React Router v7 | Client-side navigation |
| **Icons** | React Icons (Feather) | Consistent icon set |
| **Backend** | Node.js + Express 5 | REST API server |
| **Database** | MongoDB + Mongoose | Document store & ODM |
| **Auth** | JWT + bcryptjs | Token-based auth |
| **OAuth** | Google Identity Services | Social login |
| **Payments** | Razorpay | Indian payment gateway |
| **Images** | ImageKit.io | Cloud image CDN |
| **Email** | Nodemailer | Transactional email |
| **Security** | Helmet + express-rate-limit | HTTP hardening & brute-force protection |
| **Deployment** | MongoDB Atlas | Cloud database |

---

## 🚀 Getting Started

## 🔑 Admin Credentials




### Prerequisites

Make sure you have these installed:

```bash
node --version   # v18 or higher
npm --version    # v9 or higher
```

You will also need accounts on:
- 🍃 [MongoDB Atlas](https://cloud.mongodb.com/) — Free tier works
- 🖼️ [ImageKit.io](https://imagekit.io/) — Free plan (20GB bandwidth)
- 💰 [Razorpay](https://razorpay.com/) — Test mode is free
- 🔵 [Google Cloud Console](https://console.cloud.google.com/) — OAuth credentials

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/jyots-collection.git
cd jyots-collection
```

---

### 2️⃣ Configure the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
# ─── Database ───────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/jyots-collection

# ─── Auth ───────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# ─── Google OAuth ───────────────────────────────────
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

# ─── Razorpay ───────────────────────────────────────
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# ─── ImageKit ───────────────────────────────────────
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# ─── Email (Nodemailer) ─────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# ─── Server ─────────────────────────────────────────
PORT=5000
NODE_ENV=development
```

---

### 3️⃣ Configure the Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
VITE_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxx
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

---

### 4️⃣ Seed the Database (Optional)

```bash
cd backend
npm run data:import    # Seeds products, categories, and sample data
```

To make yourself an admin after registering:

```bash
npm run make-admin     # Follow the CLI prompts
```

---

### 5️⃣ Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm start
# ✅ MongoDB Connected
# ✅ Server running on port 5000
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
# ✅ Local: http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser 🎉

---

## 📡 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create new user account |
| `POST` | `/login` | ❌ | Login with email & password |
| `POST` | `/google` | ❌ | Login / register via Google OAuth |
| `GET` | `/me` | ✅ JWT | Get current user profile |
| `PUT` | `/me` | ✅ JWT | Update profile info |
| `POST` | `/me/addresses` | ✅ JWT | Add a new address |
| `PUT` | `/me/addresses/:id` | ✅ JWT | Update an address |
| `DELETE` | `/me/addresses/:id` | ✅ JWT | Delete an address |

### Product Routes — `/api/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ | Get all products |
| `GET` | `/:id` | ❌ | Get single product |
| `POST` | `/` | ✅ Admin | Create a product |
| `PUT` | `/:id` | ✅ Admin | Update a product |
| `DELETE` | `/:id` | ✅ Admin | Delete a product |

### Order Routes — `/api/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/` | ✅ JWT | Place a new order |
| `GET` | `/my` | ✅ JWT | Get user's orders |
| `GET` | `/:id` | ✅ JWT | Get single order |
| `GET` | `/` | ✅ Admin | Get all orders |
| `PUT` | `/:id/status` | ✅ Admin | Update order status |

### Other Routes

| Route | Description |
|-------|-------------|
| `POST /api/payments/create-order` | Create Razorpay order |
| `POST /api/payments/verify` | Verify payment signature |
| `GET /api/categories` | List all categories |
| `POST /api/categories` | Create category (Admin) |
| `POST /api/upload/auth` | Get ImageKit upload auth |

---

## 🔒 Security Features

- 🛡️ **Helmet.js** — Sets secure HTTP headers
- 🚦 **Rate Limiting** — 30 auth attempts per 15 minutes per IP
- 🔐 **bcryptjs** — Password hashing with salt rounds
- 🎟️ **JWT** — Signed tokens with expiry
- 🔵 **Google Token Verification** — Server-side Google ID token validation
- 💳 **Razorpay Signature Verification** — HMAC-SHA256 payment verification
- 📝 **Input Validation** — Request validation on all endpoints

---

## 🌐 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay API secret |
| `IMAGEKIT_PUBLIC_KEY` | ✅ | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ✅ | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ✅ | Your ImageKit URL endpoint |
| `EMAIL_USER` | ⚠️ Optional | Gmail address for sending emails |
| `EMAIL_PASS` | ⚠️ Optional | Gmail App Password |
| `PORT` | ⚠️ Optional | Server port (default: 5000) |
| `NODE_ENV` | ⚠️ Optional | `development` or `production` |

---

## 📦 Available Scripts

### Backend

```bash
npm start              # Start production server
npm run data:import    # Seed the database with sample data
npm run make-admin     # Promote a user to admin role
```

### Frontend

```bash
npm run dev            # Start development server (http://localhost:5173)
npm run build          # Build production bundle to /dist
npm run preview        # Preview production build locally
```

---

## 🗺️ Roadmap

- [ ] 🔍 Full-text product search with filters
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 💬 Product reviews and ratings
- [ ] 🎁 Coupon / Discount code system
- [ ] 📊 Advanced admin analytics charts
- [ ] 🌍 Multi-currency support
- [ ] 📱 React Native mobile app

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

---

## 📄 License

This project is licensed under the **ISC License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by Sujit**

[![GitHub](https://img.shields.io/badge/GitHub-sujit1905-181717?style=for-the-badge&logo=github)](https://github.com/sujit1905)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,30&height=120&section=footer" width="100%"/>

</div>

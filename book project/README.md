# 📚 Book Management System

A full-stack **Node.js + Express + MongoDB** web application that allows you to manage a collection of books — with support for uploading book cover images, editing details, and deleting records.

---

## 🎬 Demo Video

> 📌 **Watch the full project walkthrough below:**

<!-- Replace the link below with your actual Google Drive video link -->
🔗 https://drive.google.com/file/d/1y3xmDvx7DhmnLYLaWz8whVDBlwL6a8QZ/view

---

## 🚀 Features

- 📖 View all books on the home page
- ➕ Add a new book with title, author, price, and cover image
- ✏️ Edit existing book details (with optional image replacement)
- 🗑️ Delete a book along with its uploaded image
- 🖼️ Image upload handled via **Multer** (stored locally in `/uploads`)
- 🎨 Dynamic views rendered using **EJS** templating engine

---

## 🛠️ Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Runtime      | Node.js                 |
| Framework    | Express.js v5           |
| Database     | MongoDB (via Mongoose)  |
| View Engine  | EJS                     |
| File Upload  | Multer                  |
| Environment  | dotenv                  |

---

## 📁 Project Structure

```
book-project/
├── app.js                   # Entry point — sets up Express server
├── .env                     # Environment variables (MongoDB URI, etc.)
├── config/
│   └── db.js                # MongoDB connection setup
├── models/
│   └── book.model.js        # Mongoose schema for Book
├── controllers/
│   └── book.contro.js       # Business logic (CRUD operations)
├── routes/
│   └── book.route.js        # Express routes + Multer middleware
├── views/
│   ├── index.ejs            # Home page — displays all books
│   └── edit.ejs             # Edit page — update a book
├── uploads/                 # Uploaded book cover images (auto-generated)
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local or Atlas cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/book-project.git
cd book-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your MongoDB connection string:

```env
MONGO_URI=mongodb://localhost:27017/bookdb
```

### 4. Run the Application

```bash
node app.js
```

The server will start on **http://localhost:3000**

---

## 🔗 API Routes

| Method | Route            | Description                    |
|--------|------------------|--------------------------------|
| GET    | `/`              | Display all books              |
| POST   | `/uploads`       | Add a new book with image      |
| GET    | `/edit/:id`      | Show edit form for a book      |
| POST   | `/update/:id`    | Update book details/image      |
| POST   | `/delete/:id`    | Delete a book and its image    |

---

## 📦 Dependencies

```json
{
  "express": "^5.2.1",
  "mongoose": "^9.6.2",
  "ejs": "^5.0.2",
  "multer": "^2.1.1",
  "dotenv": "^17.4.2",
  "qs": "^6.15.2"
}
```

---

## 🖼️ How Image Upload Works

- **Multer** middleware intercepts `multipart/form-data` requests
- Images are saved to the `./uploads` folder with a **timestamp-based filename**
- When a book is **updated**, the old image file is automatically deleted from disk
- When a book is **deleted**, the associated image file is also removed from disk

---

## 👨‍💻 Author

**Sujit** — Built as part of the Node.js learning journey 🚀

---

## 📄 License

This project is licensed under the **ISC License**.

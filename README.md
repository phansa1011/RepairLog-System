# RepairLog-System (ระบบบันทึกการซ่อม)

## คำอธิบายระบบ
ระบบบันทึกการซ่อมอุปกรณ์เป็นเว็บแอปพลิเคชันที่ใช้สำหรับจัดการข้อมูลการซ่อมอุปกรณ์
โดยสามารถบันทึกข้อมูลอุปกรณ์ อะไหล่ สถานที่ พนักงาน และประวัติการซ่อมได้อย่างเป็นระบบ

พัฒนาด้วย React + Vite + Express.js + SQLite + Tailwind CSS

---

## Tech Stack
### Frontend
- React
- React Router DOM
- TanStack React Query
- Tailwind CSS
- Chart.js / Recharts
- Lucide React

### Backend
- Node.js
- Express.js
- JWT Authentication

### Database
- SQLite

---

## โครงสร้างโปรเจกต์
```
root/
├── frontend/
|   ├── src/
|   |   ├── api/
|   |   ├── components/
|   |   ├── lib/
|   |   ├── pages/
|   |   ├── utils/
|   |   ├── App.jsx
|   |   ├── index.css
|   |   ├── Layout.jsx
|   |   ├── main.jsx
|   |   └── pages.config.js
|   ├── postcss.config.js
|   ├── tailwind.config.js
|   └── vite.config.js
└── Backend/
    ├── controllers/
    ├── db/
    ├── middleware
    ├── routes
    └── server.js
```

## Installation ติดตั้ง

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/phansa1011/RepairLog-System.git
cd RepairLog-System
```

### 2. ติดตั้ง Dependencies

```bash
# ติดตั้ง Backend
cd backend
npm install

# ติดตั้ง Frontend
cd ../frontend
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ backend

```env
USERNAME=your_username
PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### 4. รันระบบ

```bash
# รัน Backend
node server.js

# รัน Frontend (อีก terminal)
cd frontend 
npm start
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

---

## Database Schema

## API Endpoints

## User Guide

## System Flow

## Notes

This project was developed as part of a computer science internship project.
โครงการนี้พัฒนาขึ้นเป็นส่วนหนึ่งของการฝึกงานในสาขาวิทยาการคอมพิวเตอร์
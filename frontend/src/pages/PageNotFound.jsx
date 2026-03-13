import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

      <p className="text-xl text-gray-600 mb-2">
        ไม่พบหน้าที่คุณกำลังค้นหา
      </p>

      <p className="text-gray-500 mb-6">
        หน้านี้อาจถูกลบ ย้าย หรือพิมพ์ URL ผิด
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-yellow-400 text-black rounded-lg shadow hover:bg-yellow-500 transition"
      >
        กลับหน้าแรก
      </Link>

    </div>
  );
}
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">404 - الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-4">
          الصفحة التي تبحث عنها غير موجودة
        </p>
        <Link 
          href="/"
          className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  )
}


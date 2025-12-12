"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-center mb-4">حدث خطأ</h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              {error?.message || "حدث خطأ غير معروف"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}


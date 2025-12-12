"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center bg-white rounded-lg shadow-md p-6 max-w-md">
            <h2 className="text-2xl font-bold mb-4">حدث خطأ خطير</h2>
            <p className="text-gray-600 mb-4">{error?.message || "خطأ غير معروف"}</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}


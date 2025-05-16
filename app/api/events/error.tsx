"use client"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded">
      <h2 className="text-red-700 font-bold">Error</h2>
      <p className="text-red-600">{error.message}</p>
      <button 
        onClick={reset}
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Try Again
      </button>
    </div>
  )
}
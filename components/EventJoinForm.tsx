/* eslint-disable @typescript-eslint/no-unused-vars */
// components/EventJoinForm.tsx
"use client"

import { joinEvent } from "@/lib/actions/join-event"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils" // Optional utility for conditional classnames

export default function EventJoinForm({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: ""
  })
  const [status, setStatus] = useState({ success: false, message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ success: false, message: "" })
    setIsSubmitting(true)
    
    try {
      const result = await joinEvent({ eventId, ...formData })
      
      if (result.success) {
        setStatus({ 
          success: true, 
          message: "You've successfully joined the event! A confirmation has been sent to your email." 
        })
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          department: ""
        })
        router.refresh()
      } else {
        setStatus({ 
          success: false, 
          message: result.message || "Registration failed. Please try again." 
        })
      }
    } catch (error) {
      setStatus({ 
        success: false, 
        message: "An unexpected error occurred. Please try again later." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden animate-fade-in">
      <div className="p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join the Event</h2>
          <p className="text-gray-500 text-sm">Fill in your information below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["firstName", "lastName"].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                  {field === "firstName" ? "First Name" : "Last Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  id={field}
                  type="text"
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={`Enter your ${field === "firstName" ? "first" : "last"} name`}
                />
              </div>
            ))}
          </div>

          {["email", "department"].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                {field === "email" ? "Email" : "Department"} <span className="text-red-500">*</span>
              </label>
              <input
                id={field}
                type={field === "email" ? "email" : "text"}
                value={formData[field as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={field === "email" ? "your.email@example.com" : "Your department"}
              />
            </div>
          ))}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full py-4 px-6 rounded-xl text-white font-semibold shadow-sm transition-all duration-200",
                isSubmitting 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Registering...
                </span>
              ) : 'Register Now'}
            </button>
          </div>

          {status.message && (
            <div
              className={cn(
                "p-4 rounded-xl border text-sm transition-all duration-300",
                status.success 
                  ? "bg-green-50 text-green-800 border-green-200" 
                  : "bg-red-50 text-red-800 border-red-200"
              )}
            >
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  {status.success ? (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  )}
                </svg>
                <p>{status.message}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-500">
          We respect your privacy. Your data is only used for this event.
        </p>
      </div>
    </div>
  )
}

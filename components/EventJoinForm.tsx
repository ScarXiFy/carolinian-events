// components/EventJoinForm.tsx
"use client"

import { joinEvent } from "@/lib/actions/join-event"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function EventJoinForm({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: ""
  })
  const [status, setStatus] = useState({ success: false, message: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ success: false, message: "" })
    
    const result = await joinEvent({ eventId, ...formData })
    
    if (result.success) {
      setStatus({ success: true, message: "Successfully joined the event!" })
      router.refresh()
    } else {
      setStatus({ success: false, message: result.message || "Failed to join event" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          required
        />
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      <div>
        <label htmlFor="department">Department</label>
        <input
          id="department"
          type="text"
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
          required
        />
      </div>
      <button type="submit">Join Event</button>
      {status.message && (
        <p className={status.success ? "text-green-500" : "text-red-500"}>
          {status.message}
        </p>
      )}
    </form>
  )
}
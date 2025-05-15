"use client"

import { CreateEventForm } from "@/components/create-event-form"

export default function CreateEventPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <CreateEventForm />
    </div>
  )
}
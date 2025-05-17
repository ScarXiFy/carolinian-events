"use client"

import { CreateEventForm } from "@/components/create-event-form"

export default function CreateEventPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-stretch justify-stretch">
      {/* USC Background Image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-100 animate-bg-zoom bg-[url('/usc-background.png')]" />
      {/* White to Green Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#b7e4c7] to-[#40916c] opacity-90 animate-gradient-move" />
      {/* Page Content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-screen w-full items-stretch justify-stretch animate-fade-in-slow">
        <div className="w-full max-w-5xl bg-white/80 rounded-xl shadow-md border border-gray-200 backdrop-blur-md px-6 py-6 mt-8 mb-10 flex flex-col items-center mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#40916c] tracking-tight text-center drop-shadow-sm animate-fade-in-up">
            <span className="inline-block align-middle mr-2">📝</span>
            Create New Event
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          <CreateEventForm />
        </div>
      </div>
    </div>
  )
}
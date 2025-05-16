'use client'

import { Calendar, PlusCircle, Users } from "lucide-react"
import Slider from "react-slick"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeButtons } from "@/components/HomeButtons"

export default function Home() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000
  }

  return (
  <div className="relative min-h-screen overflow-hidden">
    {/* USC Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-100"
      style={{ backgroundImage: "url('/usc-background.png')" }}
    ></div>

    {/* White to Green Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-white via-[#b7e4c7] to-[#40916c] opacity-90"></div>

    {/* Page Content */}
    <div className="relative z-10 text-gray-900">
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-4 py-12 md:py-20">
        <h1
          className="text-center text-7xl font-bold tracking-tight"
          style={{ color: "#fec425" }}
        >
          Carolinian Events Tracker
        </h1>
        <p className="max-w-[750px] text-center text-lg text-gray-800 sm:text-xl">
          Carolinian Events helps you find, manage, and create events in your community. Join us today!
        </p>
        <HomeButtons />
        <div className="flex flex-wrap items-center justify-center gap-4 py-6">
        </div>
      </section>

      {/* Carousel Section */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <Slider {...settings}>
          {/* Card 1: Find Events */}
          <div>
            <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-transform hover:scale-[1.02]">
              <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-1">
                  <Calendar className="text-[#fec425] w-6 h-6" />
                  <CardTitle className="text-xl font-semibold text-[#fec425]">Find Events</CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-500 mb-2">
                  Discover exciting events near you
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-700 text-base text-center leading-relaxed">
                Browse through events happening in the Carolinian Community.
              </CardContent>
            </Card>
          </div>

          {/* Card 2: Create Events */}
          <div>
            <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-transform hover:scale-[1.02]">
              <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-1">
                  <PlusCircle className="text-[#fec425] w-6 h-6" />
                  <CardTitle className="text-xl font-semibold text-[#fec425]">Create Events</CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-500 mb-2">
                  Host your own events
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-700 text-base text-center leading-relaxed">
                Easily create and manage your own events with our simple tools.
              </CardContent>
            </Card>
          </div>

          {/* Card 3: Connect */}
          <div>
            <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-transform hover:scale-[1.02]">
              <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2 mb-1">
                  <Users className="text-[#fec425] w-6 h-6" />
                  <CardTitle className="text-xl font-semibold text-[#fec425]">Connect</CardTitle>
                </div>
                <CardDescription className="text-sm text-gray-500 mb-2">
                  Meet new people
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-700 text-base text-center leading-relaxed">
                Connect with like-minded individuals in your community.
              </CardContent>
            </Card>
          </div>
        </Slider>
      </section>
    </div>
  </div>
)
}

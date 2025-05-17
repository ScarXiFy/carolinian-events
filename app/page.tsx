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
  <div className="relative min-h-screen overflow-hidden flex flex-col items-stretch justify-stretch">
    {/* USC Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center opacity-100 animate-bgFloat"
      style={{ backgroundImage: "url('/usc-background.png')" }}
    ></div>

    {/* White to Green Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-white via-[#b7e4c7] to-[#40916c] opacity-90"></div>

    {/* Page Content */}
    <div className="relative z-10 flex flex-col flex-1 min-h-screen w-full items-stretch justify-stretch">
      <section className="flex-1 flex flex-col items-center justify-center w-full h-full gap-4 p-0 m-0">
        <h1
          className="text-center text-5xl md:text-7xl font-bold tracking-tight animate-fadeInUp bg-gradient-to-r from-[#fec425] via-[#ffd700] to-[#52b788] bg-clip-text text-transparent drop-shadow-lg animate-shimmer mb-4 md:mb-8"
          style={{}}
        >
          Carolinian Events Tracker
        </h1>
        <p className="max-w-2xl w-full text-center text-lg text-gray-800 sm:text-xl animate-fadeInUp delay-200 mx-auto">
          Carolinian Events helps you find, manage, and create events in your community. Join us today!
        </p>
        <div className="animate-fadeInUp delay-300 w-full flex justify-center">
          <HomeButtons />
        </div>
      </section>

      {/* Carousel Section */}
      <section className="flex-1 flex items-center justify-center w-full px-0 pb-0 animate-fadeInUp delay-400">
        <div className="w-full max-w-5xl">
          <Slider {...settings}>
            {/* Card 1: Find Events */}
            <div>
              <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-transform hover:scale-[1.02] animate-cardIn">
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
              <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-transform hover:scale-[1.02] animate-cardIn delay-100">
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
              <Card className="bg-white border border-gray-200 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-transform hover:scale-[1.02] animate-cardIn delay-200">
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
        </div>
      </section>
    </div>
  </div>
)
}

// Tailwind CSS custom animations (add to your global CSS if not present)
// @layer utilities {
//   .animate-fadeInUp {
//     @apply opacity-0 translate-y-8 animate-[fadeInUp_0.8s_ease-out_forwards];
//   }
//   .animate-cardIn {
//     @apply opacity-0 scale-95 animate-[cardIn_0.7s_ease-out_forwards];
//   }
//   .animate-bgFloat {
//     @apply animate-[bgFloat_10s_ease-in-out_infinite_alternate];
//   }
//   .animate-shimmer {
//     @apply animate-[shimmer_2.5s_linear_infinite];
//   }
// }
// @keyframes fadeInUp {
//   to { opacity: 1; transform: none; }
// }
// @keyframes cardIn {
//   to { opacity: 1; transform: none; }
// }
// @keyframes bgFloat {
//   0% { transform: scale(1) translateY(0); }
//   100% { transform: scale(1.03) translateY(-10px); }
// }
// @keyframes shimmer {
//   0% { background-position: -500px 0; }
//   100% { background-position: 500px 0; }
// }

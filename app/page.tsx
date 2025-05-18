'use client'

import { Calendar, PlusCircle, Users } from "lucide-react"
import Slider from "react-slick"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HomeButtons } from "@/components/HomeButtons"
import { motion } from "framer-motion"
import { staggerContainer, textVariant } from "@/utils/motion"
import { Typewriter } from "react-simple-typewriter"

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
      {/* USC Background Image with subtle zoom animation */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center opacity-100"
        style={{ backgroundImage: "url('/usc-background.png')" }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      ></motion.div>

      {/* White to Green Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#b7e4c7] to-[#40916c] opacity-90"></div>

      {/* Page Content */}
      <div className="relative z-10 text-gray-900">
        <motion.section 
          variants={staggerContainer(0.1, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto flex max-w-[980px] flex-col items-center gap-4 py-12 md:py-20"
        >
          <motion.h1
            variants={textVariant(0.4)}
            className="text-center text-7xl font-bold tracking-tight"
            style={{ color: "#fec425" }}
          >
            Carolinian Events Tracker
          </motion.h1>
          
          <motion.p
  variants={textVariant(0.6)}
  className="max-w-[750px] text-center text-lg text-gray-800 sm:text-xl"
>
  <span className="text-gray-800">
    <Typewriter
      words={[
        "Carolinian Events helps you find, manage, and create events in your community. Join us today!"
      ]}
      loop={0} // or use `true` for infinite loop
      cursor
      cursorStyle="|"
      typeSpeed={40}
      deleteSpeed={30}
      delaySpeed={1500}
    />
  </span>
</motion.p>
          
          <motion.div variants={textVariant(0.8)}>
            <HomeButtons />
          </motion.div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 py-6">
          </div>
        </motion.section>

        {/* Carousel Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 pb-20"
        >
          <Slider {...settings}>
            {/* Card 1: Find Events */}
<div>
  <motion.div 
    whileHover={{ y: -10 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-colors duration-300">

      <CardHeader className="text-center">
        <motion.div 
          className="flex justify-center items-center gap-2 mb-1"
          whileHover={{ scale: 1.05 }}
        >
          <Calendar className="text-[#fec425] w-6 h-6" />
          <CardTitle className="text-xl font-semibold text-[#fec425]">Find Events</CardTitle>
        </motion.div>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Discover exciting events near you
        </CardDescription>
      </CardHeader>
      <CardContent className="text-gray-700 dark:text-gray-300 text-base text-center leading-relaxed">
        Browse through events happening in the Carolinian Community.
      </CardContent>
    </Card>
  </motion.div>
</div>

{/* Card 2: Create Events */}
<div>
  <motion.div 
    whileHover={{ y: -10 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-colors duration-300">

      <CardHeader className="text-center">
        <motion.div 
          className="flex justify-center items-center gap-2 mb-1"
          whileHover={{ scale: 1.05 }}
        >
          <PlusCircle className="text-[#fec425] w-6 h-6" />
          <CardTitle className="text-xl font-semibold text-[#fec425]">Create Events</CardTitle>
        </motion.div>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Host your own events
        </CardDescription>
      </CardHeader>
      <CardContent className="text-gray-700 dark:text-gray-300 text-base text-center leading-relaxed">
        Easily create and manage your own events with our simple tools.
      </CardContent>
    </Card>
  </motion.div>
</div>

{/* Card 3: Connect */}
<div>
  <motion.div 
    whileHover={{ y: -10 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl rounded-3xl p-6 mx-4 transition-colors duration-300">

      <CardHeader className="text-center">
        <motion.div 
          className="flex justify-center items-center gap-2 mb-1"
          whileHover={{ scale: 1.05 }}
        >
          <Users className="text-[#fec425] w-6 h-6" />
          <CardTitle className="text-xl font-semibold text-[#fec425]">Connect</CardTitle>
        </motion.div>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Meet new people
        </CardDescription>
      </CardHeader>
      <CardContent className="text-gray-700 dark:text-gray-300 text-base text-center leading-relaxed">
        Connect with like-minded individuals in your community.
      </CardContent>
    </Card>
  </motion.div>
</div>

          </Slider>
        </motion.section>
      </div>
    </div>
  )
}
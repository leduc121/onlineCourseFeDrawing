import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import heroImage from '../assets/hero.jpg';

export function Hero() {
  return <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12 px-4 overflow-hidden">
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* Text Content - Asymmetric Layout (Left side, spans 5 cols) */}
      <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8,
        ease: 'easeOut'
      }} className="lg:col-span-5 order-2 lg:order-1 z-10">
        <span className="inline-block py-1 px-3 border border-editorial-text/30 rounded-full text-xs font-medium tracking-wider uppercase mb-6 text-editorial-subtle">
          Creative Kids • Art Studio
        </span>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6 text-editorial-text">
          Unleash <br />
          <span className="italic font-normal text-editorial-accent">
            Your Child's
          </span>{' '}
          Creativity
        </h1>
        <p className="text-lg md:text-xl text-editorial-subtle mb-8 leading-relaxed max-w-md font-light">
          Inspiring art courses designed to nurture imagination and confidence.
          From watercolors to digital art, we guide young artists on their creative journey.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <a href="/courses">
            <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} className="px-8 py-4 bg-editorial-text text-[#faf8f5] text-sm tracking-wide font-medium hover:bg-editorial-accent transition-colors duration-300 flex items-center gap-2">
              Explore Catalogue <ArrowRight size={16} />
            </motion.button>
          </a>
          <a href="#philosophy" className="text-sm font-medium border-b border-editorial-text/30 pb-1 hover:border-editorial-text transition-colors">
            Our Philosophy
          </a>
        </div>
      </motion.div>
      <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 1,
        delay: 0.2,
        ease: 'easeOut'
      }} className="lg:col-span-7 order-1 lg:order-2 relative">
        <div className="relative aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] overflow-hidden rounded-lg shadow-2xl bg-orange-50">
          <img src={heroImage} alt="Happy child painting" className="w-full h-full object-cover transition-all duration-1000 ease-out" />

          <div className="absolute bottom-8 left-8 text-white z-10 hidden md:block">
            <p className="text-sm uppercase tracking-widest mb-1 opacity-90 font-medium">
              New Course
            </p>
            <p className="font-serif text-2xl drop-shadow-md">Watercolor Magic for Beginners</p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>;
}
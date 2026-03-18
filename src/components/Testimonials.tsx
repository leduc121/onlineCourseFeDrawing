import React from 'react';
import { motion } from 'framer-motion';
export function Testimonials() {
  return <section className="py-24 px-4 bg-[#f2efe9]">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} whileInView={{
        opacity: 1,
        scale: 1
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8
      }} className="relative py-12 md:py-20 text-center">
          <span className="text-6xl md:text-8xl font-serif text-editorial-accent/20 absolute top-0 left-0 md:left-20 -translate-y-1/2">
            "
          </span>

          <blockquote className="relative z-10">
            <p className="text-3xl md:text-5xl font-italic-serif leading-tight text-editorial-text mb-8 md:mb-12 max-w-4xl mx-auto">
              Every child is an artist. The problem is how to remain an artist
              once we grow up.
            </p>
            <footer className="flex flex-col items-center justify-center space-y-2">
              <cite className="not-italic text-lg font-bold font-serif tracking-wide">
                Pablo Picasso
              </cite>
              <span className="text-sm text-editorial-subtle uppercase tracking-widest">
                Spanish Painter & Sculptor
              </span>
            </footer>
          </blockquote>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 border-t border-editorial-border pt-20">
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="flex flex-col gap-4">
            <p className="font-italic-serif text-2xl text-editorial-text leading-relaxed">
              "I dream of painting and then I paint my dream."
            </p>
            <div>
              <p className="font-serif font-bold">Vincent van Gogh</p>
              <p className="text-xs text-editorial-subtle uppercase tracking-widest">
                Dutch Post-Impressionist
              </p>
            </div>
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          x: 20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} className="flex flex-col gap-4 md:text-right md:items-end">
            <p className="font-italic-serif text-2xl text-editorial-text leading-relaxed">
              "Creativity takes courage."
            </p>
            <div>
              <p className="font-serif font-bold">Henri Matisse</p>
              <p className="text-xs text-editorial-subtle uppercase tracking-widest">
                French Visual Artist
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}
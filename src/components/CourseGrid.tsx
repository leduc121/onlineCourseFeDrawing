import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
interface Course {
  id: number;
  title: string;
  instructor: string;
  category: string;
  price: string;
  image: string;
  large?: boolean;
}
const courses: Course[] = [{
  id: 1,
  title: 'Watercolor Magic: Painting with Colors',
  instructor: 'Ms. Lan Anh',
  category: 'Watercolor',
  price: '$49',
  image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop',
  large: true
}, {
  id: 2,
  title: 'Cartoon Drawing for Kids',
  instructor: 'Mr. Minh Tuan',
  category: 'Drawing',
  price: '$39',
  image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1974&auto=format&fit=crop',
  large: false
}, {
  id: 3,
  title: 'Portrait Art: Drawing Faces',
  instructor: 'Ms. Thu Ha',
  category: 'Portrait',
  price: '$45',
  image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1973&auto=format&fit=crop',
  large: false
}, {
  id: 4,
  title: 'Digital Art & Illustration',
  instructor: 'Mr. Hoang',
  category: 'Digital Art',
  price: '$55',
  image: 'https://images.unsplash.com/photo-1551732998-9d98c4e6e0d4?q=80&w=2070&auto=format&fit=crop',
  large: false
}, {
  id: 5,
  title: 'Creative Clay Sculpting',
  instructor: 'Ms. Mai',
  category: 'Sculpture',
  price: '$42',
  image: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?q=80&w=2069&auto=format&fit=crop',
  large: true
}];
export function CourseGrid() {
  return <section id="courses" className="py-24 px-4 bg-editorial-bg border-t border-editorial-border">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-16 border-b border-editorial-text pb-4">
        <h2 className="text-4xl md:text-5xl font-serif text-editorial-text">
          Curated Curriculum
        </h2>
        <a href="#" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-editorial-accent transition-colors">
          View Full Catalogue <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[400px]">
        {courses.map((course, index) => <motion.div key={course.id} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} className={`group relative flex flex-col ${course.large ? 'md:col-span-2' : 'col-span-1'}`}>
          <div className="relative flex-grow overflow-hidden mb-4">
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />
            <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            <span className="absolute top-4 left-4 bg-[#faf8f5] px-3 py-1 text-xs uppercase tracking-widest font-medium z-20">
              {course.category}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <div className="max-w-[80%]">
              <h3 className="text-2xl font-serif leading-tight mb-1 group-hover:text-editorial-accent transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-editorial-subtle font-medium">
                with {course.instructor}
              </p>
            </div>
            <span className="text-lg font-serif italic">
              {course.price}
            </span>
          </div>
        </motion.div>)}
      </div>

      <div className="mt-12 text-center md:hidden">
        <a href="#" className="inline-flex items-center gap-2 text-sm font-medium border-b border-editorial-text pb-1">
          View Full Catalogue <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  </section>;
}
import React from 'react';
import { motion } from 'framer-motion';
const instructors = [{
  name: 'Ms. Lan Anh',
  role: 'Watercolor & Painting Specialist',
  bio: 'With over 15 years of experience teaching children\'s art, Ms. Lan Anh specializes in watercolor techniques and creative expression. Her gentle approach helps young artists discover their unique artistic voice.',
  image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop'
}, {
  name: 'Mr. Minh Tuan',
  role: 'Illustration & Cartoon Artist',
  bio: 'A professional illustrator and children\'s book artist, Mr. Minh Tuan brings joy and creativity to every class. He has published over 20 children\'s books and loves teaching kids to bring their imagination to life.',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop'
}, {
  name: 'Ms. Thu Ha',
  role: 'Fine Arts & Creative Development',
  bio: 'Graduated from the Vietnam University of Fine Arts, Ms. Thu Ha specializes in nurturing creativity in children. Her classes focus on building confidence and artistic skills through fun, engaging projects.',
  image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2070&auto=format&fit=crop'
}];
export function InstructorFeature() {
  return <section id="instructors" className="py-24 px-4 bg-editorial-bg">
    <div className="max-w-7xl mx-auto">
      <div className="mb-16 max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-serif text-editorial-text mb-6">
          Distinguished Faculty
        </h2>
        <p className="text-lg text-editorial-subtle leading-relaxed">
          We believe that mastery is best taught by those who have lived it.
          Our instructors are not just teachers; they are pioneering
          practitioners in their fields.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {instructors.map((instructor, index) => <motion.div key={instructor.name} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: index * 0.2
        }} className="flex flex-col">
          <div className="aspect-[3/4] overflow-hidden mb-6 transition-all duration-700">
            <img src={instructor.image} alt={instructor.name} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-2xl font-serif font-bold mb-1">
            {instructor.name}
          </h3>
          <p className="text-xs uppercase tracking-widest text-editorial-accent mb-4">
            {instructor.role}
          </p>
          <p className="text-editorial-subtle leading-relaxed font-light">
            {instructor.bio}
          </p>
        </motion.div>)}
      </div>
    </div>
  </section>;
}
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
export function PricingTable() {
  return <section id="pricing" className="py-24 px-4 bg-[#faf8f5] border-t border-editorial-border">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-serif text-editorial-text mb-4">
          Membership
        </h2>
        <p className="text-editorial-subtle max-w-xl mx-auto">
          Invest in your intellectual growth. Choose the tier that best suits
          your professional journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-editorial-border border border-editorial-border">
        {/* Basic Plan */}
        <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} className="bg-[#faf8f5] p-8 md:p-12 hover:bg-white transition-colors duration-300 flex flex-col h-full">
          <div className="mb-8">
            <h3 className="text-xl font-serif font-bold mb-2">Little Artist</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-serif">$9.99</span>
              <span className="text-sm text-editorial-subtle">/month</span>
            </div>
            <p className="text-sm text-editorial-subtle leading-relaxed">
              Perfect for beginners to start their creative journey.
            </p>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            {['Access to 2 basic courses/mo', 'Free coloring pages', 'Community gallery access'].map(feature => <li key={feature} className="flex items-start gap-3 text-sm">
              <Check size={16} className="text-editorial-accent mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>)}
          </ul>
          <Link to="/register" className="block text-center w-full py-3 border border-editorial-text text-editorial-text hover:bg-editorial-text hover:text-white transition-all duration-300 text-sm font-medium tracking-wide">
            Start Creating
          </Link>
        </motion.div>

        {/* Recommended Plan */}
        <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }} className="bg-[#faf8f5] p-8 md:p-12 hover:bg-white transition-colors duration-300 flex flex-col h-full relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-editorial-accent"></div>
          <div className="mb-8">
            <span className="text-xs font-bold text-editorial-accent uppercase tracking-widest mb-2 block">
              Most Popular
            </span>
            <h3 className="text-xl font-serif font-bold mb-2">Creative Studio</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-serif">$19.99</span>
              <span className="text-sm text-editorial-subtle">/month</span>
            </div>
            <p className="text-sm text-editorial-subtle leading-relaxed">
              Unlock your full potential with unlimited learning.
            </p>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            {['Unlimited course access', 'Monthly live kid workshops', 'Teacher feedback on upload', 'Digital Certificate'].map(feature => <li key={feature} className="flex items-start gap-3 text-sm">
              <Check size={16} className="text-editorial-accent mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>)}
          </ul>
          <Link to="/register" className="block text-center w-full py-3 bg-editorial-text text-white hover:bg-editorial-accent transition-all duration-300 text-sm font-medium tracking-wide">
            Join the Studio
          </Link>
        </motion.div>

        {/* Premium Plan */}
        <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }} className="bg-[#faf8f5] p-8 md:p-12 hover:bg-white transition-colors duration-300 flex flex-col h-full">
          <div className="mb-8">
            <h3 className="text-xl font-serif font-bold mb-2">Masterpiece Pro</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-serif">$49.99</span>
              <span className="text-sm text-editorial-subtle">/month</span>
            </div>
            <p className="text-sm text-editorial-subtle leading-relaxed">
              For dedicated young artists who want professional guidance.
            </p>
          </div>
          <ul className="space-y-4 mb-8 flex-grow">
            {['Everything in Creative Studio', '1-on-1 mentorship (2h/session, 3x/week)', 'Quarterly Art Kit delivery', 'Offline video downloads'].map(feature => <li key={feature} className="flex items-start gap-3 text-sm">
              <Check size={16} className="text-editorial-accent mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>)}
          </ul>
          <Link to="/register" className="block text-center w-full py-3 border border-editorial-text text-editorial-text hover:bg-editorial-text hover:text-white transition-all duration-300 text-sm font-medium tracking-wide">
            Go Pro
          </Link>
        </motion.div>
      </div>
    </div>
  </section>;
}
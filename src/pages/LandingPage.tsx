import React from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { CourseGrid } from '../components/CourseGrid';
import { Testimonials } from '../components/Testimonials';
import { InstructorFeature } from '../components/InstructorFeature';
import { PricingTable } from '../components/PricingTable';
import { ContactSection } from '../components/ContactSection';
export function LandingPage() {
  return <div className="min-h-screen bg-editorial-bg text-editorial-text font-sans selection:bg-editorial-accent/20">
    <main>
      <Hero />
      <CourseGrid />
      <Testimonials />
      <InstructorFeature />
      <PricingTable />
      <ContactSection />
    </main>

    <footer className="bg-[#1a1a1a] text-[#faf8f5] py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-serif font-bold mb-6">ArtAcademy.</h2>
          <p className="text-gray-400 max-w-sm font-light leading-relaxed">
            An editorial approach to art education for children. We nurture
            young artists with expert guidance and creative freedom.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">
            Platform
          </h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li>
              <Link to="/courses" className="hover:text-white transition-colors">
                Browse Courses
              </Link>
            </li>
            <li>
              <a href="#instructors" className="hover:text-white transition-colors">
                Instructors
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">
            Company
          </h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <a href="#contact" className="hover:text-white transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>&copy; 2026 ArtAcademy. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  </div>;
}
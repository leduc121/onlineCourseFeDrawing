import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from './ui/Button';

export function ContactSection() {
    return (
        <section id="contact" className="py-24 px-4 bg-white border-t border-editorial-border">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif text-editorial-text mb-4">
                        Get in Touch
                    </h2>
                    <p className="text-editorial-subtle max-w-xl mx-auto">
                        Have questions about our courses or membership? We're here to guide your
                        artistic journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <h3 className="text-2xl font-serif font-bold text-editorial-text border-b border-editorial-border pb-4">
                            Contact Information
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-editorial-bg flex items-center justify-center border border-editorial-border shrink-0">
                                    <Mail className="text-editorial-text" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Email Us</h4>
                                    <p className="text-editorial-subtle mb-1">Our friendly team is here to help.</p>
                                    <a href="mailto:hello@artacademy.com" className="text-editorial-accent font-medium hover:underline">
                                        hello@artacademy.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-editorial-bg flex items-center justify-center border border-editorial-border shrink-0">
                                    <MapPin className="text-editorial-text" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Visit Us</h4>
                                    <p className="text-editorial-subtle mb-1">Come say hello at our studio.</p>
                                    <p className="text-editorial-text">
                                        Lot E2a-7, D1 Street, High-Tech Park<br />
                                        , Long Thanh My Ward, Thu Duc City
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-editorial-bg flex items-center justify-center border border-editorial-border shrink-0">
                                    <Phone className="text-editorial-text" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">Call Us</h4>
                                    <p className="text-editorial-subtle mb-1">Mon-Fri from 8am to 5pm.</p>
                                    <a href="tel:+84901430379" className="text-editorial-text font-medium hover:text-editorial-accent transition-colors">
                                        +84 901 430 379
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-editorial-bg p-8 md:p-10 border border-editorial-border">
                        <h3 className="text-2xl font-serif font-bold text-editorial-text mb-6">
                            Send us a Message
                        </h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-bold text-editorial-text mb-2 tracking-wide uppercase">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        className="w-full px-4 py-3 bg-white border border-editorial-border focus:border-editorial-text focus:ring-1 focus:ring-editorial-text outline-none transition-all"
                                        placeholder="Jane"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-bold text-editorial-text mb-2 tracking-wide uppercase">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        className="w-full px-4 py-3 bg-white border border-editorial-border focus:border-editorial-text focus:ring-1 focus:ring-editorial-text outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-editorial-text mb-2 tracking-wide uppercase">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full px-4 py-3 bg-white border border-editorial-border focus:border-editorial-text focus:ring-1 focus:ring-editorial-text outline-none transition-all"
                                    placeholder="jane@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-editorial-text mb-2 tracking-wide uppercase">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-editorial-border focus:border-editorial-text focus:ring-1 focus:ring-editorial-text outline-none transition-all resize-none"
                                    placeholder="Tell us how we can help..."
                                ></textarea>
                            </div>

                            <Button className="w-full py-4 bg-editorial-text text-white hover:bg-editorial-accent hover:text-editorial-text border-transparent hover:border-editorial-text">
                                Send Message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

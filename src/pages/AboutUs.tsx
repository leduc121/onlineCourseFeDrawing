import React from 'react';
import { motion } from 'framer-motion';

export function AboutUs() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-[#faf8f5] px-4 py-20">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="text-center mb-16"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-serif font-bold text-editorial-text mb-6"
                    >
                        About Us
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-editorial-subtle font-light max-w-2xl mx-auto"
                    >
                        Nurturing the next generation of creative minds through the power of art.
                    </motion.p>
                </motion.div>

                {/* Our Mission Section - NOW FIRST */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="mb-24 text-center bg-white p-12 rounded-xl border border-editorial-border shadow-sm"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl font-serif font-bold mb-6 text-editorial-accent">Our Mission</motion.h2>
                    <motion.p variants={itemVariants} className="text-2xl font-serif text-editorial-text leading-relaxed max-w-3xl mx-auto italic">
                        "To ensure that every child's innate creativity is nurtured, celebrated, and never lost."
                    </motion.p>
                    <motion.p variants={itemVariants} className="mt-6 text-editorial-subtle">
                        We strive to create a world where art is not just a subject, but a language for expression and confidence.
                    </motion.p>
                </motion.section>

                {/* Our Story Section - NOW SECOND */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24"
                >
                    <motion.div variants={itemVariants} className="order-2 md:order-1">
                        <h2 className="text-3xl font-serif font-bold mb-4">Our Story</h2>
                        <p className="text-editorial-text leading-relaxed mb-4">
                            ArtAcademy began with a simple idea born from passion. Founded in 2026 by a group of educators and artists, we wanted to create a space where technique meets imagination.
                        </p>
                        <p className="text-editorial-text leading-relaxed">
                            We believe that art education shouldn't just be about following instructions, but about finding one's unique voice. From our first small workshop to a global community, our journey has always been about the students.
                        </p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="order-1 md:order-2 h-[400px] overflow-hidden rounded-lg shadow-xl">
                        <img
                            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop"
                            alt="Children painting together"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </motion.div>
                </motion.section>

                {/* Our Values Section - REMAINS LAST */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                    className="mb-24"
                >
                    <motion.h2 variants={itemVariants} className="text-3xl font-serif font-bold text-center mb-12">Our Values</motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Creativity First", desc: "We prioritize imagination over perfection." },
                            { title: "Safe Space", desc: "A judgment-free zone for expression." },
                            { title: "Expert Guidance", desc: "Learning from real practicing artists." }
                        ].map((val, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="bg-white p-8 rounded-lg shadow-sm border border-editorial-border text-center hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-xl font-serif font-bold mb-3">{val.title}</h3>
                                <p className="text-editorial-subtle">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}

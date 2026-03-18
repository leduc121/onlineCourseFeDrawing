import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { coursesApi } from '../api';

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: string;
  image: string;
  large?: boolean;
}

export function CourseGrid() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const res = await coursesApi.getPublished(1, 6);
        if (res.data?.data?.items) {
          const fetchedCourses = res.data.data.items.map((c: any, index: number) => ({
             id: c.id,
             title: c.title,
             instructor: c.instructorName || 'Instructor',
             category: c.categoryName || 'General',
             price: `$${c.price}`,
             image: c.thumbnailUrl || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop',
             large: index % 5 === 0 // Make some large arbitrarily
          }));
          setCourses(fetchedCourses);
        }
      } catch(err) {
        console.error("Error fetching courses for landing page:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return <section id="courses" className="py-24 px-4 bg-editorial-bg border-t border-editorial-border">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-16 border-b border-editorial-text pb-4">
        <h2 className="text-4xl md:text-5xl font-serif text-editorial-text">
          Curated Curriculum
        </h2>
        <Link to="/courses" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-editorial-accent transition-colors">
          View Full Catalogue <ArrowUpRight size={16} />
        </Link>
      </div>

      {isLoading ? (
         <div className="py-12 text-center text-editorial-subtle">
           Loading curated courses...
         </div>
      ) : (
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
            <Link to={`/course/${course.id}`} className="relative flex-grow overflow-hidden mb-4 block">
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />
              <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <span className="absolute top-4 left-4 bg-[#faf8f5] px-3 py-1 text-xs uppercase tracking-widest font-medium z-20">
                {course.category}
              </span>
            </Link>

            <div className="flex justify-between items-start">
              <div className="max-w-[80%]">
                <Link to={`/course/${course.id}`}>
                    <h3 className="text-2xl font-serif leading-tight mb-1 group-hover:text-editorial-accent transition-colors">
                    {course.title}
                    </h3>
                </Link>
                <p className="text-sm text-editorial-subtle font-medium">
                  with {course.instructor}
                </p>
              </div>
              <span className="text-lg font-serif italic text-editorial-text">
                {course.price}
              </span>
            </div>
          </motion.div>)}
        </div>
      )}

      <div className="mt-12 text-center md:hidden">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-medium border-b border-editorial-text pb-1">
          View Full Catalogue <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  </section>;
}
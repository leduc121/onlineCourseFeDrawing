import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { useCart } from '../contexts/CartContext';
export interface CourseProps {
  id: string;
  title: string;
  instructor: string;
  price: number;
  rating: number;
  students: number;
  duration: string;
  image: string;
  ageGroup: string;
  category: string;
}
export function CourseCard({
  course
}: {
  course: CourseProps;
}) {
  const {
    addToCart
  } = useCart();
  return <div className="group bg-white border border-[#2d2d2d]/10 hover:border-[#2d2d2d] transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-3 left-3 bg-[#faf8f5] px-3 py-1 text-xs font-bold uppercase tracking-wider border border-[#2d2d2d]">
          {course.category}
        </div>
        <div className="absolute top-3 right-3 bg-[#ff8a80] text-[#2d2d2d] px-3 py-1 text-xs font-bold rounded-full">
          Age {course.ageGroup}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center space-x-1 mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{course.rating}</span>
          <span className="text-gray-400 text-sm">
            ({course.students} students)
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold text-[#2d2d2d] mb-2 line-clamp-2 group-hover:text-[#ff8a80] transition-colors">
          <Link to={`/course/${course.id}`}>{course.title}</Link>
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          by{' '}
          <span className="font-medium text-[#2d2d2d]">
            {course.instructor}
          </span>
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-2xl font-serif font-bold text-[#2d2d2d]">
            ${course.price}
          </span>
          <Button variant="outline" size="sm" onClick={() => addToCart({
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          price: course.price,
          thumbnail: course.image
        })}>
            Add to Cart
          </Button>
        </div>
      </div>
    </div>;
}
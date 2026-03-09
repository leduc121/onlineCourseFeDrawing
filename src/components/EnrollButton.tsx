import { useState } from 'react';
import { Button } from './ui/Button';
import { useCart, Course } from '../contexts/CartContext';
import { studentProfilesApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

export function EnrollButton({ course, variant = 'primary', className = '', size = 'md' }: { course: Course; variant?: 'primary' | 'secondary' | 'outline' | 'ghost'; className?: string; size?: 'sm' | 'md' | 'lg' }) {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleEnrollClick = async () => {
        if (!user) {
            alert("Please login to enroll in courses.");
            return;
        }

        if (user.role === 'customer') {
            setIsLoading(true);
            setIsModalOpen(true);
            try {
                const res = await studentProfilesApi.getMyStudents();
                if (res.data?.data) {
                    setStudents(res.data.data);
                    if (res.data.data.length > 0) {
                        setSelectedStudent(res.data.data[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch kids", err);
            } finally {
                setIsLoading(false);
            }
        } else {
            // For other roles, just attempt to add to cart (though backend might block if not parent)
            await addToCart(course);
        }
    };

    const handleConfirm = async () => {
        if (!selectedStudent) {
            alert("Please select a child to enroll.");
            return;
        }
        setIsAdding(true);
        try {
            await addToCart({
                ...course,
                studentProfileId: selectedStudent
            });
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
            <Button variant={variant} className={className} size={size} onClick={handleEnrollClick}>
                Add to Cart
            </Button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h3 className="text-2xl font-serif font-bold text-[#2d2d2d] mb-4">Assign Course</h3>
                        <p className="text-gray-600 mb-6 font-medium text-sm">
                            Which child are you purchasing <strong>{course.title}</strong> for?
                        </p>

                        {isLoading ? (
                            <div className="py-4 text-center text-gray-500">Loading kids...</div>
                        ) : students.length === 0 ? (
                            <div className="py-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg mb-4 bg-gray-50">
                                You don't have any kid profiles yet.
                                <br/>
                                Please go to your dashboard to add a child first.
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6">
                                {students.map(kid => (
                                    <label key={kid.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedStudent === kid.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="studentSelection"
                                            value={kid.id}
                                            checked={selectedStudent === kid.id}
                                            onChange={(e) => setSelectedStudent(e.target.value)}
                                            className="w-4 h-4 text-primary-600"
                                        />
                                        <div className="flex items-center gap-2">
                                            <img
                                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.studentFullName}`}
                                              alt={kid.studentFullName}
                                              className="w-8 h-8 rounded-full bg-gray-200"
                                            />
                                            <span className="font-bold text-[#2d2d2d]">{kid.studentFullName}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        <div className="flex space-x-3">
                            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            {students.length > 0 && (
                                <Button className="flex-1" onClick={handleConfirm} isLoading={isAdding}>
                                    Confirm & Add
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

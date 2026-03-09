import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authApi, instructorProfilesApi, studentProfilesApi } from '../api';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Briefcase, Award, TrendingUp, Calendar, Users, Star, Clock } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [extraData, setExtraData] = useState<any>(null); // For instructor bio or parent's students
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      try {
        setIsLoading(true);
        // 1. Get basic user info from /Auth/me
        const meRes = await authApi.getMe();
        setProfileData(meRes.data?.data);

        // 2. Fetch role-specific data
        if (user?.role === 'instructor') {
          const instRes = await instructorProfilesApi.getMyProfile();
          setExtraData(instRes.data?.data);
        } else if (user?.role === 'customer') {
          // If parent, maybe show their students count or list
          const stuRes = await studentProfilesApi.getMyStudents();
          setExtraData(stuRes.data?.data || []);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfileInfo();
    }
  }, [user]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">Loading profile...</div>;
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    instructor: 'bg-blue-100 text-blue-700',
    customer: 'bg-green-100 text-green-700', // Parent
    student: 'bg-orange-100 text-orange-700',
    staff: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile Card */}
        <div className="bg-white border border-[#2d2d2d]/10 shadow-sm overflow-hidden mb-8">
          <div className="h-32 bg-[#2d2d2d] relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-[#ff8a80] rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-3xl font-serif font-bold text-[#2d2d2d]">
                  {profileData?.fullName?.charAt(0) || user?.name?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#2d2d2d]">
                  {profileData?.fullName || user?.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleColors[user?.role || 'customer']}`}>
                    {user?.role === 'customer' ? 'Parent / Account Owner' : user?.role}
                  </span>
                  <span className="text-gray-400 text-sm flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {new Date(profileData?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
              <h3 className="text-sm font-bold text-[#2d2d2d] uppercase tracking-widest mb-4">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Email Address</p>
                    <p className="text-sm text-[#2d2d2d] font-medium break-all">{profileData?.email || user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">User ID</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{profileData?.id || user?.id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Account Security</p>
                    <p className="text-sm text-green-600 font-medium">Verified Account</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Specific Quick Stats */}
            {user?.role === 'instructor' && (
              <div className="bg-[#2d2d2d] p-6 text-white shadow-lg">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Earnings Overview</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-serif font-bold text-[#ff8a80]">${extraData?.totalEarnings || 0}</p>
                    <p className="text-xs text-gray-400 mt-1">Total Career Revenue</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-[#ff8a80]" />
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'customer' && (
              <div className="bg-[#f0f9ff] p-6 border border-blue-100 shadow-sm">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-4">Family Management</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-serif font-bold text-blue-600">{extraData?.length || 0}</p>
                    <p className="text-xs text-blue-500 mt-1">Registered Students</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Context */}
          <div className="md:col-span-2 space-y-6">
            {/* Instructor Bio / Expertise */}
            {user?.role === 'instructor' && (
              <>
                <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
                  <h3 className="text-sm font-bold text-[#2d2d2d] uppercase tracking-widest mb-4 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" /> Professional Bio
                  </h3>
                  <p className="text-gray-600 leading-relaxed italic">
                    {extraData?.bio || "No professional biography has been set yet. Share your story with your students!"}
                  </p>
                </div>

                <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
                  <h3 className="text-sm font-bold text-[#2d2d2d] uppercase tracking-widest mb-4 flex items-center">
                    <Award className="w-4 h-4 mr-2" /> Expertise & Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {extraData?.expertise ? extraData.expertise.split(',').map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium">
                        {skill.trim()}
                      </span>
                    )) : (
                      <p className="text-gray-400 text-sm italic">Add your artistic specialties here.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Parent's Student List */}
            {user?.role === 'customer' && (
              <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
                <h3 className="text-sm font-bold text-[#2d2d2d] uppercase tracking-widest mb-6 flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Managed Student Profiles
                </h3>
                <div className="space-y-4">
                  {extraData && extraData.length > 0 ? extraData.map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 group hover:border-[#ff8a80] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                          <span className="text-sm font-bold text-gray-500">{student.studentFullName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-[#2d2d2d]">{student.studentFullName}</p>
                          <p className="text-xs text-gray-400">{student.studentEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-500 font-medium">{student.enrollmentCount} Courses</p>
                          <div className="flex text-yellow-400 mt-1">
                            <Star className="w-3 h-3 fill-current" />
                            <Star className="w-3 h-3 fill-current" />
                            <Star className="w-3 h-3 fill-current" />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">Manage</Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm mb-4">No students registered yet.</p>
                      <Button size="sm">Register Your First Student</Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Common Section: Activity / Recent */}
            <div className="bg-white p-6 border border-[#2d2d2d]/10 shadow-sm">
              <h3 className="text-sm font-bold text-[#2d2d2d] uppercase tracking-widest mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" /> Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="border-l-2 border-[#ff8a80] pl-4 py-1">
                  <p className="text-sm text-[#2d2d2d] font-medium">Logged in successfully</p>
                  <p className="text-xs text-gray-400">Today at 10:30 AM</p>
                </div>
                <div className="border-l-2 border-gray-200 pl-4 py-1">
                  <p className="text-sm text-[#2d2d2d] font-medium">Updated security settings</p>
                  <p className="text-xs text-gray-400">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

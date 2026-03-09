import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { coursesApi, uploadsApi } from '../api';

interface Lesson {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMinute: number;
  isTrial: boolean;
}

interface Section {
  id?: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export function ManageCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState(0); // 0 = Beginner, 1 = Intermediate, 2 = Advanced
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  
  const [sections, setSections] = useState<Section[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File, folder: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const res = await uploadsApi.getPresignedUrl({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          folder: folder
      });
      const { uploadUrl, objectKey } = res.data.data;
      
      // Upload to S3 using the Presigned URL
      await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
              'Content-Type': file.type || 'application/octet-stream'
          }
      });
      
      // Construct the final public URL. 
      // Replace with your actual CloudFront or S3 bucket public endpoint if stored locally.
      // E.g. https://drawing-bucket-images.s3.ap-southeast-1.amazonaws.com/${objectKey}
      const s3Url = uploadUrl.split('?')[0]; 
      
      return s3Url;
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload file. Check S3 credentials.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      setIsLoading(true);
      const res = await coursesApi.getById(id!);
      if (res.data?.data) {
        const c = res.data.data;
        setTitle(c.title || '');
        setDescription(c.description || '');
        setPrice(c.price || 0);
        setDifficultyLevel(typeof c.difficultyLevel === 'number' ? c.difficultyLevel : 0);
        setThumbnailUrl(c.thumbnailUrl || '');
        
        // Map sections
        if (c.sections) {
          setSections(c.sections.map((s: any) => ({
             id: s.id,
             title: s.title,
             description: s.description || '',
             lessons: s.lessons ? s.lessons.map((l: any) => ({
                 title: l.title,
                 description: l.description || '',
                 videoUrl: l.videoUrl || '',
                 durationMinute: l.durationMinute || l.durationSeconds || 0, // Fallback for backwards compatibility if needed
                 isTrial: l.isTrial || false
             })) : []
          })));
        }
      }
    } catch (err) {
      console.error("Failed to load course", err);
      alert("Error loading course details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { title: 'New Section', description: '', lessons: [] }]);
  };

  const handRemoveSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const handleUpdateSection = (index: number, field: string, value: string) => {
    const newSections = [...sections];
    (newSections[index] as any)[field] = value;
    setSections(newSections);
  };

  const handleAddLesson = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons.push({
      title: 'New Lesson',
      description: '',
      videoUrl: '',
      durationMinute: 10,
      isTrial: false
    });
    setSections(newSections);
  };

  const handleRemoveLesson = (sIndex: number, lIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].lessons.splice(lIndex, 1);
    setSections(newSections);
  };

  const handleUpdateLesson = (sIndex: number, lIndex: number, field: string, value: any) => {
    const newSections = [...sections];
    (newSections[sIndex].lessons[lIndex] as any)[field] = value;
    setSections(newSections);
  };

  const handleSaveBasic = async () => {
    try {
      setIsSaving(true);
      const payload = {
         title,
         description,
         price: Number(price),
         difficultyLevel: Number(difficultyLevel),
         thumbnailUrl: thumbnailUrl || null,
         categoryId: null
      };

      if (!isEditMode) {
         // Create Full
         const fullPayload = {
            ...payload,
            sections: sections.map(s => ({
               title: s.title,
               description: s.description,
               lessons: s.lessons.map(l => ({
                   title: l.title,
                   description: l.description,
                   videoUrl: l.videoUrl,
                   durationMinute: Number(l.durationMinute),
                   isTrial: l.isTrial
               }))
            }))
         };
         const res = await coursesApi.createFull(fullPayload);
         alert("Course created successfully!");
         navigate(`/instructor/edit-course/${res.data.data.id}`);
      } else {
         // Update basic only
         await coursesApi.update(id!, payload);
         alert("Course info updated successfully!");
      }

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save course.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSections = async () => {
    try {
      setIsSaving(true);
      const req = {
         sections: sections.map(s => ({
            id: s.id || null,
            title: s.title,
            description: s.description,
            lessons: s.lessons.map(l => ({
                id: l.id || null,
                title: l.title,
                description: l.description,
                videoUrl: l.videoUrl,
                durationMinute: Number(l.durationMinute),
                isTrial: l.isTrial
            }))
         }))
      };
      await coursesApi.updateSections(id!, req);
      alert("Curriculum updated successfully!");
      loadCourse(); // Reload to get updated IDs
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update curriculum.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if(!id) return;
    if(confirm("Submit this course for admin review? You cannot edit basic info while pending.")) {
        try {
            await coursesApi.submitForReview(id);
            alert("Submitted for review!");
            navigate('/instructor/dashboard');
        } catch(err: any) {
            alert(err.response?.data?.message || "Failed to submit.");
        }
    }
  }

  if (isLoading) return <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center justify-center gap-4">
            <Link to="/instructor/dashboard" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-serif font-bold text-[#2d2d2d]">
               {isEditMode ? 'Edit Course' : 'Create New Course'}
            </h1>
          </div>
          <div className="flex space-x-4">
             {isEditMode && (
                <Button variant="outline" onClick={handleSubmitForReview}>
                   Submit for Review
                </Button>
             )}
             {!isEditMode && (
                 <Button onClick={handleSaveBasic} isLoading={isSaving || isUploading} disabled={isUploading}>
                   <Save className="w-4 h-4 mr-2" /> Save & Create
                 </Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Basic Info */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm shadow-indigo-100/20">
                 <h2 className="text-xl font-bold font-serif mb-4 flex items-center justify-between">
                    Basic Settings
                    {isEditMode && (
                        <Button variant="outline" size="sm" onClick={handleSaveBasic} isLoading={isSaving || isUploading} disabled={isUploading}>Save Info</Button>
                    )}
                 </h2>

                 <div className="space-y-4">
                    <Input label="Course Title" placeholder="e.g. Master Watercolor" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    
                    <div>
                      <label className="block text-sm text-[#2d2d2d] font-bold mb-2 uppercase tracking-wide">
                        Description
                      </label>
                      <textarea
                        className="w-full px-4 py-3 border-2 border-[#e5e5e5] bg-[#faf8f5] focus:bg-white focus:border-[#2d2d2d] focus:outline-none transition-colors rounded-none"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What will students learn?"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Price (USD)" type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                        <div>
                          <label className="block text-sm text-[#2d2d2d] font-bold mb-2 uppercase tracking-wide">Difficulty</label>
                          <select 
                            className="w-full px-4 py-3 border-2 border-[#e5e5e5] bg-[#faf8f5] focus:bg-white focus:border-[#2d2d2d] focus:outline-none transition-colors rounded-none"
                            value={difficultyLevel} onChange={(e) => setDifficultyLevel(Number(e.target.value))}>
                              <option value={0}>Beginner</option>
                              <option value={1}>Intermediate</option>
                              <option value={2}>Advanced</option>
                          </select>
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#2d2d2d] font-bold mb-2 uppercase tracking-wide">
                          Course Thumbnail {isUploading && <span className="text-xs text-indigo-500 font-normal ml-2">(Uploading...)</span>}
                      </label>
                      <input 
                         type="file" 
                         accept="image/*"
                         className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                         onChange={async (e) => {
                             if(e.target.files && e.target.files[0]) {
                                 const url = await handleFileUpload(e.target.files[0], 'thumbnails');
                                 if(url) setThumbnailUrl(url);
                             }
                         }}
                         disabled={isUploading}
                      />
                    </div>
                    
                    {thumbnailUrl && (
                        <div className="mt-4 border-2 border-dashed border-gray-300 p-2 rounded-xl flex items-center justify-center bg-gray-50 h-32 overflow-hidden">
                           <img src={thumbnailUrl} alt="Preview" className="h-full object-cover" />
                        </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Curriculum */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm shadow-indigo-100/20">
                 <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-bold font-serif text-[#2d2d2d]">
                        Curriculum
                     </h2>
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleAddSection}>
                            <Plus className="w-4 h-4 mr-1" /> Add Section
                        </Button>
                        {isEditMode && (
                             <Button size="sm" onClick={handleSaveSections} isLoading={isSaving || isUploading} disabled={isUploading}>
                             Save Curriculum
                          </Button>
                        )}
                     </div>
                 </div>

                 {sections.length === 0 ? (
                     <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        {isEditMode ? "No sections yet. Add one to start building your curriculum." : "You can build your curriculum right away. Add your first section!"}
                     </div>
                 ) : (
                     <div className="space-y-6">
                         {sections.map((section, sIndex) => (
                             <div key={sIndex} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 pb-2">
                                 <div className="bg-gray-100 p-3 px-4 flex items-center justify-between border-b border-gray-200">
                                     <div className="flex items-center gap-3 w-full max-w-sm">
                                         <GripVertical className="w-4 h-4 text-gray-400" />
                                         <span className="font-bold text-gray-500 text-sm">Section {sIndex + 1}:</span>
                                         <input 
                                            type="text" 
                                            className="bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none px-1 py-1 font-bold text-[#2d2d2d] w-full" 
                                            value={section.title}
                                            onChange={(e) => handleUpdateSection(sIndex, 'title', e.target.value)}
                                            placeholder="Section Title"
                                         />
                                     </div>
                                     <button className="p-1 hover:bg-gray-200 rounded text-red-500 transition-colors" onClick={() => handRemoveSection(sIndex)}>
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                 </div>

                                 <div className="p-4 space-y-3">
                                     {section.lessons.map((lesson, lIndex) => (
                                         <div key={lIndex} className="bg-white border object-cover border-gray-200 p-3 rounded-md shadow-sm ml-6 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Lesson {lIndex + 1}</span>
                                                    <input 
                                                        className="font-medium outline-none border-b border-transparent focus:border-indigo-300 w-1/3 text-sm px-1"
                                                        value={lesson.title}
                                                        onChange={(e) => handleUpdateLesson(sIndex, lIndex, 'title', e.target.value)}
                                                        placeholder="Lesson Title"
                                                    />
                                                </div>
                                                <button onClick={() => handleRemoveLesson(sIndex, lIndex)} className="text-red-400 hover:text-red-600 px-2">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                   <input 
                                                      type="file"
                                                      accept="video/*"
                                                      className="w-full text-xs text-gray-500 file:border-0 file:bg-gray-100 file:rounded file:px-2 file:py-1 file:text-gray-700 hover:file:bg-gray-200"
                                                      onChange={async (e) => {
                                                         if (e.target.files && e.target.files[0]) {
                                                             const url = await handleFileUpload(e.target.files[0], 'lessons');
                                                             if (url) handleUpdateLesson(sIndex, lIndex, 'videoUrl', url);
                                                         }
                                                      }}
                                                      disabled={isUploading}
                                                   />
                                                   {lesson.videoUrl && <p className="text-[10px] text-green-600 truncate mt-1" title={lesson.videoUrl}>✓ Video ready</p>}
                                                </div>
                                                <input 
                                                    className="border border-gray-200 rounded px-2 py-1.5 text-xs w-full focus:outline-indigo-500"
                                                    type="number"
                                                    value={lesson.durationMinute}
                                                    onChange={(e) => handleUpdateLesson(sIndex, lIndex, 'durationMinute', Number(e.target.value))}
                                                    placeholder="Duration (minutes)"
                                                />
                                                <label className="flex items-center gap-2 text-xs text-gray-600 font-medium cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={lesson.isTrial}
                                                        onChange={(e) => handleUpdateLesson(sIndex, lIndex, 'isTrial', e.target.checked)}
                                                    />
                                                    Free Trial Lesson
                                                </label>
                                            </div>
                                         </div>
                                     ))}
                                     <div className="ml-6 mt-3">
                                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1" onClick={() => handleAddLesson(sIndex)}>
                                            <Plus className="w-3 h-3" /> Add Lesson
                                        </button>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, HelpCircle, FileText, ChevronDown, ChevronUp, CheckCircle, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { coursesApi, uploadsApi, categoriesApi } from '../api';
import { AssignmentGrader } from '../components/AssignmentGrader';

// ─── Quiz/Assignment sub-types ──────────────────────────────────
interface QuizAnswer {
  content: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  content: string;
  points: number;
  answers: QuizAnswer[];
}

interface QuizData {
  title: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

interface AssignmentData {
  id?: string;
  title: string;
  instructions: string;
  maxScore: number;
}

// ─── Main data types ────────────────────────────────────────────
interface Lesson {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  durationMinute: number;
  isTrial: boolean;
  quiz: QuizData | null;
  assignment: AssignmentData | null;
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
  const [difficultyLevel, setDifficultyLevel] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  
  const [sections, setSections] = useState<Section[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Track which lesson's quiz/assignment editor is open
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null); // "sIndex-lIndex"
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);

  // Assignment grader modal
  const [graderAssignment, setGraderAssignment] = useState<{ id: string; title: string; maxScore: number } | null>(null);

  const handleFileUpload = async (file: File, folder: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const res = await uploadsApi.getPresignedUrl({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          folder: folder
      });
      const { uploadUrl, objectKey } = res.data.data;
      
      await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
              'Content-Type': file.type || 'application/octet-stream'
          }
      });
      
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
    loadCategories();
    if (isEditMode) {
      loadCourse();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await categoriesApi.getAll(1, 100);
      if (res.data?.data?.items) {
        setCategories(res.data.data.items);
        if(!categoryId && res.data.data.items.length > 0) {
            setCategoryId(res.data.data.items[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

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
        setCategoryId(c.categoryId || '');
        
        if (c.sections) {
          setSections(c.sections.map((s: any) => ({
             id: s.id,
             title: s.title,
             description: s.description || '',
             lessons: s.lessons ? s.lessons.map((l: any) => ({
                 id: l.id,
                 title: l.title,
                 description: l.description || '',
                 videoUrl: l.videoUrl || '',
                 durationMinute: l.durationMinute || 0,
                 isTrial: l.isTrial || false,
                 quiz: l.quiz ? {
                   title: l.quiz.title || '',
                   passingScore: l.quiz.passingScore || 70,
                   timeLimitMinutes: l.quiz.timeLimitMinutes || 10,
                   questions: l.quiz.questions ? l.quiz.questions.map((q: any) => ({
                     content: q.content || '',
                     points: q.points || 1,
                     answers: q.answers ? q.answers.map((a: any) => ({
                       content: a.content || '',
                       isCorrect: a.isCorrect || false,
                     })) : []
                   })) : []
                 } : null,
                 assignment: l.assignment ? {
                   id: l.assignment.id,
                   title: l.assignment.title || '',
                   instructions: l.assignment.instructions || '',
                   maxScore: l.assignment.maxScore || 100,
                 } : null,
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

  // ── Section handlers ──────────────────────────────────────────
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

  // ── Lesson handlers ───────────────────────────────────────────
  const handleAddLesson = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].lessons.push({
      title: 'New Lesson',
      description: '',
      videoUrl: '',
      durationMinute: 10,
      isTrial: false,
      quiz: null,
      assignment: null,
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

  // ── Quiz handlers ─────────────────────────────────────────────
  const toggleQuizEditor = (key: string) => {
    setExpandedQuiz(prev => prev === key ? null : key);
  };

  const addQuizToLesson = (sIndex: number, lIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].quiz = {
      title: `Quiz - ${newSections[sIndex].lessons[lIndex].title}`,
      passingScore: 70,
      timeLimitMinutes: 10,
      questions: [{
        content: 'Question 1?',
        points: 1,
        answers: [
          { content: 'Answer A', isCorrect: true },
          { content: 'Answer B', isCorrect: false },
        ]
      }]
    };
    setSections(newSections);
    setExpandedQuiz(`${sIndex}-${lIndex}`);
  };

  const removeQuizFromLesson = (sIndex: number, lIndex: number) => {
    if (!confirm('Remove this quiz? All questions will be lost.')) return;
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].quiz = null;
    setSections(newSections);
    setExpandedQuiz(null);
  };

  const updateQuizField = (sIndex: number, lIndex: number, field: string, value: any) => {
    const newSections = [...sections];
    const quiz = newSections[sIndex].lessons[lIndex].quiz!;
    (quiz as any)[field] = value;
    setSections(newSections);
  };

  const addQuestion = (sIndex: number, lIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].quiz!.questions.push({
      content: '',
      points: 1,
      answers: [
        { content: '', isCorrect: true },
        { content: '', isCorrect: false },
      ]
    });
    setSections(newSections);
  };

  const removeQuestion = (sIndex: number, lIndex: number, qIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].quiz!.questions.splice(qIndex, 1);
    setSections(newSections);
  };

  const updateQuestion = (sIndex: number, lIndex: number, qIndex: number, field: string, value: any) => {
    const newSections = [...sections];
    (newSections[sIndex].lessons[lIndex].quiz!.questions[qIndex] as any)[field] = value;
    setSections(newSections);
  };

  const addAnswer = (sIndex: number, lIndex: number, qIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].quiz!.questions[qIndex].answers.push({
      content: '', isCorrect: false
    });
    setSections(newSections);
  };

  const removeAnswer = (sIndex: number, lIndex: number, qIndex: number, aIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].quiz!.questions[qIndex].answers.splice(aIndex, 1);
    setSections(newSections);
  };

  const updateAnswer = (sIndex: number, lIndex: number, qIndex: number, aIndex: number, field: string, value: any) => {
    const newSections = [...sections];
    (newSections[sIndex].lessons[lIndex].quiz!.questions[qIndex].answers[aIndex] as any)[field] = value;
    setSections(newSections);
  };

  const setCorrectAnswer = (sIndex: number, lIndex: number, qIndex: number, aIndex: number) => {
    const newSections = [...sections];
    const answers = newSections[sIndex].lessons[lIndex].quiz!.questions[qIndex].answers;
    answers.forEach((a, i) => a.isCorrect = i === aIndex);
    setSections(newSections);
  };

  // ── Assignment handlers ───────────────────────────────────────
  const toggleAssignmentEditor = (key: string) => {
    setExpandedAssignment(prev => prev === key ? null : key);
  };

  const addAssignmentToLesson = (sIndex: number, lIndex: number) => {
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].assignment = {
      title: `Assignment - ${newSections[sIndex].lessons[lIndex].title}`,
      instructions: '',
      maxScore: 100,
    };
    setSections(newSections);
    setExpandedAssignment(`${sIndex}-${lIndex}`);
  };

  const removeAssignmentFromLesson = (sIndex: number, lIndex: number) => {
    if (!confirm('Remove this assignment?')) return;
    const newSections = [...sections];
    newSections[sIndex].lessons[lIndex].assignment = null;
    setSections(newSections);
    setExpandedAssignment(null);
  };

  const updateAssignmentField = (sIndex: number, lIndex: number, field: string, value: any) => {
    const newSections = [...sections];
    (newSections[sIndex].lessons[lIndex].assignment as any)[field] = value;
    setSections(newSections);
  };

  // ── Save handlers ─────────────────────────────────────────────
  const buildSectionsPayload = () => {
    return sections.map(s => ({
      id: s.id || null,
      title: s.title,
      description: s.description,
      lessons: s.lessons.map(l => ({
          id: l.id || null,
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          durationMinute: Number(l.durationMinute),
          isTrial: l.isTrial,
          quiz: l.quiz ? {
            title: l.quiz.title,
            passingScore: Number(l.quiz.passingScore),
            timeLimitMinutes: Number(l.quiz.timeLimitMinutes),
            questions: l.quiz.questions.map(q => ({
              content: q.content,
              points: Number(q.points),
              answers: q.answers.map(a => ({
                content: a.content,
                isCorrect: a.isCorrect,
              }))
            }))
          } : null,
          assignment: l.assignment ? {
            title: l.assignment.title,
            instructions: l.assignment.instructions,
            maxScore: Number(l.assignment.maxScore),
          } : null,
      }))
    }));
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
         categoryId: categoryId || null
      };

      if (!isEditMode) {
         const fullPayload = {
            ...payload,
            sections: buildSectionsPayload()
         };
         const res = await coursesApi.createFull(fullPayload);
         alert("Course created successfully!");
         navigate(`/instructor/edit-course/${res.data.data.id}`);
      } else {
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
      const req = { sections: buildSectionsPayload() };
      await coursesApi.updateSections(id!, req);
      alert("Curriculum updated successfully!");
      loadCourse();
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

                    <div>
                          <label className="block text-sm text-[#2d2d2d] font-bold mb-2 uppercase tracking-wide">Category</label>
                          <select 
                            className="w-full px-4 py-3 border-2 border-[#e5e5e5] bg-[#faf8f5] focus:bg-white focus:border-[#2d2d2d] focus:outline-none transition-colors rounded-none"
                            value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                              {categories.map((cat: any) => (
                                 <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                              {categories.length === 0 && <option value="">Loading categories...</option>}
                          </select>
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
                                     {section.lessons.map((lesson, lIndex) => {
                                       const lessonKey = `${sIndex}-${lIndex}`;
                                       const isQuizOpen = expandedQuiz === lessonKey;
                                       const isAssignmentOpen = expandedAssignment === lessonKey;
                                       return (
                                         <div key={lIndex} className="bg-white border border-gray-200 p-3 rounded-md shadow-sm ml-6 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Lesson {lIndex + 1}</span>
                                                    <input 
                                                        className="font-medium outline-none border-b border-transparent focus:border-indigo-300 w-1/3 text-sm px-1"
                                                        value={lesson.title}
                                                        onChange={(e) => handleUpdateLesson(sIndex, lIndex, 'title', e.target.value)}
                                                        placeholder="Lesson Title"
                                                    />
                                                    {/* Badges */}
                                                    {lesson.quiz && (
                                                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                                                        <HelpCircle className="w-3 h-3" /> Quiz
                                                      </span>
                                                    )}
                                                    {lesson.assignment && (
                                                      <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-bold">
                                                        <FileText className="w-3 h-3" /> Assignment
                                                      </span>
                                                    )}
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

                                            {/* ── Add Quiz / Assignment buttons ── */}
                                            <div className="flex gap-2 border-t border-gray-100 pt-2">
                                              {!lesson.quiz ? (
                                                <button onClick={() => addQuizToLesson(sIndex, lIndex)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50 transition-colors">
                                                  <HelpCircle className="w-3 h-3" /> Add Quiz
                                                </button>
                                              ) : (
                                                <button onClick={() => toggleQuizEditor(lessonKey)} className="text-xs font-bold text-indigo-600 flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors">
                                                  <HelpCircle className="w-3 h-3" /> 
                                                  {isQuizOpen ? 'Hide' : 'Edit'} Quiz ({lesson.quiz.questions.length}Q)
                                                  {isQuizOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                </button>
                                              )}
                                              {!lesson.assignment ? (
                                                <button onClick={() => addAssignmentToLesson(sIndex, lIndex)} className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50 transition-colors">
                                                  <FileText className="w-3 h-3" /> Add Assignment
                                                </button>
                                              ) : (
                                                <button onClick={() => toggleAssignmentEditor(lessonKey)} className="text-xs font-bold text-orange-600 flex items-center gap-1 px-2 py-1 rounded bg-orange-50 hover:bg-orange-100 transition-colors">
                                                  <FileText className="w-3 h-3" />
                                                  {isAssignmentOpen ? 'Hide' : 'Edit'} Assignment
                                                  {isAssignmentOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                </button>
                                              )}
                                            </div>

                                            {/* ── QUIZ EDITOR ── */}
                                            {isQuizOpen && lesson.quiz && (
                                              <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50/30 space-y-4">
                                                <div className="flex items-center justify-between">
                                                  <h4 className="font-bold text-sm text-indigo-700 flex items-center gap-2">
                                                    <HelpCircle className="w-4 h-4" /> Quiz Editor
                                                  </h4>
                                                  <button onClick={() => removeQuizFromLesson(sIndex, lIndex)} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1">
                                                    <Trash2 className="w-3 h-3" /> Remove Quiz
                                                  </button>
                                                </div>

                                                {/* Quiz settings */}
                                                <div className="grid grid-cols-3 gap-3">
                                                  <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Title</label>
                                                    <input className="w-full border border-indigo-200 rounded px-2 py-1.5 text-xs focus:outline-indigo-500 bg-white" value={lesson.quiz.title} onChange={e => updateQuizField(sIndex, lIndex, 'title', e.target.value)} />
                                                  </div>
                                                  <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Pass Score (%)</label>
                                                    <input className="w-full border border-indigo-200 rounded px-2 py-1.5 text-xs focus:outline-indigo-500 bg-white" type="number" min={0} max={100} value={lesson.quiz.passingScore} onChange={e => updateQuizField(sIndex, lIndex, 'passingScore', Number(e.target.value))} />
                                                  </div>
                                                  <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Time (min)</label>
                                                    <input className="w-full border border-indigo-200 rounded px-2 py-1.5 text-xs focus:outline-indigo-500 bg-white" type="number" min={1} value={lesson.quiz.timeLimitMinutes} onChange={e => updateQuizField(sIndex, lIndex, 'timeLimitMinutes', Number(e.target.value))} />
                                                  </div>
                                                </div>

                                                {/* Questions */}
                                                <div className="space-y-3">
                                                  {lesson.quiz.questions.map((question, qIndex) => (
                                                    <div key={qIndex} className="bg-white border border-indigo-200 rounded-lg p-3 space-y-2">
                                                      <div className="flex items-start gap-2">
                                                        <span className="shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-xs font-bold mt-0.5">Q{qIndex + 1}</span>
                                                        <input className="flex-1 border-b border-gray-200 focus:border-indigo-500 outline-none text-sm py-1 font-medium" placeholder="Question text..." value={question.content} onChange={e => updateQuestion(sIndex, lIndex, qIndex, 'content', e.target.value)} />
                                                        <input className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-indigo-500" type="number" min={1} value={question.points} onChange={e => updateQuestion(sIndex, lIndex, qIndex, 'points', Number(e.target.value))} title="Points" />
                                                        <button onClick={() => removeQuestion(sIndex, lIndex, qIndex)} className="text-red-400 hover:text-red-600 p-1" title="Remove question">
                                                          <Trash2 className="w-3 h-3" />
                                                        </button>
                                                      </div>

                                                      {/* Answers */}
                                                      <div className="ml-8 space-y-1.5">
                                                        {question.answers.map((answer, aIndex) => (
                                                          <div key={aIndex} className="flex items-center gap-2">
                                                            <button onClick={() => setCorrectAnswer(sIndex, lIndex, qIndex, aIndex)} className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${answer.isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'}`} title={answer.isCorrect ? 'Correct answer' : 'Set as correct'}>
                                                              {answer.isCorrect && <CheckCircle className="w-3 h-3 text-white" />}
                                                            </button>
                                                            <input className={`flex-1 border rounded px-2 py-1 text-xs focus:outline-indigo-500 ${answer.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'}`} placeholder={`Answer ${String.fromCharCode(65 + aIndex)}...`} value={answer.content} onChange={e => updateAnswer(sIndex, lIndex, qIndex, aIndex, 'content', e.target.value)} />
                                                            {question.answers.length > 2 && (
                                                              <button onClick={() => removeAnswer(sIndex, lIndex, qIndex, aIndex)} className="text-red-400 hover:text-red-600">
                                                                <Trash2 className="w-3 h-3" />
                                                              </button>
                                                            )}
                                                          </div>
                                                        ))}
                                                        <button onClick={() => addAnswer(sIndex, lIndex, qIndex)} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 ml-7 mt-1">
                                                          <Plus className="w-3 h-3" /> Add Answer
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>

                                                <button onClick={() => addQuestion(sIndex, lIndex)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-3 py-1.5 border border-dashed border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors w-full justify-center">
                                                  <Plus className="w-3 h-3" /> Add Question
                                                </button>
                                              </div>
                                            )}

                                            {/* ── ASSIGNMENT EDITOR ── */}
                                            {isAssignmentOpen && lesson.assignment && (
                                              <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50/30 space-y-3">
                                                <div className="flex items-center justify-between">
                                                  <h4 className="font-bold text-sm text-orange-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4" /> Assignment Editor
                                                  </h4>
                                                  <button onClick={() => removeAssignmentFromLesson(sIndex, lIndex)} className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1">
                                                    <Trash2 className="w-3 h-3" /> Remove
                                                  </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Title</label>
                                                    <input className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs focus:outline-orange-500 bg-white" value={lesson.assignment.title} onChange={e => updateAssignmentField(sIndex, lIndex, 'title', e.target.value)} />
                                                  </div>
                                                  <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Max Score</label>
                                                    <input className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs focus:outline-orange-500 bg-white" type="number" min={1} value={lesson.assignment.maxScore} onChange={e => updateAssignmentField(sIndex, lIndex, 'maxScore', Number(e.target.value))} />
                                                  </div>
                                                </div>
                                                <div>
                                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Instructions</label>
                                                  <textarea className="w-full border border-orange-200 rounded px-2 py-2 text-xs focus:outline-orange-500 bg-white" rows={3} value={lesson.assignment.instructions} onChange={e => updateAssignmentField(sIndex, lIndex, 'instructions', e.target.value)} placeholder="Describe what students should do..." />
                                                </div>
                                                {/* View Submissions button (only if assignment was already saved to BE - lesson has an id) */}
                                                {isEditMode && lesson.id && (
                                                  <button
                                                    onClick={() => {
                                                      // We need the assignment's BE id. After saving, the assignment should have an id in the lesson response.
                                                      // For now we use lesson.assignmentId if available, or we need to use the assignment endpoint.
                                                      // The assignment object from BE response has an `id` field.
                                                      const asnId = (lesson as any).assignmentId || (lesson.assignment as any)?.id;
                                                      if (asnId) {
                                                        setGraderAssignment({
                                                          id: asnId,
                                                          title: lesson.assignment!.title,
                                                          maxScore: lesson.assignment!.maxScore,
                                                        });
                                                      } else {
                                                        alert('Please save the curriculum first to view submissions.');
                                                      }
                                                    }}
                                                    className="text-xs font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 px-3 py-1.5 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors w-full justify-center"
                                                  >
                                                    <Users className="w-3 h-3" /> View Student Submissions
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                         </div>
                                       );
                                     })}
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

      {/* Assignment Grader Modal */}
      {graderAssignment && (
        <AssignmentGrader
          assignmentId={graderAssignment.id}
          assignmentTitle={graderAssignment.title}
          maxScore={graderAssignment.maxScore}
          onClose={() => setGraderAssignment(null)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';

interface Prerequisite {
  id: string;
  prerequisiteCourseName: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface PrerequisiteCheckerProps {
  courseTitle: string;
  prerequisites: Prerequisite[];
  canEnroll: boolean;
}

export const PrerequisiteChecker: React.FC<PrerequisiteCheckerProps> = ({
  courseTitle,
  prerequisites,
  canEnroll
}) => {
  const completedCount = prerequisites.filter(p => p.isCompleted).length;
  const progress = (completedCount / prerequisites.length) * 100;

  return (
    <div className="bg-white border rounded-lg p-6 shadow">
      <h3 className="text-2xl font-bold mb-4">Course Prerequisites</h3>

      {prerequisites.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-800 font-semibold">✓ No prerequisites required</p>
          <p className="text-green-700 text-sm">You can start this course immediately</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">Progress</p>
              <p className="text-sm text-gray-600">{completedCount}/{prerequisites.length}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Prerequisites List */}
          <div className="space-y-2">
            {prerequisites.map(prereq => (
              <div
                key={prereq.id}
                className={`flex items-center p-3 rounded border ${
                  prereq.isCompleted
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                  prereq.isCompleted ? 'bg-green-500' : 'bg-gray-400'
                }`}>
                  <span className="text-white font-bold text-sm">
                    {prereq.isCompleted ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{prereq.prerequisiteCourseName}</p>
                  {prereq.isCompleted && prereq.completedAt && (
                    <p className="text-xs text-gray-600">
                      Completed on {new Date(prereq.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {prereq.isCompleted && (
                  <span className="text-green-600 font-semibold text-sm">Complete</span>
                )}
              </div>
            ))}
          </div>

          {/* Enrollment Status */}
          <div className={`rounded p-4 ${
            canEnroll
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {canEnroll ? (
              <>
                <p className="text-green-800 font-semibold">✓ All prerequisites completed</p>
                <p className="text-green-700 text-sm">You can now enroll in this course</p>
              </>
            ) : (
              <>
                <p className="text-red-800 font-semibold">✗ Incomplete prerequisites</p>
                <p className="text-red-700 text-sm">
                  Complete {prerequisites.filter(p => !p.isCompleted).length} more prerequisite(s) to enroll
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface PrerequisiteBlockProps {
  missingPrerequisites: string[];
}

export const PrerequisiteBlock: React.FC<PrerequisiteBlockProps> = ({
  missingPrerequisites
}) => {
  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
      <p className="text-red-900 font-bold text-lg mb-2">Prerequisites Not Met</p>
      <p className="text-red-800 text-sm mb-4">
        You need to complete the following courses before enrolling:
      </p>
      <ul className="space-y-1 text-sm">
        {missingPrerequisites.map((course, index) => (
          <li key={index} className="text-red-700">• {course}</li>
        ))}
      </ul>
      <p className="text-red-700 text-sm mt-4">
        Complete these courses to unlock this learning path.
      </p>
    </div>
  );
};

interface CourseHierarchyProps {
  categories: any[];
  selectedCategoryId?: string;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryHierarchy: React.FC<CourseHierarchyProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(selectedCategoryId ? [selectedCategoryId] : [])
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const CategoryTree: React.FC<{ category: any; level: number }> = ({ category, level }) => {
    const hasChildren = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div>
        <div
          className={`flex items-center py-2 px-3 rounded cursor-pointer ${
            selectedCategoryId === category.id
              ? 'bg-blue-100 text-blue-900'
              : 'hover:bg-gray-100'
          }`}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="mr-2 w-4 h-4 flex items-center justify-center"
            >
              <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
            </button>
          )}
          <span onClick={() => onSelectCategory?.(category.id)} className="flex-1">
            {category.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {category.subcategories.map((subcat: any) => (
              <CategoryTree key={subcat.id} category={subcat} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow">
      <h3 className="text-lg font-bold mb-4">Course Categories</h3>
      <div className="space-y-1">
        {categories.map(category => (
          <CategoryTree key={category.id} category={category} level={0} />
        ))}
      </div>
    </div>
  );
};

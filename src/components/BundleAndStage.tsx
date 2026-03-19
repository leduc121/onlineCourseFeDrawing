import React, { useState } from 'react';

interface CourseStage {
  id: string;
  title: string;
  sortOrder: number;
  estimatedDays: number;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  targetLessonsCount: number;
  targetQuizCount: number;
  badgeUrl?: string;
}

interface CourseBundle {
  id: string;
  title: string;
  description: string;
  totalPrice: number;
  discountPercentage: number;
  courses: any[];
  expiryDate?: string;
  status: string;
}

interface BundleCardProps {
  bundle: CourseBundle;
  onAddToCart?: (bundleId: string) => void;
  isLoading?: boolean;
}

export const BundleCard: React.FC<BundleCardProps> = ({
  bundle,
  onAddToCart,
  isLoading = false
}) => {
  const originalPrice = bundle.totalPrice;
  const discountAmount = originalPrice * (bundle.discountPercentage / 100);
  const finalPrice = originalPrice - discountAmount;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h3 className="text-xl font-bold">{bundle.title}</h3>
        {bundle.discountPercentage > 0 && (
          <span className="inline-block mt-2 bg-red-500 px-3 py-1 rounded text-sm font-semibold">
            Save {bundle.discountPercentage}%
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        <p className="text-gray-600 text-sm">{bundle.description}</p>

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500 mb-2">{bundle.courses.length} courses included</p>
          <ul className="space-y-1">
            {bundle.courses.slice(0, 3).map(course => (
              <li key={course.id} className="text-sm text-gray-700 flex items-center">
                <span className="text-blue-600 mr-2">✓</span>
                {course.title}
              </li>
            ))}
            {bundle.courses.length > 3 && (
              <li className="text-sm text-gray-500">+ {bundle.courses.length - 3} more</li>
            )}
          </ul>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Original Price</p>
              <p className="text-sm line-through text-gray-600">${originalPrice.toFixed(2)}</p>
            </div>
            {bundle.discountPercentage > 0 && (
              <div>
                <p className="text-xs text-gray-500">You Save</p>
                <p className="text-sm font-semibold text-green-600">${discountAmount.toFixed(2)}</p>
              </div>
            )}
          </div>
          <div className="bg-blue-50 p-2 rounded flex justify-between items-center">
            <p className="font-bold text-blue-600">${finalPrice.toFixed(2)}</p>
            <button
              onClick={() => onAddToCart?.(bundle.id)}
              disabled={isLoading || bundle.status === 'Inactive'}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {bundle.expiryDate && (
          <p className="text-xs text-orange-600 text-center">
            Offer expires {new Date(bundle.expiryDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export const BundleGrid: React.FC<{ bundles: CourseBundle[]; onAddToCart?: (bundleId: string) => void }> = ({
  bundles,
  onAddToCart
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Course Bundles</h2>
      {bundles.length === 0 ? (
        <p className="text-gray-500">No bundles available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map(bundle => (
            <BundleCard key={bundle.id} bundle={bundle} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

interface StageProgressProps {
  stage: CourseStage;
  progress: {
    completedLessons: number;
    completedQuizzes: number;
    totalLessons: number;
    totalQuizzes: number;
  };
}

export const CourseStageProgress: React.FC<StageProgressProps> = ({
  stage,
  progress
}) => {
  const lessonsProgress = (progress.completedLessons / progress.totalLessons) * 100;
  const quizzesProgress = (progress.completedQuizzes / progress.totalQuizzes) * 100;
  const overallProgress = ((lessonsProgress + quizzesProgress) / 2);

  return (
    <div className="bg-white border rounded-lg p-6 shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold">{stage.title}</h3>
          <p className="text-sm text-gray-500">Est. {stage.estimatedDays} days</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{Math.round(overallProgress)}%</p>
          <p className="text-xs text-gray-500">Complete</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Lessons Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold">Lessons</p>
          <p className="text-sm text-gray-600">{progress.completedLessons}/{progress.totalLessons}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${lessonsProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Quizzes Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold">Quizzes</p>
          <p className="text-sm text-gray-600">{progress.completedQuizzes}/{progress.totalQuizzes}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full"
            style={{ width: `${quizzesProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h4 className="font-semibold mb-3">Milestones</h4>
        <div className="space-y-2">
          {stage.milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{milestone.title}</p>
                <p className="text-xs text-gray-600">
                  {milestone.targetLessonsCount} lessons, {milestone.targetQuizCount} quizzes
                </p>
                {milestone.badgeUrl && (
                  <img src={milestone.badgeUrl} alt="badge" className="w-6 h-6 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LearningRoadmap: React.FC<{ stages: CourseStage[]; currentStageId?: string }> = ({
  stages,
  currentStageId
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Learning Path</h3>
      <div className="relative">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex">
            {/* Timeline */}
            <div className="flex flex-col items-center mr-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                stage.id === currentStageId ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                {index + 1}
              </div>
              {index < stages.length - 1 && (
                <div className="w-1 h-16 bg-gray-300 mt-2"></div>
              )}
            </div>

            {/* Content */}
            <div className="pb-8 pt-2">
              <p className="font-semibold text-lg">{stage.title}</p>
              <p className="text-sm text-gray-600">{stage.milestones.length} milestones</p>
              {stage.id === currentStageId && (
                <span className="inline-block mt-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                  Current Stage
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

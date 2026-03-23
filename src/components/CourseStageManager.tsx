import { useEffect, useMemo, useState } from 'react';
import { courseStagesApi } from '../api';

interface StageMilestone {
  id: string;
  title: string;
  description?: string;
  targetLessonsCount?: number;
  targetQuizCount?: number;
  targetAssignmentCount?: number;
  badgeUrl?: string;
}

interface CourseStage {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  estimatedDays: number;
  milestones?: StageMilestone[];
}

interface StageDraft {
  title: string;
  description: string;
  estimatedDays: number;
}

interface MilestoneDraft {
  title: string;
  description: string;
  targetLessonsCount: number;
  targetQuizCount: number;
  targetAssignmentCount: number;
  badgeUrl: string;
}

const createEmptyMilestoneDraft = (): MilestoneDraft => ({
  title: '',
  description: '',
  targetLessonsCount: 0,
  targetQuizCount: 0,
  targetAssignmentCount: 0,
  badgeUrl: ''
});

export function CourseStageManager({ courseId }: { courseId: string }) {
  const [stages, setStages] = useState<CourseStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedStageId, setExpandedStageId] = useState<string>('');
  const [newStage, setNewStage] = useState<StageDraft>({
    title: '',
    description: '',
    estimatedDays: 7
  });
  const [milestoneDrafts, setMilestoneDrafts] = useState<Record<string, MilestoneDraft>>({});

  const nextSortOrder = useMemo(
    () => (stages.length > 0 ? Math.max(...stages.map((stage) => stage.sortOrder || 0)) + 1 : 1),
    [stages]
  );

  useEffect(() => {
    if (!courseId) return;
    loadStages();
  }, [courseId]);

  const loadStages = async () => {
    try {
      setIsLoading(true);
      const response = await courseStagesApi.getByCourse(courseId);
      const nextStages = (Array.isArray(response.data) ? response.data : response.data?.data || [])
        .slice()
        .sort((a: CourseStage, b: CourseStage) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setStages(nextStages);

      if (nextStages.length > 0 && !expandedStageId) {
        setExpandedStageId(nextStages[0].id);
      }
      if (expandedStageId && !nextStages.some((stage: CourseStage) => stage.id === expandedStageId)) {
        setExpandedStageId(nextStages[0]?.id || '');
      }
    } catch (error) {
      console.error('Failed to load course stages', error);
      setStages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newStage.title.trim()) return;

    try {
      setIsSaving(true);
      await courseStagesApi.create({
        courseId,
        title: newStage.title.trim(),
        description: newStage.description.trim() || null,
        estimatedDays: Number(newStage.estimatedDays) || 7,
        sortOrder: nextSortOrder
      });
      setNewStage({
        title: '',
        description: '',
        estimatedDays: 7
      });
      await loadStages();
    } catch (error) {
      console.error('Failed to create stage', error);
      alert('Failed to create stage.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStage = async (stage: CourseStage) => {
    try {
      setIsSaving(true);
      await courseStagesApi.update(stage.id, {
        title: stage.title,
        description: stage.description || null,
        estimatedDays: Number(stage.estimatedDays) || 7
      });
      await loadStages();
    } catch (error) {
      console.error('Failed to update stage', error);
      alert('Failed to update stage.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Delete this stage and its milestones?')) return;

    try {
      setIsSaving(true);
      await courseStagesApi.delete(stageId);
      await loadStages();
    } catch (error) {
      console.error('Failed to delete stage', error);
      alert('Failed to delete stage.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStageFieldChange = (stageId: string, field: keyof StageDraft, value: string | number) => {
    setStages((prev) =>
      prev.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              [field]: value
            }
          : stage
      )
    );
  };

  const handleMilestoneDraftChange = (
    stageId: string,
    field: keyof MilestoneDraft,
    value: string | number
  ) => {
    setMilestoneDrafts((prev) => ({
      ...prev,
      [stageId]: {
        ...(prev[stageId] || createEmptyMilestoneDraft()),
        [field]: value
      }
    }));
  };

  const handleAddMilestone = async (stageId: string) => {
    const draft = milestoneDrafts[stageId] || createEmptyMilestoneDraft();
    if (!draft.title.trim()) return;

    try {
      setIsSaving(true);
      await courseStagesApi.addMilestone(stageId, {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        targetLessonsCount: Number(draft.targetLessonsCount) || 0,
        targetQuizCount: Number(draft.targetQuizCount) || 0,
        targetAssignmentCount: Number(draft.targetAssignmentCount) || 0,
        badgeUrl: draft.badgeUrl.trim() || null
      });
      setMilestoneDrafts((prev) => ({
        ...prev,
        [stageId]: createEmptyMilestoneDraft()
      }));
      await loadStages();
    } catch (error) {
      console.error('Failed to add milestone', error);
      alert('Failed to add milestone.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm shadow-indigo-100/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8f7f72]">Learning Roadmap</p>
          <h2 className="mt-2 text-xl font-bold font-serif text-[#2d2d2d]">Stages and milestones</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Split the course into clear phases so students know what they should complete first, what milestone unlocks next, and how long each stage should roughly take.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreateStage} className="mt-6 rounded-2xl border border-[#eadfd3] bg-[#faf8f5] p-4">
        <div className="grid gap-3 md:grid-cols-[1.2fr_1.3fr_140px_auto]">
          <input
            value={newStage.title}
            onChange={(event) => setNewStage((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Stage title"
            className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
          />
          <input
            value={newStage.description}
            onChange={(event) => setNewStage((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Stage description"
            className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
          />
          <input
            type="number"
            min={1}
            value={newStage.estimatedDays}
            onChange={(event) => setNewStage((prev) => ({ ...prev, estimatedDays: Number(event.target.value) }))}
            placeholder="Days"
            className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-[#1f2937] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
          >
            Add Stage
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-500">
            Loading roadmap...
          </div>
        ) : stages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-500">
            No stages yet. Add the first stage to structure the course roadmap.
          </div>
        ) : (
          stages.map((stage, index) => {
            const draft = milestoneDrafts[stage.id] || createEmptyMilestoneDraft();
            const isExpanded = expandedStageId === stage.id;

            return (
              <div key={stage.id} className="overflow-hidden rounded-2xl border border-[#eadfd3]">
                <button
                  onClick={() => setExpandedStageId(isExpanded ? '' : stage.id)}
                  className="flex w-full items-center justify-between gap-4 bg-[#faf8f5] px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f2937] text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#1f2937]">{stage.title || `Stage ${index + 1}`}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#8f7f72]">
                        {stage.estimatedDays} day plan · {stage.milestones?.length || 0} milestones
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f7f72]">
                    {isExpanded ? 'Hide' : 'Edit'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-5 bg-white p-5">
                    <div className="grid gap-3 md:grid-cols-[1fr_1.2fr_140px_auto_auto]">
                      <input
                        value={stage.title}
                        onChange={(event) => handleStageFieldChange(stage.id, 'title', event.target.value)}
                        className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                      />
                      <input
                        value={stage.description || ''}
                        onChange={(event) => handleStageFieldChange(stage.id, 'description', event.target.value)}
                        className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                        placeholder="Stage description"
                      />
                      <input
                        type="number"
                        min={1}
                        value={stage.estimatedDays}
                        onChange={(event) => handleStageFieldChange(stage.id, 'estimatedDays', Number(event.target.value))}
                        className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                      />
                      <button
                        onClick={() => handleUpdateStage(stage)}
                        disabled={isSaving}
                        className="rounded-xl border border-[#d6c6b6] px-4 py-3 text-sm font-semibold text-[#5f4c3f] transition hover:bg-[#faf3ed] disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDeleteStage(stage.id)}
                        disabled={isSaving}
                        className="rounded-xl border border-[#f0d1d1] px-4 py-3 text-sm font-semibold text-[#b42318] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="rounded-2xl border border-[#efe5da] bg-[#fffdfa] p-4">
                      <p className="text-sm font-semibold text-[#2d2d2d]">Milestones</p>
                      <div className="mt-4 space-y-3">
                        {(stage.milestones || []).length === 0 ? (
                          <div className="rounded-xl border border-dashed border-[#e5ddd2] bg-[#fcfaf7] p-4 text-sm text-[#7b6a5e]">
                            No milestones in this stage yet.
                          </div>
                        ) : (
                          (stage.milestones || []).map((milestone, milestoneIndex) => (
                            <div key={milestone.id} className="rounded-xl border border-[#eadfd3] bg-white p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-[#1f2937]">
                                    {milestoneIndex + 1}. {milestone.title}
                                  </p>
                                  {milestone.description && (
                                    <p className="mt-1 text-sm leading-6 text-[#6b7280]">{milestone.description}</p>
                                  )}
                                </div>
                                {milestone.badgeUrl && (
                                  <img src={milestone.badgeUrl} alt="badge" className="h-10 w-10 rounded-full object-cover" />
                                )}
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#7b6a5e]">
                                <span className="rounded-full bg-[#f6efe7] px-3 py-1">
                                  {milestone.targetLessonsCount || 0} lessons
                                </span>
                                <span className="rounded-full bg-[#f6efe7] px-3 py-1">
                                  {milestone.targetQuizCount || 0} quizzes
                                </span>
                                <span className="rounded-full bg-[#f6efe7] px-3 py-1">
                                  {milestone.targetAssignmentCount || 0} assignments
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <input
                          value={draft.title}
                          onChange={(event) => handleMilestoneDraftChange(stage.id, 'title', event.target.value)}
                          placeholder="Milestone title"
                          className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                        />
                        <input
                          value={draft.description}
                          onChange={(event) => handleMilestoneDraftChange(stage.id, 'description', event.target.value)}
                          placeholder="Milestone description"
                          className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          value={draft.targetLessonsCount}
                          onChange={(event) => handleMilestoneDraftChange(stage.id, 'targetLessonsCount', Number(event.target.value))}
                          placeholder="Lessons target"
                          className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          value={draft.targetQuizCount}
                          onChange={(event) => handleMilestoneDraftChange(stage.id, 'targetQuizCount', Number(event.target.value))}
                          placeholder="Quiz target"
                          className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                        />
                        <input
                          type="number"
                          min={0}
                          value={draft.targetAssignmentCount}
                          onChange={(event) => handleMilestoneDraftChange(stage.id, 'targetAssignmentCount', Number(event.target.value))}
                          placeholder="Assignment target"
                          className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                        />
                        <input
                          value={draft.badgeUrl}
                          onChange={(event) => handleMilestoneDraftChange(stage.id, 'badgeUrl', event.target.value)}
                          placeholder="Badge image URL"
                          className="rounded-xl border border-[#d9cbbb] px-4 py-3 text-sm"
                        />
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleAddMilestone(stage.id)}
                          disabled={isSaving}
                          className="rounded-xl bg-[#8c6c54] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#755845] disabled:cursor-not-allowed disabled:bg-[#c7b5a5]"
                        >
                          Add Milestone
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

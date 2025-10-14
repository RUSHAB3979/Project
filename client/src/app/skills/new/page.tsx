"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] as const;
const SESSION_MODES = ['ONLINE', 'IN_PERSON', 'HYBRID'] as const;
const VISIBILITY_OPTIONS = ['PUBLIC', 'FOLLOWERS', 'SUBSCRIBERS', 'PRIVATE'] as const;

const SkillCreatePage = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    level: 'INTERMEDIATE' as (typeof LEVELS)[number],
    description: '',
    sessionMode: 'ONLINE' as (typeof SESSION_MODES)[number],
    visibility: 'PUBLIC' as (typeof VISIBILITY_OPTIONS)[number],
    location: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      router.push('/login');
      return;
    }
    setToken(stored);
  }, [router]);

  const canSubmit = useMemo(() => {
    return Boolean(form.name && form.category && form.description && token);
  }, [form.category, form.description, form.name, token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          description: form.description.trim(),
          tags: tags.map((tag) => tag.trim()).filter(Boolean),
          location: form.location.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to publish skill. Please try again.');
      }

      setSuccess('Skill published! Learners can now discover it in the marketplace.');
      setForm({
        name: '',
        category: '',
        level: 'INTERMEDIATE',
        description: '',
        sessionMode: 'ONLINE',
        visibility: 'PUBLIC',
        location: '',
      });
      setTags([]);
      setTagInput('');
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    event.preventDefault();
    const next = tagInput.trim();
    if (!next || tags.includes(next)) {
      return;
    }
    setTags((prev) => [...prev, next]);
    setTagInput('');
  };

  const removeTag = (name: string) => {
    setTags((prev) => prev.filter((tag) => tag !== name));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Publish a Skill</h1>
            <p className="mt-2 text-sm text-slate-600">
              Share what you can teach with the community. You can update or archive it anytime.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8 rounded-2xl bg-white p-6 shadow-lg">
          <section className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Skill title</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. UI Design Systems in Figma"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="Design"
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Level</label>
              <select
                value={form.level}
                onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value as typeof LEVELS[number] }))}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0) + level.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Session mode</label>
              <select
                value={form.sessionMode}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sessionMode: event.target.value as typeof SESSION_MODES[number] }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {SESSION_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Visibility</label>
              <select
                value={form.visibility}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, visibility: event.target.value as typeof VISIBILITY_OPTIONS[number] }))
                }
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {VISIBILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0) + option.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Location (optional)</label>
              <input
                type="text"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                placeholder="Remote, New York, etc."
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </section>

          <section>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <p className="mt-1 text-xs text-slate-500">
              Outline what learners will accomplish, session format, and expectations.
            </p>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={6}
              className="mt-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </section>

          <section>
            <label className="block text-sm font-medium text-slate-700">Tags</label>
            <p className="mt-1 text-xs text-slate-500">
              Add up to 8 keywords that help us recommend your skill to the right learners.
            </p>
            <input
              type="text"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Press Enter to add each tag"
              className="mt-3 w-full rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-500 transition hover:text-blue-700"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Publishing…' : 'Publish skill'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SkillCreatePage;

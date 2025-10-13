
"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';

interface SkillItem {
  id: string;
  name: string;
  category: string;
  level: string;
  description: string;
  sessionMode: string;
  location?: string | null;
  tags?: { id: string; name: string }[];
  teacher: {
    id: string;
    name: string;
    username: string;
    profileImg?: string | null;
    headline?: string | null;
    availability?: string;
  };
}

interface SkillsResponse {
  items: SkillItem[];
  total: number;
  page: number;
  pageSize: number;
}

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'EXPERT'];
const MODES = ['ONLINE', 'IN_PERSON', 'HYBRID'];

const SkillsPage = () => {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    level: '',
    mode: '',
  });

  const totalPages = useMemo(() => Math.ceil(total / 20) || 1, [total]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSkills = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters.q ? { q: filters.q } : {}),
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.level ? { level: filters.level } : {}),
        ...(filters.mode ? { mode: filters.mode } : {}),
      });

      try {
        const res = await fetch(`http://localhost:3001/api/skills?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('Failed to load skills');
        }
        const data: SkillsResponse = await res.json();
        setSkills(data.items);
        setTotal(data.total);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching skills:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
    return () => controller.abort();
  }, [page, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Explore Skills</h1>
            <p className="text-gray-600 mt-2">Discover mentors and peers teaching what you want to learn.</p>
          </div>
          <Link
            href="/teach"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Offer a Skill
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <input
            type="text"
            value={filters.q}
            onChange={(event) => handleFilterChange('q', event.target.value)}
            placeholder="Search by skill or keyword"
            className="md:col-span-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-400"
          />
          <input
            type="text"
            value={filters.category}
            onChange={(event) => handleFilterChange('category', event.target.value)}
            placeholder="Category"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-400"
          />
          <select
            value={filters.level}
            onChange={(event) => handleFilterChange('level', event.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All Levels</option>
            {LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <select
            value={filters.mode}
            onChange={(event) => handleFilterChange('mode', event.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700"
          >
            <option value="">All Modes</option>
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <section className="mt-10">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : skills.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-100 py-16 text-center text-gray-700">
              No skills found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {skills.map((skill) => (
                <article
                  key={skill.id}
                  className="flex h-full flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        {skill.category}
                      </span>
                      <span className="text-xs font-medium text-gray-500">{skill.level}</span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">{skill.name}</h2>
                    <p className="mt-3 line-clamp-3 text-sm text-gray-600">{skill.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skill.tags?.slice(0, 4).map((tag) => (
                        <span key={tag.id} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{skill.teacher.name}</p>
                      <p className="text-xs text-gray-500">{skill.teacher.headline || `@${skill.teacher.username}`}</p>
                    </div>
                    <Link
                      href={`/profile/${skill.teacher.username}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View mentor
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page === 1}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SkillsPage;

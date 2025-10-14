"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SkillItem {
  id: string;
  name: string;
  category: string;
  level: string;
  teacher: {
    id: string;
    name: string;
    username: string;
    headline?: string | null;
  };
  description: string;
}

const LearnPage = () => {
  const [recommended, setRecommended] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<'personalized' | 'fallback' | 'catalog' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      const storedToken = localStorage.getItem('token');

      try {
        if (storedToken) {
          const res = await fetch('http://localhost:3001/api/skills/recommended', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            signal: controller.signal,
          });

          if (res.ok) {
            const data = await res.json();
            setRecommended(data.items ?? []);
            setSource(data.source ?? 'personalized');
            setIsLoading(false);
            return;
          }

          if (res.status === 401) {
            localStorage.removeItem('token');
          }
        }

        const fallbackRes = await fetch('http://localhost:3001/api/skills?page=1&pageSize=6', {
          signal: controller.signal,
        });

        if (!fallbackRes.ok) {
          throw new Error('Failed to load skills');
        }

        const fallbackData = await fallbackRes.json();
        setRecommended(fallbackData.items ?? []);
        setSource('catalog');
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Error loading recommendations:', fetchError);
          setError('We could not load recommendations right now.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-16 sm:px-6 lg:px-8">
        <header className="animate-fade-up">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300/70">SkillXchange</p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl lg:text-5xl">Find mentors that elevate your craft</h1>
          <p className="mt-4 max-w-2xl text-base text-blue-100/80 sm:text-lg">
            Curated mentors, masterclasses, and micro-cohorts designed to help you learn faster. Tell us what you want to grow in and we will personalise a learning path.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/skills"
              className="w-full rounded-lg bg-blue-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] hover:bg-blue-400 sm:w-auto"
            >
              Browse live mentors
            </Link>
            <Link
              href="/dashboard"
              className="w-full rounded-lg border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white/90 transition hover:border-white/40 hover:text-white sm:w-auto"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          {[{
            title: 'Micro mentorships',
            description: '2-week sprints with industry mentors to unblock you on a specific goal.'
          }, {
            title: 'Collaborative cohorts',
            description: 'Join a focused learning pod with peers targeting the same outcome.'
          }, {
            title: 'Skill coins funded',
            description: 'Use SkillCoins to unlock 1:1 time or community office hours without spending cash.'
          }, {
            title: 'Progress tracking',
            description: 'Automated nudges, reflections, and feedback loops so you always know what is next.'
          }].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm text-blue-100/80">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Recommended for you</h2>
              <p className="text-sm text-blue-100/80">
                {source === 'personalized'
                  ? 'Personalised matches based on the skills in your learning plan.'
                  : source === 'catalog'
                  ? 'Popular mentors from our community while you curate your learning plan.'
                  : 'Fresh mentors being curated for you.'}
              </p>
            </div>
            <Link
              href="/skills"
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-xs font-semibold text-white/90 transition hover:border-white/40 hover:text-white"
            >
              See all skills
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="mt-8 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent" />
            </div>
          ) : recommended.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-white/20 bg-white/5 px-6 py-10 text-center text-sm text-blue-100/70">
              Add skills to your learning plan to unlock tailored mentor recommendations.
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {recommended.map((skill) => (
                <article key={skill.id} className="rounded-2xl border border-white/15 bg-white/10 p-6 shadow-lg shadow-blue-950/20">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-blue-200/80">
                    <span>{skill.category}</span>
                    <span>{skill.level}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{skill.name}</h3>
                  <p className="mt-3 line-clamp-3 text-sm text-blue-100/80">{skill.description}</p>
                  <div className="mt-6 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-white">{skill.teacher.name}</p>
                      <p className="text-blue-200/70">{skill.teacher.headline || `@${skill.teacher.username}`}</p>
                    </div>
                    <Link href={`/profile/${skill.teacher.username}`} className="text-blue-200 hover:text-white">
                      View mentor
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LearnPage;

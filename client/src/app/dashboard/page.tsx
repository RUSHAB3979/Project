'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface DashboardUser {
  id: string;
  name: string;
  username?: string;
  skillcoins: number;
  onboardingStep?: number;
  profileImg?: string | null;
  headline?: string | null;
}

interface MatchItem {
  matchUser: {
    id: string;
    name: string;
    username: string;
    profileImg?: string | null;
    headline?: string | null;
    availability?: string;
    subscriptionTier?: string;
    skillcoins?: number;
  };
  score: number;
  reasons: string[];
}

interface SkillItem {
  id: string;
  name: string;
  category: string;
  level: string;
  teacher: { name: string; username: string };
}

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [recommendedSkills, setRecommendedSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const fetchDashboard = async () => {
      try {
        const [userRes, matchesRes, skillsRes] = await Promise.all([
          fetch('http://localhost:3001/api/auth/me', { headers }),
          fetch('http://localhost:3001/api/matches', { headers }),
          fetch('http://localhost:3001/api/skills/recommended', { headers }),
        ]);

        if (userRes.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const userData = await userRes.json();
        const matchData = (await matchesRes.json())?.items ?? [];
        const skillData = (await skillsRes.json())?.items ?? [];

        setUser({
          ...userData,
          profileImg: userData.profileImg ?? userData.profile_img ?? null,
        });
        setMatches(matchData);
        setRecommendedSkills(skillData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const perfectMatches = useMemo(() => matches.slice(0, 6), [matches]);
  const topSkills = useMemo(() => recommendedSkills.slice(0, 6), [recommendedSkills]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl bg-white/90 p-6 shadow-lg sm:p-8 animate-fade-up">
                <div className="pointer-events-none absolute -top-16 -right-14 h-44 w-44 rounded-full bg-blue-100/70 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-cyan-200/60 blur-3xl" />
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  Ready to teach, learn, or collaborate today? Explore your perfect matches and recommended skills to keep growing.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                  <Link
                    href="/skills/new"
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:w-auto sm:px-5"
                  >
                    Offer a Skill
                  </Link>
                  <Link
                    href="/learn"
                    className="w-full rounded-lg border border-blue-600 px-4 py-3 text-center text-sm font-semibold text-blue-600 hover:bg-blue-50 sm:w-auto sm:px-5"
                  >
                    Find a Mentor
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8 animate-fade-up">
                <div className="pointer-events-none absolute right-10 top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl float-slow" />
                <div className="pointer-events-none absolute left-0 bottom-0 h-32 w-32 translate-y-12 rounded-full bg-white/10 blur-3xl" />
                <p className="text-sm uppercase tracking-wide text-blue-100/80 sm:text-xs">SkillCoins</p>
                <p className="mt-4 text-4xl font-bold sm:text-5xl">{user?.skillcoins ?? 0}</p>
                <p className="mt-2 text-sm text-blue-100 sm:text-base">Earn by teaching peers or completing mentorship sessions.</p>
                <Link href="/wallet" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-white/90 underline">
                  View wallet activity
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </section>

            <section className="mt-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Perfect Matches</h2>
                <Link href="/community" className="text-sm font-semibold text-blue-600 hover:underline sm:text-base">
                  See all
                </Link>
              </div>
              {perfectMatches.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white/90 p-10 text-center text-gray-500">
                  No matches yet. Add more skills you want to learn or teach to improve recommendations.
                </div>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {perfectMatches.map((match) => (
                    <article key={match.matchUser.id} className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white/95 p-5 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-gray-900">{match.matchUser.name}</p>
                          <p className="text-xs text-gray-500">{match.matchUser.headline || `@${match.matchUser.username}`}</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                          Match {Math.round(match.score)}%
                        </span>
                      </div>
                      <ul className="mt-4 space-y-1 text-xs text-gray-600">
                        {match.reasons.map((reason) => (
                          <li key={reason}>• {reason}</li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/profile/${match.matchUser.username}`} className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                          View profile
                        </Link>
                        <Link href={`/mentorship`} className="text-gray-500 hover:text-gray-700 sm:text-right">
                          Start chat
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Recommended Skills</h2>
                <Link href="/skills" className="text-sm font-semibold text-blue-600 hover:underline sm:text-base">
                  Explore more
                </Link>
              </div>
              {topSkills.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                  We&apos;re still curating skills for you. Check back soon.
                </div>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {topSkills.map((skill) => (
                    <article key={skill.id} className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white/95 p-5 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1 text-xs font-semibold text-orange-500">
                          {skill.category}
                        </span>
                        <span className="text-xs font-medium text-gray-500">{skill.level}</span>
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-gray-900">{skill.name}</h3>
                      <p className="mt-2 text-sm text-gray-600">By {skill.teacher.name}</p>
                      <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <Link href={`/skills`} className="font-semibold text-blue-600 hover:underline">
                          View details
                        </Link>
                        <Link href={`/profile/${skill.teacher.username}`} className="text-gray-500 hover:text-gray-700 sm:text-right">
                          Mentor profile
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

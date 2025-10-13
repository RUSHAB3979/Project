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
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''} 👋</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Ready to teach, learn, or collaborate today? Explore your perfect matches and recommended skills to keep growing.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href="/teach"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                  >
                    Offer a Skill
                  </Link>
                  <Link
                    href="/learn"
                    className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Find a Mentor
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100">SkillCoins</p>
                <p className="mt-4 text-4xl font-bold">{user?.skillcoins ?? 0}</p>
                <p className="mt-2 text-sm text-blue-100">Earn by teaching peers or completing mentorship sessions.</p>
                <Link href="/wallet" className="mt-6 inline-flex text-sm font-semibold text-white/90 underline">
                  View wallet activity
                </Link>
              </div>
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Perfect Matches</h2>
                <Link href="/community" className="text-sm font-semibold text-blue-600 hover:underline">
                  See all
                </Link>
              </div>
              {perfectMatches.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                  No matches yet. Add more skills you want to learn or teach to improve recommendations.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {perfectMatches.map((match) => (
                    <article key={match.matchUser.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
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
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <Link href={`/profile/${match.matchUser.username}`} className="font-semibold text-blue-600 hover:underline">
                          View profile
                        </Link>
                        <Link href={`/mentorship`} className="text-gray-500 hover:text-gray-700">
                          Start chat
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recommended Skills</h2>
                <Link href="/skills" className="text-sm font-semibold text-blue-600 hover:underline">
                  Explore more
                </Link>
              </div>
              {topSkills.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
                  We&apos;re still curating skills for you. Check back soon.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {topSkills.map((skill) => (
                    <article key={skill.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500">
                          {skill.category}
                        </span>
                        <span className="text-xs font-medium text-gray-500">{skill.level}</span>
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-gray-900">{skill.name}</h3>
                      <p className="mt-2 text-sm text-gray-600">By {skill.teacher.name}</p>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <Link href={`/skills`} className="font-semibold text-blue-600 hover:underline">
                          View details
                        </Link>
                        <Link href={`/profile/${skill.teacher.username}`} className="text-gray-500 hover:text-gray-700">
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

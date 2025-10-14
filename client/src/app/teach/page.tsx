"use client";

import Link from 'next/link';

const TeachPage = () => {
  const highlights = [
    {
      title: 'Launch a skill offering',
      description: 'Create beautiful listings with structured outcomes, session templates, and scheduling preferences.'
    },
    {
      title: 'Automated matching',
      description: 'We surface learners that align with your expertise and availability so you can start faster.'
    },
    {
      title: 'Earn SkillCoins and payouts',
      description: 'Convert SkillCoins into perks or cash out via verified mentors program.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-16 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl sm:p-12 animate-fade-up">
          <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-sky-200/60 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-32 w-32 translate-y-16 rounded-full bg-blue-100/70 blur-3xl" />
          <p className="text-sm uppercase tracking-[0.35em] text-blue-500/80">Teach on SkillXchange</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Turn your expertise into outcomes for learners everywhere
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
            Set your format, define learner expectations, and start teaching in minutes. Our marketplace amplifies your reach with built-in reputation, reviews, and growth tools.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/skills/new"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:scale-[1.01] hover:bg-blue-500 sm:w-auto"
            >
              Publish a skill
            </Link>
            <Link
              href="/skills"
              className="w-full rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 sm:w-auto"
            >
              Explore existing offers
            </Link>
            <Link
              href="/dashboard"
              className="w-full rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 sm:w-auto"
            >
              Back to dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl"
            >
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-2xl sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Ready to publish your first skill?</h3>
              <p className="mt-3 max-w-xl text-sm text-white/70">
                Apply for the verified mentor badge to unlock featured placement, early-access learners, and premium payouts.
              </p>
            </div>
            <Link
              href="/signup"
              className="w-full rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:scale-[1.01] sm:w-auto"
            >
              Become a verified mentor
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeachPage;

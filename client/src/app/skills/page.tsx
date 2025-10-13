
"use client";

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: string;
  description: string;
  user: {
    name: string;
  };
}

const SkillsPage: NextPage = () => {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const res = await fetch('http://localhost:3001/api/skills');
      const data = await res.json();
      setSkills(data);
    };

    fetchSkills();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-700">
              <a href="#">SkillXchange</a>
            </div>
            <div>
              <a href="/dashboard" className="px-3 py-2 text-gray-700 rounded hover:bg-gray-200">Dashboard</a>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-gray-800">Explore Skills</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800">{skill.name}</h2>
              <p className="mt-2 text-gray-600">{skill.category} - {skill.level}</p>
              <p className="mt-4 text-gray-600">{skill.description}</p>
              <p className="mt-4 text-gray-600 font-semibold">Taught by: {skill.user.name}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SkillsPage;

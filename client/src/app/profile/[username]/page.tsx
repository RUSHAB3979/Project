
"use client";

import type { NextPage } from 'next';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  bio: string;
}

const ProfilePage: NextPage = () => {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(`http://localhost:3001/api/users/${username}`);
      const data = await res.json();
      setUser(data);
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  if (!user) {
    return <div>Loading...</div>;
  }

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
        <div className="flex items-center">
          <div className="w-32 h-32 rounded-full bg-gray-300"></div>
          <div className="ml-6">
            <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
            <p className="mt-2 text-lg text-gray-600">{user.college}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800">About</h2>
          <p className="mt-2 text-gray-600">{user.bio}</p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

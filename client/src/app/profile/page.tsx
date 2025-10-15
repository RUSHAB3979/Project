'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { apiUrl } from '@/lib/api';

type AvailabilityStatus = 'ONLINE' | 'BUSY' | 'LEARNING' | 'OFFLINE';

interface User {
  id: string;
  name: string;
  email: string;
  profileImg: string | null;
  role: string;
  college?: string;
  bio?: string;
  skillcoins: number;
  availability?: AvailabilityStatus;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    college: '',
    availability: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
  const res = await fetch(apiUrl('/api/auth/me'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const userData = await res.json();
        setUser({
          ...userData,
          profileImg: userData.profileImg ?? userData.profile_img ?? null,
        });
        setFormData({
          bio: userData.bio || '',
          college: userData.college || '',
          availability: userData.availability === 'ONLINE'
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !user) return;

    try {
  const res = await fetch(apiUrl(`/api/users/${user.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: formData.bio,
          college: formData.college,
          availability: formData.availability ? 'ONLINE' : 'OFFLINE'
        })
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updatedUser = await res.json();
      setUser(updatedUser);
      setFormData({
        bio: updatedUser.bio || '',
        college: updatedUser.college || '',
        availability: updatedUser.availability === 'ONLINE'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-5">
              {user.profileImg ? (
                <Image
                  src={user.profileImg}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="rounded-full"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-4xl">{user.name[0]}</span>
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-blue-600">{user.skillcoins} SkillCoins</p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">College</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Available for tutoring
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Bio</h3>
                  <p className="mt-1 text-gray-600">{user.bio || 'No bio yet'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">College</h3>
                  <p className="mt-1 text-gray-600">{user.college || 'Not specified'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Availability</h3>
                  <p className="mt-1 text-gray-600">
                    {user.availability === 'ONLINE' ? 'Available for tutoring' : 'Not available for tutoring'}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
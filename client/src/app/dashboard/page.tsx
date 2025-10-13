'use client';

import type { NextPage } from 'next';
import Navbar from '@/components/Navbar';

const Dashboard: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <h1 className="text-2xl font-semibold text-gray-700">Welcome to SkillXchange</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

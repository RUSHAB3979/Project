import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-700">
              <a href="#">SkillXchange</a>
            </div>
            <div>
              <a href="/login" className="px-3 py-2 text-gray-700 rounded hover:bg-gray-200">Login</a>
              <a href="/signup" className="px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">Sign Up</a>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Welcome to SkillXchange</h1>
          <p className="mt-2 text-lg text-gray-600">Learn. Teach. Grow. Together.</p>
        </div>
      </main>

      <footer className="bg-white">
        <div className="container mx-auto px-6 py-4">
          <p className="text-center text-gray-500">© 2025 SkillXchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
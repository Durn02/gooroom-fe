'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Main() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNavigation = (path: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Hero Section */}
      <div className="relative h-screen-80 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30" />
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Connect & Create with GooRoom</h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Share your ideas, collaborate with others, and discover amazing content in our vibrant community.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleNavigation('/signin')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation('/signup')}
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 transition-all transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Join GooRoom?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-600 text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-3">Instant Access</h3>
              <p className="text-gray-600">Get started in seconds with easy signup and intuitive interface</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-600 text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-3">Creative Freedom</h3>
              <p className="text-gray-600">Express yourself through multimedia posts and interactions</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-600 text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-3">Global Network</h3>
              <p className="text-gray-600">Connect with my friends, also with their friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Community Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

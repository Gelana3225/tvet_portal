import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to Hawagalan TVET College
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Student Registration Portal
          </p>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Apply for technical and vocational education programs
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Register Now
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Easy Registration</h3>
              <p className="mt-2 text-gray-600">
                Simple online registration process with step-by-step guidance
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Multiple Programs</h3>
              <p className="mt-2 text-gray-600">
                Choose from IT, Construction, Automotive, Electrical, and more
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Track Application</h3>
              <p className="mt-2 text-gray-600">
                Monitor your application status in real-time through your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

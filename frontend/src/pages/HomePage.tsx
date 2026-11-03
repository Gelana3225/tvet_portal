function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Hawagalan TVET College
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Student Registration System
        </p>
        <div className="space-y-4">
          <p className="text-gray-500">
            Welcome to the student registration portal
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Apply Now
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

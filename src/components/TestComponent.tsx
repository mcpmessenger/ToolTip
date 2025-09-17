import React from 'react'

const TestComponent: React.FC = () => {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Test Component
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        If you can see this, the React app is working!
      </p>
      <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded">
        <p className="text-blue-800 dark:text-blue-200">
          Environment variables loaded: {import.meta.env.VITE_OPENAI_API_KEY ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  )
}

export default TestComponent

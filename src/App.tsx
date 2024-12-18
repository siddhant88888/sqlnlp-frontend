import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function App() {
  const [formData, setFormData] = useState({
    db_uri: '',
    llm_type: 'OpenAI',
    api_key: '',
    aws_access_key_id: '',
    aws_secret_access_key: '',
  });

  const [question, setQuestion] = useState('');
  const [result, setResult] = useState({ sql_query: '', answer: '' });
  const [loading, setLoading] = useState(false);
  const [dbSchema, setDbSchema] = useState<string>('');
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const processSchemaString = (schema: string) => {
    return schema.replace(/\\n/g, '\n').replace(/\\/g, '');
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSchemaLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/connect`, formData);
      if (response.data.schema) {
        setDbSchema(processSchemaString(response.data.schema));
        setConnected(true);
      } else {
        setError('No schema data received from the server.');
        setDbSchema('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while connecting to the database. Please try again.');
      setDbSchema('');
      setConnected(false);
    }
    setLoading(false);
    setSchemaLoading(false);
  };

  const handleQuery = async () => {
    if (!connected) {
      setError('Please connect to a database first.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/query`, { ...formData, question });
      setResult({
        sql_query: response.data.sql_query || '',
        answer: response.data.answer || ''
      });
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while processing your request. Please try again.');
      setResult({ sql_query: '', answer: '' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white p-6 shadow-md overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
        <form onSubmit={handleConnect}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Database URI</label>
              <input
                type="text"
                name="db_uri"
                value={formData.db_uri}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="postgresql://username:password@host:port/database"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">LLM Type</label>
              <select
                name="llm_type"
                value={formData.llm_type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="OpenAI">OpenAI</option>
                <option value="AWS Bedrock">AWS Bedrock</option>
                <option value="Anthropic">Anthropic</option>
              </select>
            </div>
            {formData.llm_type === 'OpenAI' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                <input
                  type="password"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="OpenAI API Key"
                  required
                />
              </div>
            )}
            {formData.llm_type === 'AWS Bedrock' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">AWS Access Key ID</label>
                  <input
                    type="text"
                    name="aws_access_key_id"
                    value={formData.aws_access_key_id}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="AWS Access Key ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">AWS Secret Access Key</label>
                  <input
                    type="password"
                    name="aws_secret_access_key"
                    value={formData.aws_secret_access_key}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="AWS Secret Access Key"
                    required
                  />
                </div>
              </>
            )}
            {formData.llm_type === 'Anthropic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Anthropic API Key</label>
                <input
                  type="password"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Anthropic API Key"
                  required
                />
              </div>
            )}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </form>
        {connected && <p className="mt-4 text-green-600 font-semibold">Connected to database</p>}
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-6">SQL Assistant</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Database Schema</h2>
            {schemaLoading ? (
              <p>Loading schema...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : dbSchema ? (
              <pre className="w-full h-64 p-4 overflow-auto bg-gray-800 text-green-400 rounded-md font-mono text-sm whitespace-pre-wrap">
                <code>{dbSchema}</code>
              </pre>
            ) : (
              <p>No schema available. Please connect to a database first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
            <div className="flex">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-grow mt-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ask a question about your database"
                required
              />
              <button
                onClick={handleQuery}
                className="mt-1 flex-shrink-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit Query
              </button>
            </div>
          </div>
          {result.sql_query && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Generated SQL Query:</h2>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
                <code>{result.sql_query}</code>
              </pre>
            </div>
          )}
          {result.answer && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Answer:</h2>
              <p className="bg-white p-4 rounded-md shadow">{result.answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

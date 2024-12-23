import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function App() {
  const handleLike = async () => {
    try {
      await axios.post(`${API_URL}/noice`, {
        noice: true,
        input: "Schema:" + dbSchema + "\n\nQuestion: " + question,
        output: result.sql_query
      });
    } catch (error) {
      console.error('Error in handleLike:', error);
    }
  };

  const handleDislike = () => {
    console.log('ok');
  };

  const [formData, setFormData] = useState({
    db_uri: '',
    llm_type: 'gpt-4o',
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
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="claude-3-sonnet">claude-3-sonnet</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                <option value="gemma2-9b-it">gemma2-9b-it</option>
                <option value="Phi-3.5-mini-instruct">Phi-3.5-mini-instruct</option>
                
              </select>
            </div>
            {(formData.llm_type === 'gpt-4o' || formData.llm_type === 'gpt-4o-mini') && (
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
            
            {formData.llm_type === 'claude-3-sonnet' && (
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
            {(formData.llm_type === 'llama-3.3-70b-versatile' || formData.llm_type === 'gemma2-9b-it') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Groq API Key</label>
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
            {formData.llm_type === 'Phi-3.5-mini-instruct' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Huggingface API Key</label>
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
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleLike}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Like
                </button>
                <button
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleDislike}
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  Dislike
                </button>
              </div>
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

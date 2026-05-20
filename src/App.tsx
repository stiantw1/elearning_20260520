/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Loader2, Sparkles } from 'lucide-react';

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();
      if (data.result) {
        setOutput(data.result);
      } else {
        alert("生成失敗，請稍後再試。");
      }
    } catch (error) {
      console.error(error);
      alert("連線錯誤，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('已複製到剪貼簿');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 text-center">AI 會議記錄生成器</h1>
          <p className="text-center text-gray-600 mt-2">請貼上會議內容以快速生成總結</p>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="請在此貼上您的會議逐字稿或筆記..."
            className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
          />
          <button
            onClick={generateSummary}
            disabled={loading || !input}
            className="mt-4 flex items-center justify-center gap-2 w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Sparkles size={20} />
            )}
            {loading ? '生成中...' : '生成總結與翻譯'}
          </button>
        </section>

        {output && (
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
            <h2 className="text-2xl font-bold mb-4">生成結果</h2>
            <button
              onClick={copyToClipboard}
              className="absolute top-6 right-6 p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              title="複製到剪貼簿"
            >
              <Copy size={20} />
            </button>
            <div className="prose prose-indigo max-w-none">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

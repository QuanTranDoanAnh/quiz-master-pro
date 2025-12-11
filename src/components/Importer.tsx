import React, { useState } from 'react';
import { Button } from './Button';
import { FileUp, AlertCircle } from 'lucide-react';
import { parseHtmlToQuestions } from '../utils/parser';
import type { Question } from '../types';

interface ImporterProps {
  onImport: (questions: Question[]) => void;
  onCancel: () => void;
}

export const Importer: React.FC<ImporterProps> = ({ onImport, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        processContent(content);
      } catch {
        setError("Failed to read file.");
      }
    };
    reader.readAsText(file);
  };

  const processContent = (content: string) => {
    try {
      const parsedQuestions = parseHtmlToQuestions(content);
      if (parsedQuestions.length === 0) {
        setError("No valid questions found. Ensure the format matches: 'Question X:' (bold) followed by options 'a.', 'b.' etc. Correct answers must be bold.");
        return;
      }
      onImport(parsedQuestions);
    } catch (err) {
      console.error(err);
      setError("An error occurred while parsing content.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Import Question Bank</h2>
      
      <div className="flex space-x-4 mb-6 border-b border-slate-200">
        <button
          className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'file' ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}
          onClick={() => setActiveTab('file')}
        >
          Upload HTML File
        </button>
        <button
          className={`pb-2 px-4 font-medium text-sm transition-colors ${activeTab === 'text' ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}
          onClick={() => setActiveTab('text')}
        >
          Paste Content
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {activeTab === 'file' && (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors">
          <FileUp className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-slate-700 font-medium">Click to upload your exported Word (.html) file</p>
          <p className="text-slate-500 text-sm mt-2">Supports .html or .htm exports from Word</p>
          <input
            type="file"
            accept=".html,.htm"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {activeTab === 'text' && (
        <div className="space-y-4">
          <textarea
            className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            placeholder="Paste the HTML source code here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <Button fullWidth onClick={() => processContent(textInput)} disabled={!textInput.trim()}>
            Parse & Import
          </Button>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <h4 className="font-bold mb-2">How to prepare your file:</h4>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Open your Question Bank in Microsoft Word.</li>
          <li>Ensure Questions start with "Question X:" in <b>Bold</b>.</li>
          <li>Ensure Correct Answers are <b>Bolded</b>.</li>
          <li>Go to File &gt; Save As &gt; Web Page (*.htm; *.html).</li>
          <li>Upload that file here.</li>
        </ol>
      </div>
    </div>
  );
};

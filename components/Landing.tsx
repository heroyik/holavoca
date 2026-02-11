
import React, { useState } from 'react';
import { extractVocabularyFromImages } from '../services/gemini';
import { Word } from '../types';

interface LandingProps {
  onStart: () => void;
  onImport: (words: Word[]) => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onImport }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsExtracting(true);
    setError(null);

    try {
      // Fix: Cast file to File to satisfy URL.createObjectURL requirements
      const urls = Array.from(files).map(file => URL.createObjectURL(file as File));
      const extractedWords = await extractVocabularyFromImages(urls);
      onImport(extractedWords);
      onStart();
    } catch (err) {
      setError("Failed to extract words. Please make sure the images are clear and try again.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-xl shadow-amber-200">
        H
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Master Spanish with <span className="text-amber-500 underline decoration-amber-200 decoration-4">HolaVoca</span>
      </h1>
      <p className="text-lg text-slate-600 mb-10 leading-relaxed">
        Upload photos of your Spanish textbook vocabulary pages, and we'll instantly turn them into interactive learning tools. Practice with flashcards, take quizzes, and talk to your personal AI voice tutor.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <label className="flex-1 cursor-pointer group">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
            disabled={isExtracting}
          />
          <div className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-3">
            {isExtracting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Extracting Words...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                Import from Textbook
              </>
            )}
          </div>
        </label>
        
        <button 
          onClick={onStart}
          className="flex-1 bg-white border-2 border-slate-200 hover:border-amber-500 text-slate-700 font-bold py-4 px-8 rounded-xl transition-all hover:text-amber-600"
        >
          Continue to Dashboard
        </button>
      </div>

      {error && (
        <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
          </div>
          <h3 className="font-bold text-slate-900 mb-1">OCR Extraction</h3>
          <p className="text-slate-500 text-sm">Convert textbook images into a digital word list instantly.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Voice Practice</h3>
          <p className="text-slate-500 text-sm">Practice pronunciation with an AI that understands Spanish perfectly.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Smart SRS</h3>
          <p className="text-slate-500 text-sm">Focus on words you struggle with most for efficient learning.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;

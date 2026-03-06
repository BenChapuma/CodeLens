import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Send, Loader2, RefreshCw, ChevronRight, Terminal, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { explainCode, CodeExplanation } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await explainCode(code);
      setExplanation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setCode('');
    setExplanation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-line p-6 flex items-center justify-between bg-brand-bg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-ink text-brand-bg rounded-lg">
            <Code2 size={24} />
          </div>
          <div>
            <h1 className="font-mono font-bold text-xl tracking-tighter uppercase">CodeLens</h1>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">v1.0 // AI-Powered Explainer</p>
          </div>
        </div>
        
        {explanation && (
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 border border-brand-line hover:bg-brand-ink hover:text-brand-bg transition-colors font-mono text-xs uppercase"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Input Section */}
        <section className={cn(
          "flex-1 p-6 flex flex-col gap-4 border-brand-line",
          explanation ? "lg:border-r" : ""
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono opacity-50 uppercase tracking-wider">
              <Terminal size={14} />
              Input Snippet
            </div>
          </div>
          
          <div className="flex-1 relative group">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-full min-h-[300px] p-6 bg-white/50 border border-brand-line rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-ink/10 resize-none transition-all"
              spellCheck={false}
            />
            {!code && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <Code2 size={48} />
              </div>
            )}
          </div>

          <button
            onClick={handleExplain}
            disabled={isLoading || !code.trim()}
            className={cn(
              "w-full py-4 flex items-center justify-center gap-3 font-mono font-bold uppercase tracking-widest transition-all rounded-xl",
              isLoading || !code.trim() 
                ? "bg-brand-ink/10 text-brand-ink/30 cursor-not-allowed" 
                : "bg-brand-ink text-brand-bg hover:scale-[1.01] active:scale-[0.99]"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send size={20} />
                Explain Code
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-mono rounded-lg">
              {error}
            </div>
          )}
        </section>

        {/* Output Section */}
        <AnimatePresence>
          {explanation && (
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 p-6 bg-white/30 overflow-y-auto max-h-[calc(100vh-100px)]"
            >
              <div className="flex items-center gap-2 text-xs font-mono opacity-50 uppercase tracking-wider mb-6">
                <BookOpen size={14} />
                Breakdown
              </div>

              <div className="space-y-8">
                {/* Summary Card */}
                <div className="p-6 border border-brand-line rounded-2xl bg-white shadow-sm">
                  <h3 className="font-mono text-[10px] uppercase opacity-50 mb-2 tracking-widest">Summary</h3>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{explanation.summary}</ReactMarkdown>
                  </div>
                </div>

                {/* Line by Line */}
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] uppercase opacity-50 mb-4 tracking-widest">Line-by-Line Analysis</h3>
                  {explanation.lineByLine.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4 p-4 border-b border-brand-line/10 hover:bg-brand-ink/[0.02] transition-colors">
                        <div className="font-mono text-xs bg-brand-ink/5 p-3 rounded-lg overflow-x-auto whitespace-pre">
                          {item.line}
                        </div>
                        <div className="flex items-start gap-3 py-1">
                          <ChevronRight size={16} className="mt-1 text-brand-ink/30 shrink-0" />
                          <p className="text-sm leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-line p-4 text-center">
        <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
          Powered by Gemini 3 Flash // Built for clarity
        </p>
      </footer>
    </div>
  );
}

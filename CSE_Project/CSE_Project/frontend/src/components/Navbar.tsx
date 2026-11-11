import React from 'react';
import { useAnalysis, NavTab } from '../context/AnalysisContext';
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, analysisResults, documents, isAnalyzing } = useAnalysis();

  const isLabActive = activeTab === 'lab' || activeTab === 'input' || activeTab === 'config';
  const isResultsActive = activeTab === 'results' || activeTab === 'clusters' || activeTab === 'evaluation';
  const isExplainActive = activeTab === 'explain' || activeTab === 'document';

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; isActive: boolean; disabled: boolean }[] = [
    { 
      id: 'lab', 
      label: '1. Document Lab', 
      icon: <FileText className="w-4 h-4 mr-2" />, 
      isActive: isLabActive,
      disabled: false 
    },
    { 
      id: 'results', 
      label: '2. Analysis Results', 
      icon: <Layers className="w-4 h-4 mr-2" />, 
      isActive: isResultsActive,
      disabled: !analysisResults 
    },
    { 
      id: 'explain', 
      label: '3. Explainability & Evaluation', 
      icon: <HelpCircle className="w-4 h-4 mr-2" />, 
      isActive: isExplainActive,
      disabled: !analysisResults 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Course Header */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('lab')}>
            <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight">QuantumLens</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  NLP Laboratory
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Advanced Social Media & Text Analysis Demonstration
              </p>
            </div>
          </div>

          {/* Analysis State Indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-xs">
            {isAnalyzing ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-2" />
                Analyzing Documents...
              </span>
            ) : analysisResults ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                {analysisResults.summary_metrics.num_documents} Documents Analyzed • {analysisResults.summary_metrics.num_clusters} Groups Discovered
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                {documents.length} Loaded Documents
              </span>
            )}
          </div>
        </div>

        {/* 3-Section Streamlined Navigation */}
        <nav className="flex space-x-2 border-t border-slate-100 py-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && setActiveTab(item.id)}
              disabled={item.disabled}
              className={`flex items-center px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors ${
                item.isActive
                  ? 'text-blue-700 bg-blue-50 border border-blue-200 shadow-2xs'
                  : item.disabled
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

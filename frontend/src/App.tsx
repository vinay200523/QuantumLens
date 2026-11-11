import React from 'react';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import { Navbar } from './components/Navbar';
import { DocumentLabPage } from './pages/DocumentLabPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { ExplainabilityEvaluationPage } from './pages/ExplainabilityEvaluationPage';

const AppContent: React.FC = () => {
  const { activeTab } = useAnalysis();

  const isLabActive = activeTab === 'lab' || activeTab === 'input' || activeTab === 'config';
  const isResultsActive = activeTab === 'results' || activeTab === 'clusters' || activeTab === 'evaluation';
  const isExplainActive = activeTab === 'explain' || activeTab === 'document';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLabActive && <DocumentLabPage />}
        {isResultsActive && <AnalysisResultsPage />}
        {isExplainActive && <ExplainabilityEvaluationPage />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">QuantumLens</span>
            <span>&bull;</span>
            <span>University NLP Laboratory Project</span>
            <span>&bull;</span>
            <span>Advanced Social Media & Text Analysis</span>
          </div>
          <div className="text-slate-400">
            Explainable Text Summarization & KNN-Based Document Clustering
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AnalysisProvider>
      <AppContent />
    </AnalysisProvider>
  );
};

export default App;

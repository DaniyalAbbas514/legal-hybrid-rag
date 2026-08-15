import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';

const WelcomeContent = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  const [activeTab, setActiveTab] = useState('case');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const chatEndRef = useRef(null);

  // Authenticate user
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isSearching]);

  if (!currentUser) {
    return null;
  }

  const userEmail = currentUser?.email || currentUser?.user?.email || '';

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleNewQuery = () => {
    setChatHistory([]);
    setActiveTab('case');
  };

  const handleSendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    // Add user message
    const userMessage = { sender: 'user', text: queryText };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsSearching(true);

    try {
      const res = await fetch('/embeddings/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText, limit: 5 }),
      });

      if (res.ok) {
        const data = await res.json();
        let replyText = '';

        if (data.results && data.results.length > 0) {
          replyText = `Based on a hybrid RAG search of the judgment records, here are the most relevant findings matching your query:\n\n`;
          data.results.forEach((node, idx) => {
            const docName = node.pdf_id || "Judgment Record";
            const content = node.text || node.content || "";
            const pageInfo = node.page_number ? ` (Page ${node.page_number})` : "";
            
            replyText += `### ${idx + 1}. ${docName}${pageInfo}\n`;
            // Clean up content snippet
            const snippet = content.length > 300 ? content.substring(0, 300) + "..." : content;
            replyText += `*${snippet.trim()}*\n\n`;
          });
        } else {
          replyText = `I ran a search across the judgment archives, but could not find any records matching your query. Try adjusting your search terms or using broader legal keywords.`;
        }

        setChatHistory((prev) => [...prev, { sender: 'ai', text: replyText }]);
      } else {
        // Fallback simulated response
        const fallbackText = `I processed your request, but the retrieval service returned an error status. Here is an overview based on general legal concepts:\n\n*For "${queryText}", you should consult specific state code rules and appellate rulings regarding these contract and liability elements. Confirm all citations before draft integration.*`;
        setChatHistory((prev) => [...prev, { sender: 'ai', text: fallbackText }]);
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorText = `Unable to connect to the backend search service.\n\n*Fallback assessment for "${queryText}": Please ensure your backend server and vector store are running. Standard procedure in this domain requires verifying primary authorities directly.*`;
      setChatHistory((prev) => [...prev, { sender: 'ai', text: errorText }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCard = (prompt) => {
    handleSendQuery(prompt);
  };

  const renderContent = () => {
    if (activeTab !== 'case') {
      // Premium placeholder views for non-chat screens
      const tabTitles = {
        statutes: 'Legal Statutes Database',
        history: 'Case History Logs',
        drafts: 'Drafting Workspace',
        saved: 'Saved Research Briefs',
        settings: 'Atelier Workgroup Settings',
        support: 'Technical Support & Helpdesk',
      };

      return (
        <div className="flex-grow flex flex-col items-center justify-center p-12 text-center animate-[fadeIn_0.4s_ease-out]">
          <span className="material-symbols-outlined text-tertiary-fixed-dim text-6xl mb-4 select-none">
            {activeTab === 'settings' ? 'settings' : activeTab === 'support' ? 'help_outline' : 'folder_open'}
          </span>
          <h2 className="font-headline text-3xl text-primary-container mb-2">
            {tabTitles[activeTab] || 'Workspace Section'}
          </h2>
          <p className="text-on-surface-variant max-w-md text-sm font-body leading-relaxed">
            This module is being structured for high-stakes integration. Dynamic search results, file ingestion pipelines, and audit trails remain active in the <strong>Current Case</strong> tab.
          </p>
          <button
            onClick={() => setActiveTab('case')}
            className="mt-6 bg-[#0D1C32] text-white px-6 py-2.5 rounded-lg font-body text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Return to Case Chat
          </button>
        </div>
      );
    }

    if (chatHistory.length === 0) {
      return <EmptyState onSelectCard={handleSelectCard} />;
    }

    return (
      <div className="flex-grow w-full max-w-4xl mx-auto px-8 pt-24 pb-44 overflow-y-auto">
        <div className="flex flex-col gap-6">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}
            >
              {message.sender === 'user' ? (
                <div className="max-w-[75%] bg-surface-container-high text-primary-container px-6 py-4 rounded-xl border border-outline-variant/10 shadow-sm">
                  <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
              ) : (
                <div className="max-w-[85%] flex gap-4">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl mt-1 select-none flex-shrink-0">
                    gavel
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="font-headline text-base font-semibold text-primary-container">Atelier AI</span>
                    <div className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-line">
                      {message.text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isSearching && (
            <div className="flex justify-start animate-pulse">
              <div className="max-w-[85%] flex gap-4">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl mt-1 select-none flex-shrink-0 animate-spin">
                  progress_activity
                </span>
                <div className="flex flex-col gap-2">
                  <span className="font-headline text-base font-semibold text-primary-container">Atelier AI</span>
                  <p className="font-body text-sm text-on-surface-variant italic">
                    Retrieving matched semantic nodes and precedents...
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-surface text-on-surface">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewQuery={handleNewQuery}
        userEmail={userEmail}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 ml-72 flex flex-col min-h-screen relative overflow-hidden">
        {/* Top AppBar */}
        <TopBar onLogout={handleLogout} userEmail={userEmail} />

        {/* Dynamic Content Frame */}
        {renderContent()}

        {/* Floating Input Area (only on Current Case chat tab) */}
        {activeTab === 'case' && (
          <ChatInput onSend={handleSendQuery} loading={isSearching} />
        )}
      </main>

      {/* Ambient Decorative Blurs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-tertiary-fixed/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed -bottom-20 -left-20 w-[500px] h-[500px] bg-primary-container/5 rounded-full blur-[160px] pointer-events-none -z-10"></div>
    </div>
  );
};

export default WelcomeContent;

import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'loadouts',
      title: 'Loadouts',
      description: 'Create and manage your weapon loadouts',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/loadouts',
      color: 'text-accent-primary'
    },
    {
      id: 'sticker-crafts',
      title: 'Sticker Crafts',
      description: 'Browse and create sticker craft designs',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      path: '/sticker-crafts',
      color: 'text-accent-secondary'
    },
    {
      id: 'resell-tracker',
      title: 'Resell Tracker',
      description: 'Track your skin investments and profits',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/resell-tracker',
      color: 'text-accent-warning'
    },
    {
      id: 'tradeup-opportunities',
      title: 'Trade-Up Opportunities',
      description: 'Find profitable trade-up contracts',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      path: '/tools/tradeup-opportunities',
      color: 'text-accent-success'
    },
    {
      id: 'case-price-checker',
      title: 'Case Price Checker',
      description: 'Track CS:GO case prices and market data',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6l3-3 3 3V1" />
        </svg>
      ),
      path: '/tools/case-price-checker',
      color: 'text-accent-primary'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient mb-4">Tools</h1>
          <p className="text-dark-text-muted text-lg max-w-2xl mx-auto">
            Access all your favorite SkinVault tools in one place. Create loadouts, browse sticker crafts, and track your investments.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className="group glass-card rounded-2xl p-8 hover:shadow-dark-lg transition-all duration-300 border border-dark-border-primary/60 hover:border-accent-primary/50"
              onMouseEnter={() => setActiveTool(tool.id)}
              onMouseLeave={() => setActiveTool(null)}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`${tool.color} transition-colors duration-300 ${
                  activeTool === tool.id ? 'scale-110' : ''
                }`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-dark-text-primary group-hover:text-accent-primary transition-colors duration-300">
                  {tool.title}
                </h3>
                <p className="text-dark-text-muted text-sm leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center text-accent-primary text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                  <span>Open Tool</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Tools Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-dark-text-primary mb-8 text-center">More Tools Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Price Calculator',
                description: 'Calculate skin values and trade values',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                comingSoon: true
              },
              {
                title: 'Float Checker',
                description: 'Check weapon float values and wear patterns',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                comingSoon: true
              },
              {
                title: 'Trade Analyzer',
                description: 'Analyze trade offers and market trends',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                comingSoon: true
              }
            ].map((tool, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-8 border border-dark-border-primary/60 opacity-60"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="text-dark-text-muted">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-dark-text-primary">
                    {tool.title}
                  </h3>
                  <p className="text-dark-text-muted text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-accent-warning text-sm font-medium">
                    <span>Coming Soon</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

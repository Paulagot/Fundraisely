import React from 'react';
import { Link } from 'react-router-dom';
import Headers from '../components/Headers';
import Hfooter from '../components/hFooter';

const FundRaiselyWhereYouSave: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white pb-20">
      <Headers />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 max-w-4xl pt-16 pb-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            💸 Where You Save with FundRaisely
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            FundRaisely isn't just fundraising software — it's your <strong>legal, logistical, and admin co-pilot</strong>. 
            Here's where you save money, time, and stress on every event.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Legal & Compliance Savings */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">✅ 1. Legal & Compliance Savings</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Without FundRaisely:</h3>
                <p className="text-gray-600">You'd spend hours researching complex regulations or even pay for legal help.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">With FundRaisely:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Instant legal status based on your answers</li>
                  <li>• Auto-filled Garda permit and court licence templates</li>
                  <li>• Built-in thresholds, prize caps, and exemptions</li>
                  <li>• Automatic reminders for deadlines and renewals</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800 font-medium">💡 Estimated Savings: €100–€250 per event in legal fees and admin time</p>
            </div>
          </div>

          {/* Admin & Paperwork Savings */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 2. Admin & Paperwork Savings</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Without FundRaisely:</h3>
                <p className="text-gray-600">You manage messy spreadsheets, ticket logs, and reports manually.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">With FundRaisely:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Auto-generated logs for ticket sales, prize value, and beneficiaries</li>
                  <li>• Event templates and digital ticketing included</li>
                  <li>• Post-event audit and income reporting automation</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800 font-medium">💡 Estimated Savings: €50–€150 in volunteer time per event</p>
            </div>
          </div>

          {/* Setup & Tooling Savings */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🎟️ 3. Setup & Tooling Savings</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Without FundRaisely:</h3>
                <p className="text-gray-600">You might need Eventbrite, Google Forms, or even hire a designer.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">With FundRaisely:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Built-in tools for bingo cards, raffle ticketing, and quiz scoring</li>
                  <li>• Hosted event pages and checkouts — no website needed</li>
                  <li>• Cash and card buyer tracking included</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800 font-medium">💡 Estimated Savings: €50–€500 depending on complexity</p>
            </div>
          </div>

          {/* Transparency & Continuity */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📂 4. Transparency & Continuity</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Without FundRaisely:</h3>
                <p className="text-gray-600">No permanent records, risk of compliance failure, and disjointed volunteer handovers.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">With FundRaisely:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Timestamped event logs</li>
                  <li>• Multi-user access with role permissions</li>
                  <li>• Exportable PDF compliance reports</li>
                  <li>• Blockchain-anchored proof of transparency (optional)</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800 font-medium">💡 Value: Legal confidence + audit readiness</p>
            </div>
          </div>

          {/* Peace of Mind & Reputation */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🧠 5. Peace of Mind & Reputation</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Without FundRaisely:</h3>
                <p className="text-gray-600">You're guessing if you're compliant.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">With FundRaisely:</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Live visual compliance dashboard (Red / Yellow / Green)</li>
                  <li>• Templates for all legal steps</li>
                  <li>• Safer events, happier teams, more trust from donors</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <p className="text-indigo-800 font-medium">💡 Value: Event security + long-term credibility</p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-8 py-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">💶 All of this for just 6.5% of what you raise</h2>
              <p className="text-white/90 text-xl mb-8">That's 65 cents per €10 — and you get:</p>
              
              <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="text-white/80">✅ Legal clarity</div>
                <div className="text-white/80">✅ Admin automation</div>
                <div className="text-white/80">✅ Live dashboards</div>
                <div className="text-white/80">✅ Transparent reporting</div>
                <div className="text-white/80">✅ Mixed-payment support</div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="text-white/90">✅ No monthly fee</div>
                <div className="text-white/90">✅ No setup costs</div>
                <div className="text-white/90">✅ No hidden charges</div>
              </div>
              
              <p className="text-white text-xl mb-8">Want to see how much you'd save? <strong>Try your first event free.</strong></p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/signup" 
                  className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-50 transition"
                >
                  Start Free Trial
                </Link>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-800 transition"
                >
                  Back to Top
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Hfooter />
    </div>
  );
};

export default FundRaiselyWhereYouSave;
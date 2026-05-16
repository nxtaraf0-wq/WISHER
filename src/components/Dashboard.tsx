import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSavedWishes } from '../lib/useSavedWishes';
import { format } from 'date-fns';
import { Gift, Plus, ExternalLink, Copy, Trash2, Mail, Globe, User, Search, Link as LinkIcon, PartyPopper } from 'lucide-react';
import { encodeWish } from '../lib/utils';
import { THEMES } from '../lib/themes';
import { cn } from '../lib/utils';
import { GLOBAL_BIRTHDAYS } from '../lib/globalBirthdays';
import { ECARD_TEMPLATES } from '../lib/ecardTemplates';

export default function Dashboard() {
  const { wishes, deleteWish } = useSavedWishes();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'personal' | 'global' | 'viewer'>('personal');
  const [wishLink, setWishLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getWishUrl = (wish: any) => {
    const payload: any = { t: wish.t, f: wish.f, m: wish.m, d: wish.d, th: wish.th };
    if (wish.hf) payload.hf = wish.hf;
    if (wish.bf) payload.bf = wish.bf;
    if (wish.mo) payload.mo = wish.mo;
    if (wish.bg) payload.bg = wish.bg;
    if (wish.p1) payload.p1 = wish.p1;
    if (wish.p2) payload.p2 = wish.p2;
    if (wish.p3) payload.p3 = wish.p3;
    const encoded = encodeWish(payload);
    return `${window.location.origin}/w/${encoded}`;
  };

  const copyLink = (wish: any) => {
    navigator.clipboard.writeText(getWishUrl(wish));
    alert('Link copied to clipboard!');
  };

  const emailLink = (wish: any) => {
    const url = getWishUrl(wish);
    const subject = encodeURIComponent(`A special birthday wish for ${wish.t}! 🎂`);
    const body = encodeURIComponent(`Hi ${wish.t},\n\nI've created a special birthday wish just for you! Click the link below to open your e-card:\n${url}\n\nBest,\n${wish.f}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleOpenLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishLink) return;
    try {
      const url = new URL(wishLink);
      if (url.pathname.startsWith('/w/')) {
        navigate(url.pathname);
      } else {
        alert("Please paste a valid WISHER link.");
      }
    } catch {
      alert("Invalid URL. Please paste a complete link like https://...");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-rose-200">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <Gift className="w-5 h-5" />
            </div>
            <h1 className="text-4xl font-serif font-bold tracking-tight text-stone-900">WISHER</h1>
          </div>
          <Link 
            to="/create" 
            className="flex items-center gap-2 bg-stone-800 text-stone-50 px-6 py-3 rounded-full font-medium hover:bg-stone-900 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Craft a New Wish</span>
          </Link>
        </header>

        {/* E-Card Templates */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-xl font-serif text-stone-800 mb-4 pl-1">Start from a Template</h2>
          <div className="flex overflow-x-auto pb-4 -mx-1 px-1 gap-4 snap-x">
            {ECARD_TEMPLATES.map(template => (
              <Link
                key={template.id}
                to={`/create?template=${template.id}`}
                className="snap-start flex-none w-32 sm:w-40 flex flex-col gap-3 group relative text-left"
              >
                 <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-stone-200 group-hover:border-rose-300 group-hover:shadow-md transition-all">
                   <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <span className="text-sm font-medium text-stone-700 pl-1">{template.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 p-1.5 mb-12 bg-white/60 backdrop-blur-md rounded-2xl w-fit shadow-sm border border-stone-200/50">
          <button
            onClick={() => setActiveTab('personal')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all text-sm whitespace-nowrap",
              activeTab === 'personal' ? "bg-white text-stone-900 shadow-sm border border-stone-200/50" : "text-stone-500 hover:text-stone-800 hover:bg-stone-100/50"
            )}
          >
            <User className="w-4 h-4" /> My Cards
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all text-sm whitespace-nowrap",
              activeTab === 'global' ? "bg-white text-stone-900 shadow-sm border border-stone-200/50" : "text-stone-500 hover:text-stone-800 hover:bg-stone-100/50"
            )}
          >
            <Globe className="w-4 h-4" /> Discover Birthdays
          </button>
          <button
            onClick={() => setActiveTab('viewer')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all text-sm whitespace-nowrap",
              activeTab === 'viewer' ? "bg-white text-stone-900 shadow-sm border border-stone-200/50" : "text-stone-500 hover:text-stone-800 hover:bg-stone-100/50"
            )}
          >
            <Search className="w-4 h-4" /> Open a Link
          </button>
        </div>

        {/* Tab Content: Personal Wishes */}
        {activeTab === 'personal' && (
          wishes.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-16 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-serif text-stone-800 mb-3">No cards created yet</h2>
              <p className="text-stone-500 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                Design beautiful, personalized birthday wishes and schedule them to be opened on that perfect day.
              </p>
              <Link 
                to="/create" 
                className="inline-flex items-center gap-2 bg-rose-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-rose-700 transition-all shadow-[0_4px_14px_0_rgba(225,29,72,0.2)] hover:shadow-[0_6px_20px_0_rgba(225,29,72,0.3)] hover:-translate-y-0.5"
              >
                Start Crafting
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishes.map(wish => (
                <div key={wish.id} className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className={`absolute top-0 left-0 w-full h-1.5 ${THEMES[wish.th]?.background || 'bg-stone-200'}`} />
                  
                  <div className="mb-6 mt-1 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1 block">To</span>
                      <h3 className={cn("font-serif text-2xl text-stone-800 line-clamp-1", wish.hf || THEMES[wish.th]?.headerFont)}>{wish.t}</h3>
                    </div>
                    <div className="bg-stone-50 rounded-lg px-3 py-1.5 text-center shrink-0 border border-stone-100">
                      <span className="text-xs font-medium uppercase tracking-widest text-stone-400 block mb-0.5">Date</span>
                      <span className="text-sm font-semibold text-stone-700">{format(new Date(wish.d), 'MMM d')}</span>
                    </div>
                  </div>
                  
                  <p className={cn("text-stone-600 font-serif italic text-lg leading-relaxed line-clamp-3 mb-8 flex-grow", wish.bf || THEMES[wish.th]?.bodyFont)}>
                    "{wish.m}"
                  </p>
                  
                  <div className="flex items-center gap-2 pt-6 border-t border-stone-100 mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={getWishUrl(wish)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-stone-50 text-stone-700 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-100 hover:text-stone-900 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Preview
                    </a>
                    <button 
                      onClick={() => copyLink(wish)}
                      className="flex items-center justify-center bg-stone-50 text-stone-600 p-2.5 rounded-xl hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      title="Copy Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => emailLink(wish)}
                      className="flex items-center justify-center bg-stone-50 text-stone-600 p-2.5 rounded-xl hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      title="Send via Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteWish(wish.id)}
                      className="flex items-center justify-center bg-stone-50 text-rose-500 p-2.5 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Delete Wish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Tab Content: Global Birthdays */}
        {activeTab === 'global' && (() => {
          const filteredBirthdays = GLOBAL_BIRTHDAYS.filter(person => 
            person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            person.desc.toLowerCase().includes(searchQuery.toLowerCase())
          );

          const getUpcomingBirthday = (dateStr: string) => {
            const date = new Date(dateStr);
            const today = new Date();
            
            date.setFullYear(today.getFullYear());
            if (date < today && date.toDateString() !== today.toDateString()) {
              date.setFullYear(today.getFullYear() + 1);
            }
            return format(date, 'yyyy-MM-dd');
          };

          return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-serif text-stone-800 mb-2">Discover Popular Birthdays</h2>
                  <p className="text-stone-500 text-lg">Send a beautifully crafted wish to your favorite personalities.</p>
                </div>
                <div className="relative w-full md:w-80 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search by name or profession..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-full focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBirthdays.map((person, i) => (
                  <div key={i} className="bg-white rounded-[2rem] p-6 flex flex-col items-center text-center shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all group">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-5 text-stone-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                      <PartyPopper className="w-7 h-7" />
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                      {format(new Date(person.date), 'MMMM do')}
                    </div>
                    <h3 className="font-serif text-xl text-stone-800 mb-1 line-clamp-1 w-full" title={person.name}>{person.name}</h3>
                    <p className="text-sm text-stone-500 mb-6 italic">{person.desc}</p>
                    
                    <Link 
                      to={`/create?to=${encodeURIComponent(person.name)}&date=${getUpcomingBirthday(person.date)}`}
                      className="w-full mt-auto flex items-center justify-center gap-2 bg-stone-50 text-stone-700 py-3 rounded-xl text-sm font-medium hover:bg-stone-800 hover:text-white transition-all duration-300"
                    >
                      <Gift className="w-4 h-4" /> Create Card
                    </Link>
                  </div>
                ))}
              </div>
              {filteredBirthdays.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="text-xl font-serif text-stone-600 mb-2">No matching birthdays found.</p>
                  <p className="text-stone-400">Try a different search term.</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab Content: Viewer */}
        {activeTab === 'viewer' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-10 md:p-16 max-w-2xl mx-auto text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none" />
              
              <div className="w-20 h-20 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10">
                <LinkIcon className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif text-stone-800 mb-4 relative z-10">Open a Wish Link</h2>
              <p className="text-stone-500 mb-10 text-lg leading-relaxed max-w-md mx-auto relative z-10">
                Did someone send you a WISHER link? Paste it below to unwrap your personalized card.
              </p>
              
              <form onSubmit={handleOpenLink} className="flex flex-col sm:flex-row gap-3 relative z-10">
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={wishLink}
                  onChange={(e) => setWishLink(e.target.value)}
                  className="flex-grow px-5 py-4 text-left rounded-2xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all shadow-sm bg-white"
                />
                <button
                  type="submit"
                  className="bg-stone-800 text-white px-8 py-4 rounded-2xl font-medium hover:bg-stone-900 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" /> Open Card
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSavedWishes } from '../lib/useSavedWishes';
import { THEMES } from '../lib/themes';
import { ThemeId } from '../types';
import { ArrowLeft, Check, Sparkles, Wand2, Loader2, Clock, Mail, MessageSquareText, Image as ImageIcon } from 'lucide-react';
import { cn, encodeWish } from '../lib/utils';
import { format } from 'date-fns';
import { GoogleGenAI } from "@google/genai";
import { WishPayload } from '../types';
import { MESSAGE_TEMPLATES } from '../lib/templates';
import { GIF_BACKGROUNDS } from '../lib/backgrounds';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 120;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.2));
      };
      img.onerror = error => reject(error);
      img.src = event.target?.result as string;
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const HEADER_FONTS = [
  { id: '', name: 'Theme Default' },
  { id: 'font-serif', name: 'Playfair Display' },
  { id: 'font-caveat', name: 'Caveat' },
  { id: 'font-pacifico', name: 'Pacifico' },
  { id: 'font-vibes', name: 'Great Vibes' },
  { id: 'font-space', name: 'Space Grotesk' },
  { id: 'font-outfit', name: 'Outfit' },
];

const BODY_FONTS = [
  { id: '', name: 'Theme Default' },
  { id: 'font-sans', name: 'Inter' },
  { id: 'font-space', name: 'Space Grotesk' },
  { id: 'font-outfit', name: 'Outfit' },
  { id: 'font-caveat', name: 'Caveat' },
  { id: 'font-dancing', name: 'Dancing Script' },
];

export default function CreateWish() {
  const navigate = useNavigate();
  const { saveWish } = useSavedWishes();

  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<WishPayload>({
    t: searchParams.get('to') || '',
    f: '',
    m: '',
    d: searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'),
    th: 'party' as ThemeId,
    hf: '',
    bf: '',
    bg: '',
    mo: 'letter',
    p1: '',
    p2: '',
    p3: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.t || !form.f || !form.m || !form.d) return;

    // Save to local storage for dashboard
    saveWish(form);

    // Generate link
    const encoded = encodeWish(form);
    navigate(`/w/${encoded}`, { state: { newlyCreated: true } });
  };

  const handleSuggestMessage = async () => {
    if (!form.t) {
      alert("Please enter the recipient's name first.");
      return;
    }
    
    setIsGenerating(true);
    setForm(prev => ({ ...prev, m: '' }));
    
    try {
      const themeName = THEMES[form.th]?.name || 'celebration';
      const prompt = `Write a short, heartfelt, and personalized birthday wish for someone named ${form.t}.
      The theme of the card is "${themeName}". Keep it under 3 sentences. It should feel like a nice message written on a birthday card. Don't include "Dear ${form.t}" at the beginning, or sign off at the end. Just the message body.`;

      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      let fullMessage = '';
      for await (const chunk of response) {
        if (chunk.text) {
          fullMessage += chunk.text;
          setForm(prev => ({ ...prev, m: fullMessage }));
        }
      }
    } catch (error) {
      console.error("Failed to generate message:", error);
      alert("Sorry, couldn't generate a message right now. Please try again or write your own.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex text-stone-900 selection:bg-rose-200">
      {/* Left side Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] p-6 md:p-12 lg:p-16 overflow-y-auto">
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 mb-10 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cards
        </button>

        <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight text-stone-900 mb-4">Craft a Wish</h1>
        <p className="text-stone-500 mb-12 text-lg">Design a beautiful birthday card. It will be scheduled for their special day.</p>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-md">
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Wish Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, mo: 'time' })}
                className={cn(
                  "relative overflow-hidden rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all",
                  form.mo !== 'letter' ? "border-rose-400 bg-rose-50/30 shadow-md" : "border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm"
                )}
              >
                <Clock className={cn("w-8 h-8 transition-transform", form.mo !== 'letter' ? "text-rose-500 scale-110" : "text-stone-400")} />
                <span className={cn("font-medium", form.mo !== 'letter' ? "text-rose-700" : "text-stone-600")}>Time Wish</span>
              </button>
              
              <button
                type="button"
                onClick={() => setForm({ ...form, mo: 'letter' })}
                className={cn(
                  "relative overflow-hidden rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all",
                  form.mo === 'letter' ? "border-rose-400 bg-rose-50/30 shadow-md" : "border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm"
                )}
              >
                <Mail className={cn("w-8 h-8 transition-transform", form.mo === 'letter' ? "text-rose-500 scale-110" : "text-stone-400")} />
                <span className={cn("font-medium", form.mo === 'letter' ? "text-rose-700" : "text-stone-600")}>Wish Letter</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Recipient's Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Alex"
                value={form.t}
                onChange={e => setForm({ ...form, t: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all shadow-sm bg-white"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Your Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Sam"
                value={form.f}
                onChange={e => setForm({ ...form, f: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all shadow-sm bg-white"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Target Date</label>
            <input 
              type="date" 
              required
              value={form.d}
              onChange={e => setForm({ ...form, d: e.target.value })}
              className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all shadow-sm bg-white"
            />
            <p className="text-xs text-stone-400 italic">If opened before this date, it will show a countdown.</p>
          </div>

          <div className="space-y-2.5 relative">
            <div className="flex items-center justify-between pointer-events-none">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block pointer-events-auto">Custom Message</label>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-xs flex items-center gap-1.5 text-stone-600 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full font-medium transition-colors"
                >
                  <MessageSquareText className="w-3 h-3" /> Templates
                </button>
                <button
                  type="button"
                  onClick={handleSuggestMessage}
                  disabled={isGenerating || !form.t}
                  className="text-xs flex items-center gap-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" /> AI Suggestion
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {showTemplates && (
              <div className="absolute top-10 right-0 left-0 bg-white border border-stone-200 shadow-xl rounded-xl p-2 z-20 max-h-60 overflow-y-auto">
                <div className="text-xs font-semibold text-stone-400 mb-2 px-2 pt-1 uppercase tracking-wider">Select a Template</div>
                <div className="flex flex-col gap-1">
                  {MESSAGE_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, m: template.text });
                        setShowTemplates(false);
                      }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors group"
                    >
                      <div className="font-medium text-stone-800 text-sm mb-1">{template.label}</div>
                      <div className="text-stone-500 text-xs line-clamp-2">{template.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <textarea 
              required
              rows={5}
              placeholder="Write something heartfelt..."
              value={form.m}
              onChange={e => setForm({ ...form, m: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all shadow-sm resize-none bg-white leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Select Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.values(THEMES).map(theme => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setForm({ ...form, th: theme.id })}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-3 transition-all h-28 group",
                    form.th === theme.id ? "border-rose-400 bg-rose-50/30 shadow-md" : "border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm"
                  )}
                >
                  <div className={cn("w-full h-10 rounded-xl shadow-inner transition-transform group-hover:scale-105", theme.background)} />
                  <span className={cn(
                      "text-xs font-medium",
                      form.th === theme.id ? "text-rose-700" : "text-stone-600"
                  )}>{theme.name}</span>
                  {form.th === theme.id && (
                    <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-sm text-rose-500">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Background Effect</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, bg: '' })}
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 py-2 px-3 flex flex-col items-center justify-center gap-2 transition-all",
                  !form.bg ? "border-rose-400 bg-rose-50 mt-0" : "border-stone-100 bg-white hover:border-stone-200"
                )}
              >
                <span className={cn("text-xs font-medium", !form.bg ? "text-rose-700" : "text-stone-600")}>None</span>
              </button>
              {Object.entries(GIF_BACKGROUNDS).map(([id, bg]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm({ ...form, bg: id })}
                  className={cn(
                    "relative overflow-hidden rounded-xl border-2 py-2 px-3 flex flex-col items-center justify-center gap-2 transition-all",
                    form.bg === id ? "border-rose-400 bg-rose-50 mt-0" : "border-stone-100 bg-white hover:border-stone-200"
                  )}
                >
                  <span className={cn("text-xs font-medium", form.bg === id ? "text-rose-700" : "text-stone-600")}>{bg.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-stone-500" />
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Photo Collage (Optional)</label>
            </div>
            <p className="text-xs text-stone-400 -mt-2">Upload up to 3 photos to add a frame to your card.</p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((index) => {
                const field = `p${index}` as keyof typeof form;
                return (
                  <label key={index} className="relative aspect-square rounded-[1.25rem] border-2 border-dashed border-stone-200 hover:border-rose-300 transition-colors bg-white overflow-hidden flex flex-col items-center justify-center cursor-pointer group shadow-sm">
                    {form[field] ? (
                       <>
                         <img src={form[field] as string} className="w-full h-full object-cover" />
                         <button 
                           type="button" 
                           onClick={(e) => { e.preventDefault(); setForm({...form, [field]: ''}) }} 
                           className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                         >
                           <span className="sr-only">Remove photo</span>
                           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                         </button>
                       </>
                    ) : (
                       <div className="flex flex-col items-center text-stone-400 group-hover:text-rose-500 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                         <span className="text-[10px] font-medium text-center px-2 uppercase tracking-wide">Upload</span>
                       </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           e.target.value = ''; // Reset input
                           try {
                             const compressed = await compressImage(file);
                             setForm({ ...form, [field]: compressed });
                           } catch (err) {
                             console.error(err);
                             alert('Failed to process image.');
                           }
                         }
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Header Font</label>
              <select
                value={form.hf}
                onChange={e => setForm({ ...form, hf: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all shadow-sm bg-white appearance-none"
              >
                {HEADER_FONTS.map(font => (
                  <option key={font.id} value={font.id} className={font.id}>{font.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-500 block">Body Font</label>
              <select
                value={form.bf}
                onChange={e => setForm({ ...form, bf: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 outline-none transition-all shadow-sm bg-white appearance-none"
              >
                {BODY_FONTS.map(font => (
                  <option key={font.id} value={font.id} className={font.id}>{font.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-4 rounded-full font-medium hover:bg-stone-800 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.15)] hover:-translate-y-0.5 mt-8"
          >
            <Sparkles className="w-5 h-5" />
            Generate Card Link
          </button>
        </form>
      </div>

      {/* Right side Live Preview */}
      <div className="hidden lg:flex w-full lg:w-[55%] xl:w-[60%] p-8 items-center justify-center bg-stone-100/50 border-l border-stone-200/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-200/50 via-stone-100/20 to-transparent"></div>
        
        <div className="max-w-md w-full relative z-10 transition-all duration-500 ease-out hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-[2.5rem]">
          <div 
            className={cn(
              "w-full aspect-[3/4] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:z-0",
              THEMES[form.th]?.background
            )}
            style={{
              backgroundImage: form.bg && GIF_BACKGROUNDS[form.bg] ? `url(${GIF_BACKGROUNDS[form.bg].url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className={cn(
              "m-6 flex-grow rounded-[1.5rem] p-10 flex flex-col items-center justify-center text-center shadow-inner relative z-10 backdrop-blur-sm",
              THEMES[form.th]?.cardBg,
              THEMES[form.th]?.textColor
            )}>
              <div className={cn("text-4xl mb-10 break-words leading-tight", form.hf || THEMES[form.th]?.headerFont || 'font-serif')}>
                For {form.t || 'Someone Special'}
              </div>
              <div className={cn("mb-10 flex-grow flex items-center justify-center text-xl", form.bf || THEMES[form.th]?.bodyFont || 'font-sans italic')}>
                <div className="flex flex-col items-center">
                  <div className="opacity-90 max-w-[280px] mb-6">
                    "{form.m || 'Wishing you a day filled with joy and a year filled with happiness.'}"
                  </div>
                  {(form.p1 || form.p2 || form.p3) && (
                    <div className="w-full flex gap-2 justify-center items-center mt-2 px-6">
                      {form.p1 && <div className="flex-1 max-w-[100px] aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white/40"><img src={form.p1} alt="" className="w-full h-full object-cover" /></div>}
                      {form.p2 && <div className="flex-1 max-w-[100px] aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white/40"><img src={form.p2} alt="" className="w-full h-full object-cover" /></div>}
                      {form.p3 && <div className="flex-1 max-w-[100px] aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white/40"><img src={form.p3} alt="" className="w-full h-full object-cover" /></div>}
                    </div>
                  )}
                </div>
              </div>
              <div className={cn("italic text-lg opacity-80 mt-auto", form.hf || THEMES[form.th]?.headerFont || 'font-serif')}>
                With love,<br/>{form.f || 'Me'}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

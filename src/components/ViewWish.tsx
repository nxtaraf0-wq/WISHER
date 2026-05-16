import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { decodeWish } from '../lib/utils';
import { WishPayload } from '../types';
import { THEMES } from '../lib/themes';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, PartyPopper, Mail, Gift } from 'lucide-react';
import { cn } from '../lib/utils';
import { GIF_BACKGROUNDS } from '../lib/backgrounds';

export default function ViewWish() {
  const { encoded } = useParams<{ encoded: string }>();
  const [wish, setWish] = useState<WishPayload | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  useEffect(() => {
    if (encoded) {
      const decoded = decodeWish(encoded);
      if (decoded) setWish(decoded);
    }
  }, [encoded]);

  const handleOpen = () => {
    setIsOpen(true);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied! Send it to ' + (wish?.t || 'them') + '!');
  };

  const emailUrl = () => {
    const subject = encodeURIComponent(`A special birthday wish for ${wish?.t}! 🎂`);
    const body = encodeURIComponent(`Hi ${wish?.t},\n\nI've created a special birthday wish just for you! Click the link below to open your e-card:\n${window.location.href}\n\nBest,\n${wish?.f}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (!wish) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-serif text-slate-800 mb-4">Oops! We couldn't find this wish.</h1>
        <p className="text-slate-500 mb-8">The link might be broken or incomplete.</p>
        <Link to="/" className="bg-pink-500 text-white px-6 py-3 rounded-full font-medium">Create a New Wish</Link>
      </div>
    );
  }

  const theme = THEMES[wish.th] || THEMES.party;

  return (
    <div className={cn("min-h-screen font-sans flex flex-col items-center justify-center p-6 sm:p-12 transition-all duration-1000", theme.background)}>
      
      {/* Top action bar when viewed by sender */}
      <div className="fixed top-4 right-4 z-50 flex flex-row sm:flex-col gap-2 items-end">
        <button 
          onClick={copyUrl}
          className="bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 hover:bg-white"
        >
          <Copy className="w-4 h-4" /> <span className="hidden sm:inline">Copy Link</span>
        </button>
        <button 
          onClick={emailUrl}
          className="bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 hover:bg-white"
        >
          <Mail className="w-4 h-4" /> <span className="hidden sm:inline">Email Card</span>
        </button>
        <Link 
          to="/"
          className="bg-white/60 backdrop-blur text-slate-800 px-4 py-2 rounded-full shadow border-transparent text-sm font-medium hover:bg-white/90"
        >
          <span>Make Another</span>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {!envelopeOpened ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.4 } }}
            className="cursor-pointer max-w-[280px] sm:max-w-sm w-full aspect-[4/3] relative group"
            onClick={() => setEnvelopeOpened(true)}
          >
            <div className="absolute inset-0 bg-stone-100 rounded-xl shadow-2xl overflow-hidden pointer-events-none transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.02]">
              {/* Inside of envelope */}
              <div className="absolute inset-0 bg-stone-300" />
              {/* Small paper peek */}
              <div className="absolute inset-x-4 top-10 bottom-4 bg-white/80 rounded" />
              
              {/* Left flap */}
              <div className="absolute inset-y-0 left-0 w-[55%] bg-stone-100 [clip-path:polygon(0_0,0_100%,100%_50%)] z-10" />
              {/* Right flap */}
              <div className="absolute inset-y-0 right-0 w-[55%] bg-stone-200 [clip-path:polygon(100%_0,100%_100%,0_50%)] z-10" />
              {/* Bottom flap */}
              <div className="absolute inset-x-0 bottom-0 h-[60%] bg-stone-50 [clip-path:polygon(0_100%,100%_100%,50%_40%)] z-20 drop-shadow-md" />
              
              {/* Top flap */}
              <div className="absolute inset-x-0 top-0 h-[60%] bg-stone-200 [clip-path:polygon(0_0,100%_0,50%_100%)] z-30 origin-top flex flex-col justify-end drop-shadow-lg" />
              
              {/* Wax seal */}
              <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center shadow-xl z-40 transition-transform duration-500 group-hover:scale-110 border-2 border-rose-700/50">
                <Gift className="w-8 h-8 text-rose-50" />
              </div>
            </div>
            <p className="absolute -bottom-16 left-0 right-0 text-center text-white/90 font-serif text-xl sm:text-2xl tracking-wide opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md">
              Tap to open
            </p>
          </motion.div>
        ) : !isOpen ? (
          /* UNLOCKED / TAP TO OPEN STATE */
          <motion.div
            key="envelope2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
            className="cursor-pointer group flex flex-col items-center w-full max-w-sm mx-auto"
            onClick={handleOpen}
            style={{ perspective: '1000px' }}
          >
            {/* ENVELOPE DESIGN */}
            <div className="relative w-full aspect-[4/3] transform-style-preserve-3d transition-transform duration-500 group-hover:rotate-x-12 cursor-pointer shadow-xl rounded-b-xl group-hover:shadow-2xl">
                {/* Envelope Back */}
                <div className="absolute inset-0 bg-[#f8f5f0] rounded-b-xl rounded-t-sm shadow-inner" />
                
                {/* Letter Inside peeking out */}
                <div className="absolute left-4 right-4 top-2 bottom-8 bg-white shadow-sm rounded-t-md mx-auto z-0 flex items-center justify-center p-4">
                  <div className="text-center text-slate-300 opacity-50 relative bottom-4">
                     <Gift className="w-8 h-8 mx-auto mb-2" />
                     <div className="text-[10px] uppercase font-bold tracking-widest">Confidential</div>
                  </div>
                </div>
                
                {/* Envelope Flap (Top) - Animated on hover */}
                <div className="absolute top-0 left-0 w-full h-[60%] bg-[#faf8f5] origin-top transform transition-transform duration-500 z-30 shadow-sm border-b border-black/5" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                
                {/* Envelope Front (Left side) */}
                <div className="absolute inset-0 bg-[#f4ebd0] z-10 border-r border-black/5" style={{ clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }} />
                
                {/* Envelope Front (Right side) */}
                <div className="absolute inset-0 bg-[#f4ebd0] z-10 border-l border-black/5" style={{ clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)' }} />
                
                {/* Envelope Front (Bottom side) */}
                <div className="absolute inset-0 bg-[#fdfbf7] z-20 rounded-b-xl border-t border-black/5" style={{ clipPath: 'polygon(0 100%, 50% 50%, 100% 100%)' }} />
                
                {/* Wax Seal / Sticker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-14 h-14 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-900/30 z-40 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-500 group-hover:shadow-rose-500/50 border border-rose-400">
                    <span className="font-serif italic font-medium text-sm">Open</span>
                </div>
            </div>
            
            <div className={cn("text-center mt-8 z-10 drop-shadow-md", theme.textColor)}>
                <div className="font-serif italic text-3xl font-semibold mb-2">For {wish.t}</div>
                <div className="text-xs uppercase tracking-widest opacity-80 font-bold flex items-center justify-center gap-2">
                  <span>Tap to open your envelope</span>
                </div>
            </div>
          </motion.div>
        ) : (
          /* OPENED WISH */
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.8, rotateX: 60 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 1 }}
            className="w-full max-w-lg perspective-1000"
          >
            <div 
              className={cn(
                 "w-full rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col min-h-[500px] relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:z-0",
                 theme.background
              )}
              style={{
                backgroundImage: wish.bg && GIF_BACKGROUNDS[wish.bg] ? `url(${GIF_BACKGROUNDS[wish.bg].url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className={cn(
                "m-6 sm:m-8 flex-grow rounded-[1.5rem] p-10 sm:p-14 flex flex-col relative text-center shadow-inner z-10 backdrop-blur-sm",
                theme.cardBg,
                theme.textColor
              )}>
                <PartyPopper className={cn("absolute top-8 left-8 w-6 h-6 opacity-30", theme.textColor)} />
                <PartyPopper className={cn("absolute bottom-8 right-8 w-6 h-6 opacity-30 rotate-180", theme.textColor)} />
                
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className={cn("text-4xl sm:text-5xl mb-12 drop-shadow-sm mt-4", wish.hf || theme.headerFont || 'font-serif')}
                >
                  For {wish.t}
                </motion.h2>
                
                <div className="flex-grow flex items-center justify-center mb-12">
                  <div className="flex flex-col items-center">
                    <motion.p 
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 1 },
                        visible: { transition: { staggerChildren: 0.08, delayChildren: 0.8 } }
                      }}
                      className={cn("opacity-90 leading-relaxed whitespace-pre-wrap text-xl sm:text-2xl mb-8", wish.bf || theme.bodyFont || 'font-sans italic')}
                    >
                      {`"${wish.m}"`.split(/(\s+)/).map((part, index) => (
                        <motion.span
                          key={index}
                          variants={{
                            hidden: { opacity: 0, filter: 'blur(4px)', y: 5 },
                            visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.6 } }
                          }}
                          className="inline-block"
                        >
                          {part === '\n' ? <br /> : part === ' ' ? '\u00A0' : part}
                        </motion.span>
                      ))}
                    </motion.p>
                    
                    {(wish.p1 || wish.p2 || wish.p3) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2, duration: 0.8 }}
                        className="w-full flex gap-3 justify-center items-center mt-4"
                      >
                        {wish.p1 && <div className="flex-1 max-w-[140px] aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white/40"><img src={wish.p1} alt="" className="w-full h-full object-cover" /></div>}
                        {wish.p2 && <div className="flex-1 max-w-[140px] aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white/40"><img src={wish.p2} alt="" className="w-full h-full object-cover" /></div>}
                        {wish.p3 && <div className="flex-1 max-w-[140px] aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white/40"><img src={wish.p3} alt="" className="w-full h-full object-cover" /></div>}
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className={cn("text-lg font-medium border-t border-current/20 pt-8 mt-auto mx-12", wish.hf || theme.headerFont || 'font-serif')}
                >
                  With love,
                  <br/>
                  <span className="text-2xl mt-2 block font-bold">{wish.f}</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

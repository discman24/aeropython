import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { PORTRAITS, ELEMENTS } from '../../data/rpgQuests';

// Some dialogues may optionally have choices (cosmetic only)
const PLAYER_REACTIONS = [
  "Understood! I'll do my best.",
  "I won't let you down!",
  "Sounds like a challenge — I'm ready!",
  "Leave it to me!",
];

export default function DialogueBox({ dialogues, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showChoices, setShowChoices] = useState(false);
  const [chosenReaction, setChosenReaction] = useState(null);

  const current = dialogues[currentIndex];
  const isLast = currentIndex === dialogues.length - 1;

  // Typewriter effect
  useEffect(() => {
    if (!current) return;
    setDisplayedText('');
    setIsTyping(true);
    setShowChoices(false);
    setChosenReaction(null);
    let i = 0;
    const speed = 22; // ms per character
    const timer = setInterval(() => {
      i++;
      setDisplayedText(current.text.slice(0, i));
      if (i >= current.text.length) {
        clearInterval(timer);
        setIsTyping(false);
        // Show choices on last dialogue for extra engagement
        if (currentIndex === dialogues.length - 1 && dialogues.length > 1) {
          setTimeout(() => setShowChoices(true), 300);
        }
      }
    }, speed);
    return () => clearInterval(timer);
  }, [currentIndex, current, dialogues.length]);

  const handleAdvance = () => {
    if (isTyping) {
      setDisplayedText(current.text);
      setIsTyping(false);
      return;
    }
    if (showChoices && !chosenReaction) {
      // User must pick before advancing (optional UX friction — auto-advance if they click)
      setChosenReaction(PLAYER_REACTIONS[0]);
      return;
    }
    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!current) return null;

  const portraitData = PORTRAITS[current.portrait] || PORTRAITS.default;
  const elementKey = portraitData.element;
  const el = ELEMENTS[elementKey] || ELEMENTS.variables;

  return (
    <div className="space-y-2">
      {/* Dialogue box */}
      <div
        onClick={handleAdvance}
        className="relative rounded-2xl p-5 cursor-pointer select-none transition-all duration-200 hover:brightness-110 group"
        style={{
          backgroundColor: '#0f172a',
          border: `1px solid ${el.border}`,
          boxShadow: `0 0 0 1px ${el.color}11, 0 4px 24px ${el.color}0a`,
        }}
      >
        {/* Speaker nameplate */}
        <div
          className="absolute -top-3.5 left-5 flex items-center gap-2 px-3 py-1 rounded-full border"
          style={{ backgroundColor: '#0f172a', borderColor: el.border }}
        >
          {/* Portrait with elemental background */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm border"
            style={{ backgroundColor: el.bg, borderColor: el.border }}
          >
            {portraitData.emoji}
          </div>
          <span
            className="text-sm font-black uppercase tracking-widest"
            style={{ color: el.color }}
          >
            {current.speaker}
          </span>
          {/* Element indicator */}
          <span className="text-sm" title={el.name}>{el.icon}</span>
        </div>

        {/* Dialogue progress dots */}
        <div className="absolute -top-3.5 right-5 flex items-center gap-1.5">
          {dialogues.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === currentIndex ? el.color : i < currentIndex ? el.color + '55' : '#1e293b',
                transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Text with cursor */}
        <p className="text-sm md:text-base text-slate-200 leading-relaxed mt-3 min-h-[3.5rem]">
          {displayedText}
          {isTyping && (
            <span
              className="inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle"
              style={{ backgroundColor: el.color }}
            />
          )}
        </p>

        {/* Advance hint */}
        {!isTyping && !showChoices && (
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              {isLast ? 'Press to continue' : `${currentIndex + 1} / ${dialogues.length}`}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-600">
                {isLast ? 'Continue' : 'Next'}
              </span>
              <ChevronRight
                className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                style={{ color: el.color }}
              />
            </div>
          </div>
        )}

        {isTyping && (
          <div className="flex justify-end mt-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Click to skip</span>
          </div>
        )}
      </div>

      {/* Player choice row (cosmetic — shown on final dialogue) */}
      {showChoices && !chosenReaction && (
        <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
          {PLAYER_REACTIONS.map((reaction, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setChosenReaction(reaction);
                setShowChoices(false);
                setTimeout(() => onComplete(), 500);
              }}
              className="text-left px-3 py-2 rounded-xl border text-sm font-bold text-slate-400 transition-all hover:text-white hover:scale-[1.02] active:scale-95"
              style={{
                backgroundColor: el.bg,
                borderColor: el.border,
              }}
              onMouseEnter={e => e.currentTarget.style.color = el.color}
              onMouseLeave={e => e.currentTarget.style.color = ''}
            >
              <ChevronRight className="w-3 h-3 inline mr-1 opacity-60" />
              {reaction}
            </button>
          ))}
        </div>
      )}

      {/* Chosen reaction echo */}
      {chosenReaction && (
        <div className="text-right animate-in fade-in duration-200">
          <span
            className="text-sm font-bold px-3 py-1.5 rounded-xl inline-block"
            style={{ color: el.color, backgroundColor: el.bg }}
          >
            You: "{chosenReaction}"
          </span>
        </div>
      )}
    </div>
  );
}

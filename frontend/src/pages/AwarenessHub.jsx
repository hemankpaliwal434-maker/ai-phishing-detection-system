import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, ShieldCheck, CheckCircle2, XCircle, Sparkles, HelpCircle, Trophy } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function AwarenessHub() {
  const [quizzes, setQuizzes] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userScore, setUserScore] = useState(null);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [spotVerdict, setSpotVerdict] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [qRes, cRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/awareness/quiz`),
          fetch(`${API_BASE}/awareness/challenges`),
          fetch(`${API_BASE}/awareness/user-score`)
        ]);

        if (qRes.ok) setQuizzes(await qRes.json());
        if (cRes.ok) setChallenges(await cRes.json());
        if (sRes.ok) setUserScore(await sRes.json());
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  const handleSelectOption = (index) => {
    if (quizSubmitted) return;
    setSelectedAnswer(index);
  };

  const handleSubmitQuizAnswer = async () => {
    if (selectedAnswer === null) return;
    setQuizSubmitted(true);

    try {
      await fetch(`${API_BASE}/awareness/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: "user_default", score_increment: 10 })
      });
    } catch (e) {}
  };

  const handleNextQuiz = () => {
    if (currentQuizIdx < quizzes.length - 1) {
      setCurrentQuizIdx(currentQuizIdx + 1);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
    }
  };

  const currentQuiz = quizzes[currentQuizIdx];

  return (
    <div className="space-y-8 pb-16 pt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Cybersecurity Training & Gamification
          </div>
          <h1 className="text-3xl font-extrabold text-white">Security Awareness & Defense Hub</h1>
        </div>

        {/* User Score Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Your Security Score</span>
            <span className="text-lg font-mono font-black text-emerald-400">
              {userScore?.score || 85} / 100
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Quiz & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Phishing Quiz (2 Columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
                Interactive Phishing Quiz — Question {currentQuizIdx + 1} of {quizzes.length}
              </h3>
            </div>
            {currentQuiz && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {currentQuiz.difficulty} Tier
              </span>
            )}
          </div>

          {currentQuiz ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-100">{currentQuiz.question}</p>

              <div className="space-y-2">
                {currentQuiz.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentQuiz.correct_index;
                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-sky-500/40';

                  if (quizSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-300';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-sky-500/20 border-sky-500/60 text-sky-300';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-xs text-left font-mono transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {quizSubmitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs font-mono">
                  <span className="text-emerald-400 font-bold block">Expert Cybersecurity Analysis:</span>
                  <p className="text-slate-300">{currentQuiz.explanation}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuizAnswer}
                    disabled={selectedAnswer === null}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuiz}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Next Challenge →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-mono">Loading challenges...</p>
          )}
        </div>

        {/* Earned Badges Column */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide">
              Security Badges & Rank
            </h3>
            <Award className="w-4 h-4 text-sky-400" />
          </div>

          <div className="space-y-3">
            {(userScore?.badges || [
              { name: "Phish Hunter", desc: "Successfully identified 5 phishing URLs" },
              { name: "MFA Champion", desc: "Completed credential defense training" },
              { name: "Zero-Day Scout", desc: "Spotted advanced homoglyph obfuscation" }
            ]).map((b, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">{b.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spot the Phish Interactive Mini-Challenges */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase font-mono tracking-wide flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Spot-the-Phish Rapid Triage Challenges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map((c) => {
            const answered = spotVerdict[c.id] !== undefined;
            const isCorrect = spotVerdict[c.id] === c.is_phishing;
            return (
              <div key={c.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block mb-1">
                    {c.type}
                  </span>
                  <p className="text-xs font-mono text-slate-200 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    {c.target}
                  </p>
                </div>

                {!answered ? (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setSpotVerdict({ ...spotVerdict, [c.id]: false })}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-emerald-400 border border-slate-700 text-xs font-mono cursor-pointer"
                    >
                      Safe
                    </button>
                    <button
                      onClick={() => setSpotVerdict({ ...spotVerdict, [c.id]: true })}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 text-xs font-mono cursor-pointer"
                    >
                      Phishing
                    </button>
                  </div>
                ) : (
                  <div className={`p-2.5 rounded-lg border text-xs font-mono ${
                    isCorrect ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}>
                    <p className="font-bold">{isCorrect ? '✅ Correct Triage!' : '❌ Incorrect Analysis'}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{c.details}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

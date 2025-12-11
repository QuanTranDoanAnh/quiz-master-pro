import { useState, useMemo, useEffect, useCallback } from 'react';
import { AppScreen, type Question, type ExamSession, type AppScreenType } from './types';
import { getRandomQuestions } from './utils/parser';
import { Importer } from './components/Importer';
import { QuestionCard } from './components/QuestionCard';
import { Button } from './components/Button';
import { BrainCircuit, Play, Upload, RotateCcw, CheckCircle, ChevronLeft, ChevronRight, Menu, X, LayoutDashboard, Clock, Timer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const SAMPLE_DATA: Question[] = [
  {
    id: 1,
    originalNumber: 1,
    text: "Which of the following is a React Hook?",
    options: [
      { id: 'a', text: "useState", isCorrect: true },
      { id: 'b', text: "getState", isCorrect: false },
      { id: 'c', text: "useEffect", isCorrect: true },
      { id: 'd', text: "ngOnInit", isCorrect: false },
    ]
  },
  {
    id: 2,
    originalNumber: 2,
    text: "What is the capital of France?",
    options: [
      { id: 'a', text: "Berlin", isCorrect: false },
      { id: 'b', text: "London", isCorrect: false },
      { id: 'c', text: "Madrid", isCorrect: false },
      { id: 'd', text: "Paris", isCorrect: true },
    ]
  },
];

const EXAM_DURATION_SECONDS = 45 * 60; // 45 minutes

export default function App() {
  const [screen, setScreen] = useState<AppScreenType>(AppScreen.WELCOME);
  const [questionBank, setQuestionBank] = useState<Question[]>(SAMPLE_DATA);
  const [activeExam, setActiveExam] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Initialize Exam
  const startExam = () => {
    const count = questionBank.length > 42 ? 42 : questionBank.length;
    const sessionQuestions = getRandomQuestions(questionBank, count);

    setActiveExam({
      questions: sessionQuestions,
      answers: {},
      isSubmitted: false,
      startTime: Date.now(),
      duration: EXAM_DURATION_SECONDS,
    });
    setTimeRemaining(EXAM_DURATION_SECONDS);
    setCurrentQuestionIndex(0);
    setScreen(AppScreen.QUIZ);
    setIsSidebarOpen(false);
  };

  // Handle Option Selection
  const handleOptionToggle = (questionId: number, optionId: string) => {
    if (!activeExam || activeExam.isSubmitted) return;

    setActiveExam(prev => {
      if (!prev) return null;
      const currentAnswers = prev.answers[questionId] || [];
      let newAnswers;

      if (currentAnswers.includes(optionId)) {
        newAnswers = currentAnswers.filter(id => id !== optionId);
      } else {
        newAnswers = [...currentAnswers, optionId];
      }

      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: newAnswers
        }
      };
    });
  };

  const finishExam = useCallback(() => {
    setActiveExam(prev => prev ? ({ ...prev, isSubmitted: true, endTime: Date.now() }) : null);
    setScreen(AppScreen.RESULTS);
  }, []);

  const handleSubmitClick = (skipConfirm = false) => {
    if (skipConfirm || window.confirm("Are you sure you want to submit your answers?")) {
      finishExam();
    }
  };

  // Timer Logic
  useEffect(() => {
    if (!activeExam || activeExam.isSubmitted || screen !== AppScreen.QUIZ) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const endTime = activeExam.startTime + (activeExam.duration * 1000);
      const secondsLeft = Math.max(0, Math.ceil((endTime - now) / 1000));

      setTimeRemaining(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(intervalId);
        finishExam();
        alert("Time's up! Your exam has been submitted automatically.");
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeExam?.isSubmitted, activeExam?.startTime, activeExam?.duration, screen, finishExam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculation Logic
  const results = useMemo(() => {
    if (!activeExam) return { correct: 0, total: 0, score: 0, timeTaken: 0 };

    let correctCount = 0;
    activeExam.questions.forEach(q => {
      const userSelected = new Set(activeExam.answers[q.id] || []);
      const correctOptions = new Set(q.options.filter(o => o.isCorrect).map(o => o.id));

      if (userSelected.size === correctOptions.size &&
        [...userSelected].every(val => correctOptions.has(val))) {
        correctCount++;
      }
    });

    const endTime = activeExam.endTime || Date.now();
    const timeTaken = Math.max(0, Math.floor((endTime - activeExam.startTime) / 1000));

    return {
      correct: correctCount,
      total: activeExam.questions.length,
      score: activeExam.questions.length > 0 ? Math.round((correctCount / activeExam.questions.length) * 100) : 0,
      timeTaken
    };
  }, [activeExam]);

  // --- Render Functions ---

  const renderWelcome = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BrainCircuit size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">QuizMaster Pro</h1>
        <p className="text-slate-500 mb-8">
          Adaptive testing system. <br />Loaded: <span className="font-semibold text-slate-900">{questionBank.length} questions</span>.
        </p>

        <div className="space-y-3">
          <Button fullWidth size="lg" onClick={startExam}>
            <Play className="mr-2" size={20} /> Start New Exam
          </Button>
          <Button fullWidth variant="outline" onClick={() => setScreen(AppScreen.IMPORT)}>
            <Upload className="mr-2" size={20} /> Import Question Bank
          </Button>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!activeExam) return null;

    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <BrainCircuit size={24} />
            <span className="hidden sm:inline">QuizMaster Pro</span>
            <span className="text-slate-400 font-normal">| Results</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setScreen(AppScreen.WELCOME)}>Exit to Home</Button>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 space-y-8 pb-20">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-around gap-8">
              {/* Chart */}
              <div className="relative w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Correct', value: results.correct },
                        { name: 'Incorrect', value: results.total - results.correct }
                      ]}
                      innerRadius={50}
                      outerRadius={75}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill="#16a34a" />
                      <Cell fill="#ef4444" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-800">{results.score}%</span>
                  <span className="text-xs text-slate-500 uppercase font-bold">Score</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 w-full max-w-md">
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" /> Correct Answers
                  </span>
                  <span className="text-2xl font-bold text-slate-800">{results.correct} <span className="text-slate-400 text-lg">/ {results.total}</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Timer size={16} className="text-blue-500" /> Time Taken
                  </span>
                  <span className="text-2xl font-bold text-slate-800">{formatTime(results.timeTaken)}</span>
                </div>
                <div className="col-span-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${results.score}%`, backgroundColor: results.score >= 70 ? '#16a34a' : results.score >= 50 ? '#eab308' : '#dc2626' }}
                    />
                  </div>
                  <p className="text-center mt-2 text-sm text-slate-500">
                    {results.score >= 80 ? 'Excellent work!' : results.score >= 50 ? 'Good effort, keep practicing!' : 'Keep studying, you can do it!'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
              <Button onClick={startExam} variant="primary" size="lg" className="shadow-lg shadow-blue-500/20">
                <RotateCcw className="mr-2" size={20} /> Take New Exam
              </Button>
            </div>
          </div>

          {/* Detailed Review List */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutDashboard className="text-slate-400" /> Detailed Review
            </h3>
            {activeExam.questions.map((question, index) => (
              <div key={question.id} className="relative">
                {/* Index Badge */}
                <div className="absolute -left-3 -top-3 z-10 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                  {index + 1}
                </div>
                <QuestionCard
                  question={question}
                  selectedOptionIds={activeExam.answers[question.id] || []}
                  onToggleOption={() => { }} // Read only
                  isSubmitted={true}
                />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  };

  const renderQuiz = () => {
    if (!activeExam) return null;
    const currentQuestion = activeExam.questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu />
            </Button>
            <div className="flex items-center gap-2 text-primary font-bold text-lg">
              <BrainCircuit size={24} />
              <span className="hidden sm:inline">QuizMaster Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 font-mono font-medium text-lg ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              <Clock size={20} />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            <div className="hidden md:block text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Q{currentQuestionIndex + 1}/{activeExam.questions.length}
            </div>

            <Button size="sm" variant="primary" onClick={() => handleSubmitClick(false)}>Submit Exam</Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <aside className={`
            fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0
          `}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Questions</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-2 content-start">
              {activeExam.questions.map((q, idx) => {
                const isAnswered = (activeExam.answers[q.id]?.length || 0) > 0;
                const isCurrent = idx === currentQuestionIndex;

                let colorClass = "bg-white border-slate-200 text-slate-600 hover:border-slate-300";
                if (isCurrent) colorClass = "bg-primary text-white border-primary ring-2 ring-blue-200";
                else if (isAnswered) colorClass = "bg-blue-50 border-blue-200 text-blue-700";

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition-all ${colorClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </aside>

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
            <div className="max-w-3xl mx-auto space-y-6">
              <QuestionCard
                question={currentQuestion}
                selectedOptionIds={activeExam.answers[currentQuestion.id] || []}
                onToggleOption={(optId) => handleOptionToggle(currentQuestion.id, optId)}
                isSubmitted={false}
              />

              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                <Button
                  variant="primary"
                  onClick={() => {
                    if (currentQuestionIndex < activeExam.questions.length - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                    } else {
                      // Skip confirmation on the final button for smoother UX
                      handleSubmitClick(true);
                    }
                  }}
                >
                  {currentQuestionIndex === activeExam.questions.length - 1 ? 'Submit' : 'Next'}
                  {currentQuestionIndex < activeExam.questions.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  };

  return (
    <>
      {screen === AppScreen.WELCOME && renderWelcome()}
      {screen === AppScreen.IMPORT && (
        <div className="min-h-screen bg-slate-50 p-6">
          <Importer
            onImport={(data) => {
              setQuestionBank(data);
              setScreen(AppScreen.WELCOME);
            }}
            onCancel={() => setScreen(AppScreen.WELCOME)}
          />
        </div>
      )}
      {screen === AppScreen.QUIZ && renderQuiz()}
      {screen === AppScreen.RESULTS && renderResults()}
    </>
  );
}
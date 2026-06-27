import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Sparkles, 
  Clock, 
  Calendar, 
  Edit3, 
  AlertTriangle, 
  TrendingUp, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  UploadCloud, 
  DownloadCloud, 
  Trash2, 
  Plus, 
  ChevronRight, 
  Music, 
  Wind, 
  X, 
  RefreshCw, 
  Sliders, 
  Globe, 
  User, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Link2,
  CalendarDays,
  FileText,
  Flame,
  LineChart,
  ArrowRight,
  Info,
  CheckSquare,
  Square,
  Mic,
  MicOff,
  MapPin,
  Zap,
  Target,
  Compass,
  Award
} from 'lucide-react';

// Define TS types
interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO or date string
  duration: number; // minutes
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
  notes?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string; // 'indigo' | 'emerald' | 'rose' | 'amber' | 'neutral'
  subtitle?: string;
}

interface FocusBlock {
  title: string;
  timeSlot: string;
  duration: number;
  reason: string;
  targetTaskId?: string;
}

interface LuminaState {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  scratchpad: string;
  streak: number;
  focusScore: number;
  completedBlocksCount: number;
  focusBlocks: FocusBlock[];
  proactiveInsight: string;
  criticalRecommendations: string[];
  dailyStreakTip: string;
}

// Default initial state matching Bento guidelines
const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Submit Legal Review',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // due in 2 hours
    duration: 30,
    priority: 'high',
    category: 'Work',
    completed: false,
    notes: 'Requires final sign-off on NDA clauses from executive team.'
  },
  {
    id: 't2',
    title: 'Call Marketing Lead',
    dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    duration: 15,
    priority: 'medium',
    category: 'Work',
    completed: false,
    notes: 'Prioritized by remind with AI to sync on the Q4 release dates.'
  },
  {
    id: 't3',
    title: 'Gym Session',
    dueDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    priority: 'low',
    category: 'Personal',
    completed: true,
  },
  {
    id: 't4',
    title: 'Draft Client Proposal',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    duration: 90,
    priority: 'low',
    category: 'Work',
    completed: false,
    notes: 'Outline Q4 objectives and pricing structures.'
  }
];

const DEFAULT_CALENDAR: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Team Standup',
    startTime: '09:00',
    endTime: '10:00',
    color: 'indigo',
    subtitle: 'Product Sync • Zoom'
  },
  {
    id: 'e2',
    title: 'Lunch Break',
    startTime: '12:00',
    endTime: '13:00',
    color: 'neutral',
    subtitle: 'Unplugged'
  },
  {
    id: 'e3',
    title: 'Weekly Sync',
    startTime: '15:00',
    endTime: '16:00',
    color: 'amber',
    subtitle: 'Marketing updates'
  }
];

const DEFAULT_FOCUS_BLOCKS: FocusBlock[] = [
  {
    title: 'remind with AI Focus Block',
    timeSlot: '10:15 - 11:45',
    duration: 90,
    reason: 'Deep Work • AI Optimized mental energy slot based on Team Standup gap',
    targetTaskId: 't4'
  }
];

const DEFAULT_INSIGHT = 'Based on your calendar energy patterns, tackling "Draft Client Proposal" now will increase completion speed by 22% because of low cognitive strain before lunch.';
const DEFAULT_RECOMMENDATIONS = [
  'Submit Legal Review is due in less than 2 hours. Address it immediately.',
  'Allocate a 90-minute slot for "Draft Client Proposal" to stay ahead of tomorrow\'s deadline.'
];

// Pure JS Sound Synthesizer via Web Audio API for offline ambient focus soundscapes
class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private oscillatorNode: OscillatorNode | null = null;

  start(type: 'rain' | 'deep' | 'zen', volume: number = 0.5) {
    this.stop();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Generate 2 seconds of white noise
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.gainNode = this.ctx.createGain();

      if (type === 'rain') {
        // Highpass filtering slightly, then lowpass to make it sound like rain/wind
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(900, this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
      } else if (type === 'deep') {
        // Deep brown/pink noise low frequency hum
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(220, this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(volume * 0.4, this.ctx.currentTime);
      } else if (type === 'zen') {
        // Pure resonant tone sweeping up and down slowly like ocean wave
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.setValueAtTime(350, this.ctx.currentTime);
        this.gainNode.gain.setValueAtTime(volume * 0.1, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // very slow wave
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(this.filterNode.frequency);
        lfo.start();
        this.oscillatorNode = lfo;
      }

      this.noiseSource.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.noiseSource.start();
    } catch (e) {
      console.error('Failed to initialize Web Audio Synthesizer:', e);
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(volume * 0.2, this.ctx.currentTime);
    }
  }

  stop() {
    try {
      if (this.noiseSource) {
        this.noiseSource.stop();
        this.noiseSource = null;
      }
      if (this.oscillatorNode) {
        this.oscillatorNode.stop();
        this.oscillatorNode = null;
      }
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
    } catch (e) {
      // already stopped
    }
  }

  playChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const chimeCtx = new AudioContextClass();
      const osc = chimeCtx.createOscillator();
      const gain = chimeCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, chimeCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, chimeCtx.currentTime + 0.15); // Slide up to A5
      
      gain.gain.setValueAtTime(0.2, chimeCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, chimeCtx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(chimeCtx.destination);
      
      osc.start();
      osc.stop(chimeCtx.currentTime + 0.6);
    } catch (e) {
      console.error('Failed to play chime:', e);
    }
  }
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    question: 'What is the "Zeigarnik Effect" in productivity?',
    answer: 'The tendency to remember uncompleted or interrupted tasks better than completed ones. Keeping a clean scratchpad helps offload this cognitive strain.'
  },
  {
    id: 'fc-2',
    question: 'How does the Pomodoro Technique prevent fatigue?',
    answer: 'By imposing regular 5-minute cognitive rests (breaks) that allow the prefrontal cortex to recharge after 25 minutes of deep focus.'
  },
  {
    id: 'fc-3',
    question: 'What is deep work?',
    answer: 'Professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit.'
  }
];

export default function App() {
  // State Initialization from localStorage or defaults
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('lumina_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('lumina_calendar');
    return saved ? JSON.parse(saved) : DEFAULT_CALENDAR;
  });

  const [scratchpad, setScratchpad] = useState<string>(() => {
    const saved = localStorage.getItem('lumina_scratchpad');
    return saved !== null ? saved : `- Research vector databases for next sprint\n- Draft client proposal for Q4`;
  });

  const [focusBlocks, setFocusBlocks] = useState<FocusBlock[]>(() => {
    const saved = localStorage.getItem('lumina_focus_blocks');
    return saved ? JSON.parse(saved) : DEFAULT_FOCUS_BLOCKS;
  });

  const [proactiveInsight, setProactiveInsight] = useState<string>(() => {
    localStorage.getItem('lumina_insight') || DEFAULT_INSIGHT;
    return localStorage.getItem('lumina_insight') || DEFAULT_INSIGHT;
  });

  const [criticalRecommendations, setCriticalRecommendations] = useState<string[]>(() => {
    const saved = localStorage.getItem('lumina_recs');
    return saved ? JSON.parse(saved) : DEFAULT_RECOMMENDATIONS;
  });

  const [dailyStreakTip, setDailyStreakTip] = useState<string>(() => {
    return localStorage.getItem('lumina_streak_tip') || 'You are on a 5-day streak. Complete 1 focus block to secure it!';
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('lumina_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [focusScore, setFocusScore] = useState<number>(() => {
    const saved = localStorage.getItem('lumina_focus_score');
    return saved ? parseInt(saved, 10) : 84;
  });

  const [completedBlocksCount, setCompletedBlocksCount] = useState<number>(() => {
    const saved = localStorage.getItem('lumina_completed_blocks');
    return saved ? parseInt(saved, 10) : 12;
  });

  // Pomodoro States
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [pomodoroSessionsCompleted, setPomodoroSessionsCompleted] = useState(() => {
    return parseInt(localStorage.getItem('lumina_pomo_sessions') || '0', 10);
  });
  const [autoPlaySynthOnPomo, setAutoPlaySynthOnPomo] = useState(false);

  // Flashcards States
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('lumina_flashcards');
    return saved ? JSON.parse(saved) : DEFAULT_FLASHCARDS;
  });
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [showCardCreator, setShowCardCreator] = useState(false);

  // UI States
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncErrorMessage, setSyncErrorMessage] = useState('');

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  // New Calendar Event Form State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventStart, setNewEventStart] = useState('10:00');
  const [newEventEnd, setNewEventEnd] = useState('11:00');
  const [newEventColor, setNewEventColor] = useState('indigo');

  // New Task Inline Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [newTaskCategory, setNewTaskCategory] = useState('Work');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Immersive Focus Mode States
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [focusTimeTotal, setFocusTimeTotal] = useState(90 * 60); // Default 90m
  const [focusTimeLeft, setFocusTimeLeft] = useState(90 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState<'none' | 'rain' | 'deep' | 'zen'>('none');
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingSecs, setBreathingSecs] = useState(4);
  const [breathingGuideEnabled, setBreathingGuideEnabled] = useState(true);

  // --- Habit & Goal Tracking ---
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('remind_habits');
    return saved ? JSON.parse(saved) : [
      { id: 'h1', name: 'Morning Focus Block (Deep Work)', streak: 4, completedDays: [true, true, true, true, false, false, false] },
      { id: 'h2', name: 'Review Critical Path Reminders', streak: 5, completedDays: [true, true, true, true, true, false, false] },
      { id: 'h3', name: 'Solve 1 Hard Concept / Flashcards', streak: 2, completedDays: [false, true, true, false, false, false, false] }
    ];
  });
  const [newHabitName, setNewHabitName] = useState('');

  // --- Personalized Productivity Recommendations ---
  const [aiRecsList, setAiRecsList] = useState(() => {
    const saved = localStorage.getItem('remind_ai_recs');
    return saved ? JSON.parse(saved) : [
      { type: 'Focus', tip: 'Plan your Focus window today between 10:00 and 11:30. Block notifications.', impact: '+15% focus score boost' },
      { type: 'Rest', tip: 'Step away from all displays during your Pomodoro 5-minute cognitive breaks.', impact: '-20% ocular fatigue' },
      { type: 'Action', tip: 'Your top task "Launch marketing campaign" has no calendar block. Generate an AI block.', impact: 'Dodge deadline stress' }
    ];
  });
  const [isGeneratingRecs, setIsGeneratingRecs] = useState(false);

  // --- Context-Aware Reminders ---
  const [currentContextLocation, setCurrentContextLocation] = useState<'Home' | 'Office' | 'Gym' | 'Library'>('Office');
  const [currentContextFocusMode, setCurrentContextFocusMode] = useState<'Deep Focus' | 'Leisure' | 'Meetings'>('Deep Focus');
  const [contextReminders, setContextReminders] = useState(() => {
    const saved = localStorage.getItem('remind_context_reminders');
    return saved ? JSON.parse(saved) : [
      { id: 'cr-1', text: 'Review study flashcards for 10 minutes', triggerLocation: 'Library', triggerMode: 'Deep Focus', isTriggered: false },
      { id: 'cr-2', text: 'Stand up and practice diaphragmatic breathing', triggerLocation: 'Office', triggerMode: 'Deep Focus', isTriggered: false },
      { id: 'cr-3', text: 'Log finished execution steps in autonomous planner', triggerLocation: 'Home', triggerMode: 'Deep Focus', isTriggered: false }
    ];
  });
  const [newContextText, setNewContextText] = useState('');
  const [newContextLoc, setNewContextLoc] = useState<'Home' | 'Office' | 'Gym' | 'Library'>('Office');
  const [newContextMode, setNewContextMode] = useState<'Deep Focus' | 'Leisure' | 'Meetings'>('Deep Focus');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // --- Voice-Enabled Assistant ---
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);

  // --- Autonomous Planner Agent ---
  const [plannerGoalInput, setPlannerGoalInput] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningStepIndex, setPlanningStepIndex] = useState(-1);
  const [planningSteps, setPlanningSteps] = useState<string[]>([]);
  const [plannerResults, setPlannerResults] = useState<any[]>([]);

  // --- AI Prioritization ---
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  // AI Chat Assistant State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'lumina'; text: string }>>([
    { sender: 'lumina', text: "Hello! I am **remind with AI**, your dedicated productivity coach. How can I assist you with your reminders, schedules, tasks, or focus blocks today?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Audio Synth Ref
  const synthRef = useRef<AmbientSynthesizer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Sync state to local storage when state changes
  useEffect(() => {
    localStorage.setItem('lumina_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lumina_calendar', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('lumina_scratchpad', scratchpad);
  }, [scratchpad]);

  useEffect(() => {
    localStorage.setItem('lumina_focus_blocks', JSON.stringify(focusBlocks));
  }, [focusBlocks]);

  useEffect(() => {
    localStorage.setItem('lumina_insight', proactiveInsight);
  }, [proactiveInsight]);

  useEffect(() => {
    localStorage.setItem('lumina_recs', JSON.stringify(criticalRecommendations));
  }, [criticalRecommendations]);

  useEffect(() => {
    localStorage.setItem('lumina_streak_tip', dailyStreakTip);
  }, [dailyStreakTip]);

  useEffect(() => {
    localStorage.setItem('lumina_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('lumina_focus_score', focusScore.toString());
  }, [focusScore]);

  useEffect(() => {
    localStorage.setItem('lumina_completed_blocks', completedBlocksCount.toString());
  }, [completedBlocksCount]);

  // Sync Flashcards to local storage
  useEffect(() => {
    localStorage.setItem('lumina_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  // Sync new custom features to local storage
  useEffect(() => {
    localStorage.setItem('remind_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('remind_ai_recs', JSON.stringify(aiRecsList));
  }, [aiRecsList]);

  useEffect(() => {
    localStorage.setItem('remind_context_reminders', JSON.stringify(contextReminders));
  }, [contextReminders]);

  // Evaluator for context-aware reminders trigger
  useEffect(() => {
    const matchingReminder = contextReminders.find(
      (cr: any) => !cr.isTriggered && 
      cr.triggerLocation === currentContextLocation && 
      cr.triggerMode === currentContextFocusMode
    );

    if (matchingReminder) {
      // Trigger notification!
      setActiveNotification(`⏰ [Context Trigger: ${currentContextLocation} • ${currentContextFocusMode}] ${matchingReminder.text}`);
      
      // Mark as triggered
      setContextReminders((prev: any) => prev.map((item: any) => 
        item.id === matchingReminder.id ? { ...item, isTriggered: true } : item
      ));

      // Play audio chime
      synthRef.current?.playChime();

      // Voice synthesizes if enabled
      if (voiceFeedbackEnabled && window.speechSynthesis) {
        const textToSpeak = `Context aware reminder triggered. ${matchingReminder.text}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentContextLocation, currentContextFocusMode, contextReminders, voiceFeedbackEnabled]);

  // Pomodoro Countdown Timer Effect
  useEffect(() => {
    let pomoInterval: NodeJS.Timeout | null = null;
    if (isPomodoroRunning && pomodoroTimeLeft > 0) {
      pomoInterval = setInterval(() => {
        setPomodoroTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isPomodoroRunning && pomodoroTimeLeft === 0) {
      // Completed Pomodoro timer session!
      handlePomodoroSessionCompleted();
    }
    return () => {
      if (pomoInterval) clearInterval(pomoInterval);
    };
  }, [isPomodoroRunning, pomodoroTimeLeft]);

  // Focus Timer countdown effect
  useEffect(() => {
    if (isTimerRunning && focusTimeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setFocusTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && focusTimeLeft === 0) {
      // Completed Focus Block!
      handleFocusBlockCompleted();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, focusTimeLeft]);

  // Breathing guide cycle effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusModeActive && breathingGuideEnabled) {
      interval = setInterval(() => {
        setBreathingSecs(prev => {
          if (prev <= 1) {
            setBreathingPhase(current => {
              if (current === 'inhale') return 'hold';
              if (current === 'hold') return 'exhale';
              return 'inhale';
            });
            return 4; // Reset to 4s
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusModeActive, breathingPhase, breathingGuideEnabled]);

  // Audio Synth initialization
  useEffect(() => {
    synthRef.current = new AmbientSynthesizer();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Update volume when slider moves
  useEffect(() => {
    if (synthRef.current && selectedSound !== 'none') {
      synthRef.current.setVolume(soundVolume);
    }
  }, [soundVolume, selectedSound]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Helper to trigger synthesizer
  const handleSoundChange = (sound: 'none' | 'rain' | 'deep' | 'zen') => {
    setSelectedSound(sound);
    if (sound === 'none') {
      synthRef.current?.stop();
    } else {
      synthRef.current?.start(sound, soundVolume);
    }
  };

  // Focus block completed handler
  const handleFocusBlockCompleted = () => {
    setIsTimerRunning(false);
    synthRef.current?.stop();
    setSelectedSound('none');
    
    // Add rewards
    setStreak(prev => prev + 1);
    setCompletedBlocksCount(prev => prev + 1);
    setFocusScore(prev => Math.min(prev + 3, 100));
    
    // Show nice alert/success inside Fullscreen
    alert('🎉 Congratulations! You have successfully completed your Focus Block! Your streak has grown, and your Weekly Productivity Score has risen!');
    setIsFocusModeActive(false);
  };

  // Start Focus Block from Suggestion box
  const startSpecificFocusBlock = (durationMins: number, title: string) => {
    setFocusTimeTotal(durationMins * 60);
    setFocusTimeLeft(durationMins * 60);
    setIsFocusModeActive(true);
    setIsTimerRunning(true);
    // Start with gentle zen wave sound by default!
    handleSoundChange('zen');
  };

  // Handle Pomodoro Session Completion
  const handlePomodoroSessionCompleted = () => {
    setIsPomodoroRunning(false);
    synthRef.current?.playChime();
    
    if (pomodoroMode === 'work') {
      const nextCount = pomodoroSessionsCompleted + 1;
      setPomodoroSessionsCompleted(nextCount);
      localStorage.setItem('lumina_pomo_sessions', nextCount.toString());
      
      // Reward the user
      setFocusScore(prev => Math.min(prev + 5, 100)); // +5 pts for completing Pomodoro deep session!
      setStreak(prev => prev + 1); // increment streak
      
      alert('🍅 Focus Session Complete! Excellent work. Time for a short break.');
      // Auto switch to short break
      setPomodoroMode('shortBreak');
      setPomodoroTimeLeft(5 * 60);
    } else {
      alert('🌱 Break finished! Ready to tackle your next task?');
      setPomodoroMode('work');
      setPomodoroTimeLeft(25 * 60);
    }

    if (autoPlaySynthOnPomo) {
      synthRef.current?.stop();
    }
  };

  const handlePomodoroModeChange = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setPomodoroMode(mode);
    setIsPomodoroRunning(false);
    if (autoPlaySynthOnPomo) {
      synthRef.current?.stop();
    }

    if (mode === 'work') {
      setPomodoroTimeLeft(25 * 60);
    } else if (mode === 'shortBreak') {
      setPomodoroTimeLeft(5 * 60);
    } else if (mode === 'longBreak') {
      setPomodoroTimeLeft(15 * 60);
    }
  };

  const handleTogglePomodoro = () => {
    const nextRunning = !isPomodoroRunning;
    setIsPomodoroRunning(nextRunning);
    
    if (autoPlaySynthOnPomo) {
      if (nextRunning && pomodoroMode === 'work') {
        synthRef.current?.start('zen', soundVolume);
        setSelectedSound('zen');
      } else {
        synthRef.current?.stop();
        setSelectedSound('none');
      }
    }
  };

  const handleResetPomodoro = () => {
    setIsPomodoroRunning(false);
    if (autoPlaySynthOnPomo) {
      synthRef.current?.stop();
      setSelectedSound('none');
    }
    if (pomodoroMode === 'work') {
      setPomodoroTimeLeft(25 * 60);
    } else if (pomodoroMode === 'shortBreak') {
      setPomodoroTimeLeft(5 * 60);
    } else if (pomodoroMode === 'longBreak') {
      setPomodoroTimeLeft(15 * 60);
    }
  };

  // Study interaction: user marked they know the card
  const handleMarkCardMastered = () => {
    setFocusScore(prev => Math.min(prev + 2, 100)); // boost productivity score!
    setIsCardFlipped(false);
    
    // Auto-advance with wrapping
    setTimeout(() => {
      setCurrentFlashcardIndex(prev => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handleCreateFlashcardManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQuestion.trim() || !newCardAnswer.trim()) return;

    const addedCard: Flashcard = {
      id: `fc-${Date.now()}`,
      question: newCardQuestion.trim(),
      answer: newCardAnswer.trim()
    };

    setFlashcards(prev => [...prev, addedCard]);
    setNewCardQuestion('');
    setNewCardAnswer('');
    setShowCardCreator(false);
    setCurrentFlashcardIndex(flashcards.length); // point to new card
  };

  const handleDeleteFlashcard = (id: string) => {
    if (flashcards.length <= 1) {
      alert('Keep at least one study card in your deck!');
      return;
    }
    const filtered = flashcards.filter(fc => fc.id !== id);
    setFlashcards(filtered);
    setCurrentFlashcardIndex(0);
    setIsCardFlipped(false);
  };

  const handleAIGenerateFlashcards = async () => {
    if (!scratchpad.trim()) {
      alert('Your scratchpad notepad is empty! Type some concepts, notes, or code definitions first, then click generate.');
      return;
    }

    setIsGeneratingCards(true);
    try {
      const response = await fetch('/api/ai/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scratchpad })
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setCurrentFlashcardIndex(0);
        setIsCardFlipped(false);
        alert(`🎉 remind with AI generated ${data.flashcards.length} custom study cards from your notepad drafts successfully!`);
      } else {
        alert('The AI reviewed your notepad but did not generate card items.');
      }
    } catch (e) {
      console.error('Failed to generate cards:', e);
      alert('Flashcard generation failed. Using offline smart parser to make some key concept cards from your scratchpad lines!');
      
      // Fallback offline parser! Extremely robust.
      const lines = scratchpad.split('\n');
      const generated: Flashcard[] = [];
      lines.forEach((line, idx) => {
        const cleaned = line.replace(/^[-*•\s\d.]+\s*/, '').trim();
        if (cleaned.length > 10) {
          // If the line contains a colon or hyphen, split into question/answer
          const parts = cleaned.split(/[:\-–]/);
          if (parts.length >= 2 && parts[0].trim().length > 2 && parts[1].trim().length > 5) {
            generated.push({
              id: `fc-ai-fallback-${Date.now()}-${idx}`,
              question: parts[0].trim() + '?',
              answer: parts[1].trim()
            });
          } else {
            // Otherwise create a quick summary card
            generated.push({
              id: `fc-ai-fallback-${Date.now()}-${idx}`,
              question: `Review details for: "${cleaned.substring(0, 25)}..."`,
              answer: cleaned
            });
          }
        }
      });

      if (generated.length > 0) {
        setFlashcards(generated);
        setCurrentFlashcardIndex(0);
        setIsCardFlipped(false);
      } else {
        alert('Write some lines in your notepad, then try again!');
      }
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // Fetch AI Smart suggestions from Server
  const getAISuggestions = async () => {
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          calendarEvents,
          scratchpad,
          currentTime: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      if (data.focusBlocks) setFocusBlocks(data.focusBlocks);
      if (data.proactiveInsight) setProactiveInsight(data.proactiveInsight);
      if (data.criticalRecommendations) setCriticalRecommendations(data.criticalRecommendations);
      if (data.dailyStreakTip) setDailyStreakTip(data.dailyStreakTip);

    } catch (e: any) {
      console.error('Failed to get suggestions:', e);
      alert('Could not sync with the remind with AI Server. Please ensure GEMINI_API_KEY is configured in the secrets menu, or try again later. Proceeding with offline algorithms.');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Extract tasks from scratchpad
  const extractTasksFromScratchpad = async () => {
    if (!scratchpad.trim()) {
      alert('Your scratchpad is empty! Type some tasks, bullet points, or schedules first.');
      return;
    }
    setIsExtracting(true);
    try {
      const response = await fetch('/api/ai/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scratchpad,
          currentTime: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed task extraction');
      }

      const data = await response.json();
      if (data.tasks && data.tasks.length > 0) {
        const parsedTasks: Task[] = data.tasks.map((t: any, i: number) => ({
          id: `extracted-${Date.now()}-${i}`,
          title: t.title,
          dueDate: t.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: t.duration || 30,
          priority: t.priority === 'high' || t.priority === 'medium' || t.priority === 'low' ? t.priority : 'medium',
          category: t.category || 'Work',
          completed: false,
          notes: t.notes || ''
        }));

        setTasks(prev => [...prev, ...parsedTasks]);
        setExtractionSuccess(true);
        setTimeout(() => setExtractionSuccess(false), 4000);
      } else {
        alert('The AI reviewed your notepad, but did not find any clear, actionable tasks to extract. Try writing something more concrete like "- Finish proposal by 4pm" or "- Book dentist appointment tomorrow".');
      }
    } catch (e) {
      console.error('Extraction error:', e);
      alert('Task extraction failed. Using fallback parser: extracting bullet points manually!');
      
      // Fallback manual parser to keep features 100% functional offline
      const lines = scratchpad.split('\n');
      const fallbackTasks: Task[] = [];
      lines.forEach((line, index) => {
        const cleaned = line.replace(/^[-*•\s\d.]+\s*/, '').trim();
        if (cleaned.length > 3) {
          fallbackTasks.push({
            id: `manual-extracted-${Date.now()}-${index}`,
            title: cleaned,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            duration: 30,
            priority: 'medium',
            category: 'Inbox',
            completed: false
          });
        }
      });
      if (fallbackTasks.length > 0) {
        setTasks(prev => [...prev, ...fallbackTasks]);
        setExtractionSuccess(true);
        setTimeout(() => setExtractionSuccess(false), 4000);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  // Live Chat with Coach
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: chatMessages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
          tasks,
          calendarEvents,
          scratchpad
        })
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'lumina', text: data.response }]);

      // Voice synthesizes if enabled
      if (voiceFeedbackEnabled && window.speechSynthesis) {
        const cleanText = data.response.replace(/[\*#_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error('Chat error:', e);
      // Fallback smart response to keep the UI beautiful and supportive offline
      setTimeout(() => {
        const fallbackText = `I received your message! [Offline Mode] Based on your local task list, I highly recommend prioritizing ${tasks.filter(t => !t.completed).sort((a,b)=> a.priority==='high'?-1:1)[0]?.title || 'adding more items to your schedule'} first, then planning a focused block of deep execution. Let me know if you would like me to reorganize any calendar item!`;
        setChatMessages(prev => [...prev, { 
          sender: 'lumina', 
          text: fallbackText
        }]);

        if (voiceFeedbackEnabled && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(fallbackText);
          window.speechSynthesis.speak(utterance);
        }
      }, 1000);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Voice-Enabled Assistance (Speech Recognition & Dictation) ---
  const handleToggleVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser environment. Try using Chrome, Edge, or Safari!");
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceListening(true);
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsVoiceListening(false);
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setChatInput(resultText);
      setTimeout(() => {
        sendCustomVoiceMessage(resultText);
      }, 600);
    };

    recognition.start();
  };

  const sendCustomVoiceMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: chatMessages.slice(-6).map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
          tasks,
          calendarEvents,
          scratchpad
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setChatMessages(prev => [...prev, { sender: 'lumina', text: data.response }]);
      if (voiceFeedbackEnabled && window.speechSynthesis) {
        const cleanText = data.response.replace(/[\*#_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      const fallbackText = `Heard you say: "${messageText}". [Offline backup mode] Let me know if you want me to help map a study plan!`;
      setChatMessages(prev => [...prev, { sender: 'lumina', text: fallbackText }]);
      if (voiceFeedbackEnabled && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Intelligent Task Prioritization (Cloud AI-Powered) ---
  const handleAIPrioritize = async () => {
    if (tasks.length === 0) {
      alert("You have no tasks to prioritize! Try adding 2-3 tasks in the Critical Path dashboard first.");
      return;
    }
    setIsPrioritizing(true);
    try {
      const response = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.prioritizedTasks && data.prioritizedTasks.length > 0) {
        const updatedTasks = tasks.map(task => {
          const match = data.prioritizedTasks.find((t: any) => t.id === task.id || t.title.toLowerCase() === task.title.toLowerCase());
          if (match) {
            return {
              ...task,
              priority: (match.priority === 'high' || match.priority === 'medium' || match.priority === 'low') ? match.priority : task.priority,
              notes: `[AI Score: ${match.priorityScore}/100 • ${match.urgencyReason}] ${task.notes || ''}`.trim()
            };
          }
          return task;
        });

        // Sort descending by priority (high -> medium -> low) and notes score
        const orderedTasks = [...updatedTasks].sort((a, b) => {
          const matchA = data.prioritizedTasks.find((t: any) => t.id === a.id);
          const matchB = data.prioritizedTasks.find((t: any) => t.id === b.id);
          const scoreA = matchA ? matchA.priorityScore : 0;
          const scoreB = matchB ? matchB.priorityScore : 0;
          return scoreB - scoreA;
        });

        setTasks(orderedTasks);
        alert("✨ Intelligent priority optimization completed successfully! Tasks re-ordered and annotated with urgency scores.");
      } else {
        alert("Could not prioritize tasks. Try again later.");
      }
    } catch (e) {
      console.error("Priority error:", e);
      // Offline fallback
      const sorted = [...tasks].sort((a, b) => {
        const rank = { high: 3, medium: 2, low: 1 };
        return rank[b.priority] - rank[a.priority];
      });
      setTasks(sorted);
      alert("AI prioritization offline. Reordered tasks locally by standard rank priority (High -> Medium -> Low).");
    } finally {
      setIsPrioritizing(false);
    }
  };

  // --- AI-Powered Scheduling Assistance ---
  const handleAISmartSchedule = async () => {
    setIsSuggesting(true);
    try {
      const response = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, calendarEvents })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.scheduleSuggestions && data.scheduleSuggestions.length > 0) {
        const suggestions: FocusBlock[] = data.scheduleSuggestions.map((item: any) => ({
          title: item.title,
          timeSlot: item.timeSlot,
          duration: item.duration,
          reason: item.reason
        }));
        setFocusBlocks(suggestions);
        alert("🗓️ AI scheduling assistant mapped optimal deep focus blocks into your calendar!");
      } else {
        alert("AI did not suggest new calendar slots. Your schedule looks clean!");
      }
    } catch (e) {
      console.error("Scheduling assistance error:", e);
      setFocusBlocks([
        { title: "Morning Focus Block", timeSlot: "09:30 - 11:00", duration: 90, reason: "Deep Work • High cognitive slot" },
        { title: "Afternoon Focus Block", timeSlot: "14:00 - 15:30", duration: 90, reason: "Review • Midday execution wrap-up" }
      ]);
      alert("AI Scheduling server currently offline. Loaded fallback smart scheduling blocks.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // --- Personalized Productivity Recommendations ---
  const handleAIGenerateRecs = async () => {
    setIsGeneratingRecs(true);
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, focusScore, pomoSessions: pomodoroSessionsCompleted })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setAiRecsList(data.recommendations);
        alert("💡 Personalized AI productivity & cognitive recommendations updated!");
      }
    } catch (e) {
      console.error("Recs error:", e);
      alert("AI Recommendations offline. Keep focus steady and use screen-breaks!");
    } finally {
      setIsGeneratingRecs(false);
    }
  };

  // --- Autonomous Task Planning and Execution Agent ---
  const handleExecuteAutonomousPlanner = async () => {
    if (!plannerGoalInput.trim()) {
      alert("Specify a high-level goal (e.g. 'Build portfolio website') to let the Autonomous Agent plan & execute!");
      return;
    }

    setIsPlanning(true);
    setPlanningStepIndex(0);
    setPlanningSteps([
      "🔍 Analyzing objective structure and dependencies...",
      "⚡ Decomposing goal into critical-path execution sequence...",
      "🧠 Structuring step durations and priority hierarchy...",
      "🚀 Executing planner and populating task workspace..."
    ]);

    // Animate steps beautifully for immersive agent feel!
    for (let i = 0; i < 4; i++) {
      setPlanningStepIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch('/api/ai/autonomous-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: plannerGoalInput })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();

      if (data.plannedSteps && data.plannedSteps.length > 0) {
        const mappedTasks: Task[] = data.plannedSteps.map((step: any, idx: number) => ({
          id: `planner-${Date.now()}-${idx}`,
          title: `[Agent Plan] ${step.taskName}`,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: step.durationMinutes || 30,
          priority: step.priority === 'high' || step.priority === 'medium' || step.priority === 'low' ? step.priority : 'medium',
          category: step.category || 'Agent Execution',
          completed: false,
          notes: step.importance || `Step ${idx + 1} of goal: ${plannerGoalInput}`
        }));

        setTasks(prev => [...prev, ...mappedTasks]);
        setPlannerResults(data.plannedSteps);
        alert(`🤖 Autonomous Agent completed! Placed ${data.plannedSteps.length} planned sub-tasks in your task panel.`);
      }
    } catch (e) {
      console.error("Agent planning error:", e);
      // Fallback planner offline steps
      const fallbackSteps = [
        { taskName: "Research requirements and tools", durationMinutes: 30, priority: "high" as const, category: "Research" },
        { taskName: "Build core prototype structure", durationMinutes: 60, priority: "high" as const, category: "Execution" },
        { taskName: "Refine user interfaces and layout", durationMinutes: 45, priority: "medium" as const, category: "Polish" },
        { taskName: "Run checks and deploy", durationMinutes: 30, priority: "low" as const, category: "Polish" }
      ];

      const mappedTasks: Task[] = fallbackSteps.map((step, idx) => ({
        id: `planner-fallback-${Date.now()}-${idx}`,
        title: `[Offline Agent] ${step.taskName}`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: step.durationMinutes,
        priority: step.priority,
        category: step.category,
        completed: false,
        notes: `Step ${idx + 1} of offline backup plan`
      }));

      setTasks(prev => [...prev, ...mappedTasks]);
      alert("Plan generated using default agent sequence (AI server offline).");
    } finally {
      setIsPlanning(false);
      setPlanningStepIndex(-1);
      setPlannerGoalInput('');
    }
  };

  // --- Habit Add/Check Handlers ---
  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    const item = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      streak: 0,
      completedDays: [false, false, false, false, false, false, false]
    };
    setHabits(prev => [...prev, item]);
    setNewHabitName('');
  };

  const handleToggleHabitDay = (habitId: string, dayIdx: number) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const nextCompleted = [...habit.completedDays];
        nextCompleted[dayIdx] = !nextCompleted[dayIdx];
        
        let currentStreak = 0;
        for (let i = 6; i >= 0; i--) {
          if (nextCompleted[i]) {
            currentStreak++;
          } else {
            if (currentStreak > 0) break;
          }
        }

        return {
          ...habit,
          completedDays: nextCompleted,
          streak: currentStreak
        };
      }
      return habit;
    }));
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  // --- Context Reminder Add/Delete Handlers ---
  const handleAddContextReminder = () => {
    if (!newContextText.trim()) return;
    const item = {
      id: `cr-${Date.now()}`,
      text: newContextText.trim(),
      triggerLocation: newContextLoc,
      triggerMode: newContextMode,
      isTriggered: false
    };
    setContextReminders(prev => [...prev, item]);
    setNewContextText('');
  };

  const handleResetContextReminder = (id: string) => {
    setContextReminders(prev => prev.map(item => 
      item.id === id ? { ...item, isTriggered: false } : item
    ));
  };

  const handleDeleteContextReminder = (id: string) => {
    setContextReminders(prev => prev.filter(item => item.id !== id));
  };

  // Cross-Platform Cloud Sync Actions
  const handleSaveSyncCode = async () => {
    setSyncStatus('loading');
    const statePayload = {
      tasks,
      calendarEvents,
      scratchpad,
      focusBlocks,
      streak,
      focusScore,
      completedBlocksCount,
      proactiveInsight,
      criticalRecommendations,
      dailyStreakTip
    };

    try {
      const response = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: statePayload })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setSyncCode(data.code);
      setSyncStatus('success');
    } catch (e) {
      setSyncStatus('error');
      setSyncErrorMessage('Failed to generate sync code. Using fallback local code.');
      // Local fallback code
      const localCode = 'LUM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      setSyncCode(localCode);
      setSyncStatus('success');
    }
  };

  const handleLoadSyncCode = async () => {
    if (!inputSyncCode.trim()) return;
    setSyncStatus('loading');

    try {
      const response = await fetch(`/api/sync/load/${inputSyncCode.trim()}`);
      if (!response.ok) {
        throw new Error('Code not found or expired');
      }

      const data = await response.json();
      if (data.data) {
        const loaded = data.data;
        if (loaded.tasks) setTasks(loaded.tasks);
        if (loaded.calendarEvents) setCalendarEvents(loaded.calendarEvents);
        if (loaded.scratchpad !== undefined) setScratchpad(loaded.scratchpad);
        if (loaded.focusBlocks) setFocusBlocks(loaded.focusBlocks);
        if (loaded.streak !== undefined) setStreak(loaded.streak);
        if (loaded.focusScore !== undefined) setFocusScore(loaded.focusScore);
        if (loaded.completedBlocksCount !== undefined) setCompletedBlocksCount(loaded.completedBlocksCount);
        if (loaded.proactiveInsight) setProactiveInsight(loaded.proactiveInsight);
        if (loaded.criticalRecommendations) setCriticalRecommendations(loaded.criticalRecommendations);
        if (loaded.dailyStreakTip) setDailyStreakTip(loaded.dailyStreakTip);

        setSyncStatus('success');
        setTimeout(() => {
          setIsSyncModalOpen(false);
          setSyncStatus('idle');
          setInputSyncCode('');
        }, 1500);
      }
    } catch (e: any) {
      setSyncStatus('error');
      setSyncErrorMessage(e.message || 'Invalid sync code');
    }
  };

  // Task inline interactions
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          // Increment productivity stats
          setFocusScore(s => Math.min(s + 2, 100));
        } else {
          setFocusScore(s => Math.max(s - 2, 10));
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const added: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: newTaskDuration,
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      notes: newTaskNotes
    };

    setTasks(prev => [added, ...prev]);
    setNewTaskTitle('');
    setNewTaskNotes('');
    setNewTaskDuration(30);
  };

  // Calendar inline interactions
  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const added: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      startTime: newEventStart,
      endTime: newEventEnd,
      color: newEventColor
    };

    setCalendarEvents(prev => [...prev, added].sort((a,b) => a.startTime.localeCompare(b.startTime)));
    setIsAddEventOpen(false);
    setNewEventTitle('');
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  };

  // Format helper for display countdown
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="lumina-root" className="w-full min-h-screen bg-neutral-950 text-neutral-200 font-sans p-4 md:p-6 lg:p-8 overflow-y-auto flex flex-col gap-6 selection:bg-indigo-600/30 selection:text-white">
      
      {/* Top Header Area */}
      <header id="header-section" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            {/* Pulsating background aura to give a majestic visual effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative flex items-center gap-4 bg-neutral-900/90 border border-neutral-800 p-3 rounded-2xl">
              <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 relative overflow-hidden shrink-0">
                <Brain className="w-5.5 h-5.5 text-white animate-pulse relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-250 to-neutral-400 bg-clip-text text-transparent select-none">
                    Remind
                  </h1>
                  <span className="px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/30 rounded text-[7.5px] font-mono font-bold text-indigo-300 tracking-wider uppercase">Live</span>
                </div>
                {/* Under the header name put a sign of AI */}
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    ✦ Autonomous AI
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 text-xs">
            <button 
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-2 text-neutral-400 hover:text-indigo-400 transition-colors"
              title="Configure cross-platform sync"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute"></span>
              <span className="font-bold uppercase tracking-wider text-[10px]">Cloud Sync Active</span>
              <Link2 className="w-3.5 h-3.5 ml-1" />
            </button>
            <div className="w-px h-4 bg-neutral-800"></div>
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white border border-neutral-900">K</div>
              <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[8px] font-bold text-white border border-neutral-900">AI</div>
            </div>
          </div>

          <button 
            onClick={getAISuggestions}
            disabled={isSuggesting}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 text-white rounded-full font-bold text-xs transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
          >
            {isSuggesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Optimize Schedule
              </>
            )}
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <main id="bento-grid" className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
        
        {/* Left Column Stack (Hero Recommendation & Chat) */}
        <section className="col-span-1 md:col-span-8 flex flex-col gap-4 lg:gap-6">
          
          {/* Hero AI Suggestion Card */}
          <div id="ai-suggestion-card" className="bg-gradient-to-br from-indigo-950/30 via-neutral-900/90 to-neutral-950 border border-indigo-500/25 rounded-3xl p-6 lg:p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
            {/* Absolute visual background decorations */}
            <div className="absolute top-0 right-0 p-4 opacity-15">
              <Brain className="w-48 h-48 text-indigo-500" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start gap-4">
                <span className="px-3 py-1 bg-indigo-500/15 text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-wider border border-indigo-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Proactive Suggestion
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  Refreshed {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Focus Window title */}
              {focusBlocks.length > 0 ? (
                <div className="mt-5">
                  <h2 className="text-3xl lg:text-4xl font-light text-white leading-tight">
                    Your optimal focus window is <span className="text-indigo-400 font-semibold italic">now</span>.
                  </h2>
                  <p className="text-neutral-400 mt-3 max-w-xl text-base leading-relaxed">
                    {proactiveInsight}
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <h2 className="text-3xl lg:text-4xl font-light text-white leading-tight">
                    Your schedule is currently <span className="text-indigo-400 font-semibold italic">fully clear</span>.
                  </h2>
                  <p className="text-neutral-400 mt-3 max-w-xl text-base leading-relaxed">
                    Add new tasks in the Critical Path or type some goals in the scratchpad to let the AI construct custom slots.
                  </p>
                </div>
              )}
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap gap-4 items-center">
              {focusBlocks.map((block, idx) => (
                <button
                  key={idx}
                  onClick={() => startSpecificFocusBlock(block.duration, block.title)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  <Play className="w-4.5 h-4.5 fill-current" />
                  Start {block.title} ({block.duration}m)
                </button>
              ))}

              <div className="text-xs text-neutral-500 font-mono flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Streak: <strong className="text-white">{streak} days</strong> focus</span>
              </div>
            </div>
          </div>

          {/* AI Companion Conversational Coach Card */}
          <div id="ai-coach-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col h-[320px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                remind with AI Coach
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-2 pr-1 font-sans text-sm scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.sender === 'user' 
                      ? 'bg-neutral-800 ml-auto text-neutral-100 border border-neutral-750' 
                      : 'bg-neutral-950/70 border border-neutral-850 mr-auto text-neutral-350'
                  }`}
                >
                  <span className="text-[10px] font-bold block mb-1 text-indigo-400 uppercase tracking-wider">
                    {msg.sender === 'user' ? 'You' : 'remind with AI Coach'}
                  </span>
                  <p className="leading-relaxed whitespace-pre-line">
                    {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                  </p>
                </div>
              ))}
              {isChatLoading && (
                <div className="bg-neutral-950/70 border border-neutral-850 rounded-2xl p-3 mr-auto text-neutral-400 max-w-[85%] animate-pulse">
                  <span className="text-[10px] font-bold block mb-1 text-indigo-400 uppercase">remind with AI Coach</span>
                  <div className="flex gap-1 items-center mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Message input */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI or click Mic to speak..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              
              {/* Speech Synthesis Speaker Toggle */}
              <button
                type="button"
                onClick={() => setVoiceFeedbackEnabled(!voiceFeedbackEnabled)}
                className={`p-2 rounded-xl border transition-all shrink-0 ${
                  voiceFeedbackEnabled 
                    ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/25' 
                    : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-400'
                }`}
                title={voiceFeedbackEnabled ? "Mute Voice Feedback" : "Unmute Voice Feedback"}
              >
                {voiceFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Speech Recognition Mic Toggle */}
              <button
                type="button"
                onClick={handleToggleVoiceRecognition}
                className={`p-2 rounded-xl border transition-all relative shrink-0 ${
                  isVoiceListening 
                    ? 'bg-rose-600/20 text-rose-400 border-rose-500/40 animate-pulse' 
                    : 'bg-neutral-950 text-indigo-400 border-neutral-800 hover:bg-neutral-900'
                }`}
                title={isVoiceListening ? "Listening... Click to cancel" : "Voice Dictate Command"}
              >
                {isVoiceListening ? (
                  <>
                    <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                    </span>
                    <MicOff className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/15"
              >
                Send
              </button>
            </form>
          </div>
        </section>

        {/* Right Column Stack (Schedule & Notepad) */}
        <section className="col-span-1 md:col-span-4 flex flex-col gap-4 lg:gap-6">
          
          {/* Calendar Card */}
          <div id="calendar-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                Schedule
              </h3>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleAISmartSchedule}
                  disabled={isSuggesting}
                  className="p-1 hover:bg-neutral-800 rounded-lg text-emerald-400 hover:text-emerald-350 transition-colors flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide"
                  title="Generate optimal daily focus blocks via AI"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> AI Schedule
                </button>
                <div className="w-px h-3 bg-neutral-850"></div>
                <button 
                  onClick={() => setIsAddEventOpen(true)}
                  className="p-1 hover:bg-neutral-800 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 text-[10px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Book Slot
                </button>
              </div>
            </div>

            {/* Interactive daily schedule container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {/* Timeline slot rendering */}
              <div className="space-y-3 relative">
                {calendarEvents.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic text-center py-8">No scheduled items. Book a slot above.</p>
                ) : (
                  calendarEvents.map((event) => {
                    const isFocus = event.color === 'indigo';
                    return (
                      <div key={event.id} className="relative group">
                        <div className="flex gap-3 items-center mb-1 text-[10px] font-mono text-neutral-500">
                          <span>{event.startTime} - {event.endTime}</span>
                          <div className="flex-1 h-px bg-neutral-800 group-hover:bg-neutral-700 transition-colors"></div>
                        </div>
                        <div className={`p-3 rounded-xl border relative ${
                          event.color === 'indigo' ? 'bg-indigo-600/10 border-indigo-500/25 border-l-4 border-l-indigo-400 text-indigo-300' :
                          event.color === 'rose' ? 'bg-rose-600/10 border-rose-500/25 border-l-4 border-l-rose-400 text-rose-300' :
                          event.color === 'amber' ? 'bg-amber-600/10 border-amber-500/25 border-l-4 border-l-amber-400 text-amber-300' :
                          event.color === 'emerald' ? 'bg-emerald-600/10 border-emerald-500/25 border-l-4 border-l-emerald-400 text-emerald-300' :
                          'bg-neutral-800/40 border-neutral-700/60 border-l-4 border-l-neutral-450 text-neutral-300'
                        }`}>
                          <button
                            onClick={() => handleDeleteCalendarEvent(event.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-800/60 rounded text-neutral-400 hover:text-rose-400 transition-all"
                            title="Delete slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <p className="text-xs font-bold">{event.title}</p>
                          {event.subtitle && <p className="text-[10px] opacity-70 mt-0.5">{event.subtitle}</p>}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* AI Suggestions Overlay */}
                {focusBlocks.map((block, idx) => (
                  <div key={`s-${idx}`} className="relative group opacity-85">
                    <div className="flex gap-3 items-center mb-1 text-[10px] font-mono text-indigo-400">
                      <span>{block.timeSlot}</span>
                      <div className="flex-1 h-px bg-indigo-500/25"></div>
                    </div>
                    <div className="bg-indigo-600/10 border-l-4 border-l-indigo-500 border border-indigo-500/20 p-3 rounded-r-xl">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded uppercase tracking-wider font-bold">AI Slot</span>
                      </div>
                      <p className="text-xs font-bold text-white italic mt-1">{block.title}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{block.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Notepad / Scratchpad Card */}
          <div id="scratchpad-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col h-[260px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Notepad
              </h3>
              
              <button
                onClick={extractTasksFromScratchpad}
                disabled={isExtracting}
                className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 text-[10px] hover:bg-indigo-500/25 active:scale-95 text-indigo-300 rounded-lg transition-all font-bold flex items-center gap-1"
                title="Extract bullet tasks from scratchpad to Task list"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Brain className="w-3 h-3" />
                    Extract Tasks
                  </>
                )}
              </button>
            </div>

            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              placeholder="Write raw bullet lists or drafts here... AI will extract tasks from it!"
              className="flex-1 font-mono text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-850/60 focus:outline-none focus:border-indigo-500/60 resize-none"
            />
            {extractionSuccess && (
              <div className="text-[10px] text-emerald-400 font-semibold mt-1 text-center animate-bounce">
                ✓ Tasks extracted and added to critical path!
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Row Bento Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 mt-2">
        
        {/* Priority Matrix / Critical Path Task List */}
        <div id="critical-path-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-8 flex flex-col min-h-[300px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Critical Path & Reminders
              </h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Tasks synchronized in order of real-time deadlines</p>
            </div>

            {/* Inline Fast Add */}
            <form onSubmit={handleAddTask} className="w-full sm:w-auto flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={handleAIPrioritize}
                disabled={isPrioritizing}
                className="px-3 py-1.5 bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 active:scale-95 disabled:bg-neutral-850 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
                title="Intelligently prioritize tasks based on deadlines and urgency"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                {isPrioritizing ? 'Analyzing...' : 'AI Prioritize'}
              </button>

              <input
                type="text"
                placeholder="Add urgent goal..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-850 text-neutral-400 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
              >
                <option value="high">🔥 High</option>
                <option value="medium">⚡ Mid</option>
                <option value="low">💤 Low</option>
              </select>
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            {tasks.length === 0 ? (
              <p className="col-span-2 text-xs text-neutral-500 italic text-center py-12">No active tasks. Write some above!</p>
            ) : (
              tasks.map((task) => {
                const isUrgent = task.priority === 'high';
                return (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                      task.completed ? 'bg-neutral-950/40 border-neutral-850/60 opacity-60' :
                      isUrgent ? 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_12px_rgba(239,68,68,0.02)]' :
                      task.priority === 'medium' ? 'bg-indigo-500/5 border-indigo-500/10' :
                      'bg-neutral-800/20 border-neutral-800/80'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="p-1 text-neutral-500 hover:text-indigo-400 transition-colors"
                      title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4.5 h-4.5 text-indigo-400" />
                      ) : (
                        <Square className="w-4.5 h-4.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-bold leading-tight truncate ${task.completed ? 'line-through text-neutral-500' : 'text-white'}`}>
                          {task.title}
                        </p>
                        {isUrgent && !task.completed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
                        )}
                      </div>
                      
                      {task.notes && (
                        <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug line-clamp-1">{task.notes}</p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          task.priority === 'medium' ? 'bg-indigo-500/20 text-indigo-400' :
                          'bg-neutral-800 text-neutral-400'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[9px] text-neutral-500 font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {task.duration}m
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-neutral-800/50 rounded text-neutral-600 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Productivity Score Trend */}
        <div id="productivity-trend-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  Productivity Score
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">Focus Score calculated weekly</p>
              </div>
              <span className="text-emerald-400 text-sm font-bold">+{completedBlocksCount * 3}%</span>
            </div>

            {/* Micro stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-850/50">
                <span className="text-[8px] text-neutral-500 uppercase block tracking-wider font-semibold">Streak</span>
                <span className="text-sm font-bold text-white">{streak} Days</span>
              </div>
              <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-850/50">
                <span className="text-[8px] text-neutral-500 uppercase block tracking-wider font-semibold">Focus Score</span>
                <span className="text-sm font-bold text-indigo-400">{focusScore} pts</span>
              </div>
              <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-850/50">
                <span className="text-[8px] text-neutral-500 uppercase block tracking-wider font-semibold">Blocks Done</span>
                <span className="text-sm font-bold text-emerald-400">{completedBlocksCount}</span>
              </div>
            </div>
          </div>

          {/* SVG Trend Graph */}
          <div className="mt-4 flex-1 flex flex-col justify-end">
            <div className="h-24 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* SVG Graph Fill */}
                <path 
                  d="M0 30 L0 18 Q15 10 30 22 T60 12 T90 5 L100 2 L100 30 Z" 
                  fill="url(#gradient)" 
                />
                {/* SVG Graph line */}
                <path 
                  d="M0 18 Q15 10 30 22 T60 12 T90 5 L100 2" 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
                {/* Visual score pulse */}
                <circle cx="100" cy="2" r="1.5" fill="#a5b4fc" className="animate-ping" />
                <circle cx="100" cy="2" r="1" fill="#4f46e5" />
              </svg>
            </div>
            <p className="text-[9px] text-neutral-500 text-center mt-2 font-mono">Weekly Focus Score Trend Output</p>
          </div>
        </div>

      </section>

      {/* Immersive Learning & Focus Tools */}
      <section id="pomo-flashcards-row" className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 mt-2">
        {/* Pomodoro Timer Bento Card */}
        <div id="pomodoro-timer-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-5 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                Pomodoro Focus
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-neutral-500 font-mono">Sessions:</span>
                <span className="text-xs font-bold text-rose-400 font-mono">{pomodoroSessionsCompleted}</span>
              </div>
            </div>

            {/* Mode tabs */}
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850 mb-4">
              <button
                onClick={() => handlePomodoroModeChange('work')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                  pomodoroMode === 'work' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' : 'text-neutral-500 hover:text-neutral-350'
                }`}
              >
                Focus (25m)
              </button>
              <button
                onClick={() => handlePomodoroModeChange('shortBreak')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                  pomodoroMode === 'shortBreak' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-neutral-500 hover:text-neutral-350'
                }`}
              >
                Break (5m)
              </button>
              <button
                onClick={() => handlePomodoroModeChange('longBreak')}
                className={`py-1 text-[10px] font-bold rounded-lg transition-all ${
                  pomodoroMode === 'longBreak' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-neutral-500 hover:text-neutral-350'
                }`}
              >
                Long (15m)
              </button>
            </div>

            {/* Display digits with nice circular SVG behind it */}
            <div className="flex flex-col items-center justify-center py-4 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className={`w-36 h-36 rounded-full border-4 ${
                  pomodoroMode === 'work' ? 'border-rose-500 animate-ping' :
                  pomodoroMode === 'shortBreak' ? 'border-emerald-500' : 'border-indigo-500'
                }`} />
              </div>
              <h2 className="text-5xl font-mono font-bold tracking-widest text-white z-10 select-none">
                {formatTime(pomodoroTimeLeft)}
              </h2>
              <p className="text-[9px] text-neutral-500 font-mono mt-1 z-10 uppercase tracking-widest">
                {pomodoroMode === 'work' ? '⚡ deep concentration' : '💤 recharging mind'}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-4 flex flex-col gap-3">
            {/* Auto start synth config */}
            <div className="flex items-center justify-between bg-neutral-950/40 border border-neutral-850 px-3.5 py-2 rounded-xl">
              <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-indigo-400" />
                Play soundscapes during focus
              </span>
              <input
                type="checkbox"
                checked={autoPlaySynthOnPomo}
                onChange={(e) => setAutoPlaySynthOnPomo(e.target.checked)}
                className="accent-rose-500 cursor-pointer w-4 h-4"
              />
            </div>

            {/* Timer Actions */}
            <div className="flex gap-2.5">
              <button
                onClick={handleTogglePomodoro}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  isPomodoroRunning 
                    ? 'bg-neutral-800 text-white border border-neutral-750 hover:bg-neutral-750' 
                    : pomodoroMode === 'work' 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPomodoroRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPomodoroRunning ? 'Pause' : 'Start Timer'}
              </button>
              <button
                onClick={handleResetPomodoro}
                className="px-3.5 py-2.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-white transition-all flex items-center justify-center"
                title="Reset Pomodoro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI-Powered Study Flashcards Bento Card */}
        <div id="ai-flashcards-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-7 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Study Flashcards
              </h3>

              <div className="flex gap-1.5">
                <button
                  onClick={handleAIGenerateFlashcards}
                  disabled={isGeneratingCards}
                  className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 hover:bg-indigo-500/25 text-[9px] text-indigo-300 font-bold rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                  title="Generate study cards from Notepad text"
                >
                  {isGeneratingCards ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Drafting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                      AI Generate
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowCardCreator(!showCardCreator)}
                  className="p-1 text-[10px] font-bold text-neutral-400 hover:text-white flex items-center gap-1 rounded hover:bg-neutral-850 transition-all"
                >
                  <Plus className="w-3 h-3" /> Manual
                </button>
              </div>
            </div>

            {/* Main Stage: Create form or Flashcard display */}
            {showCardCreator ? (
              <form onSubmit={handleCreateFlashcardManually} className="flex-1 bg-neutral-950 p-4 rounded-2xl border border-neutral-850 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Create New Flashcard</span>
                  <button type="button" onClick={() => setShowCardCreator(false)} className="text-neutral-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={newCardQuestion}
                    onChange={(e) => setNewCardQuestion(e.target.value)}
                    placeholder="Question (e.g. What is latency?)"
                    required
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <textarea
                    value={newCardAnswer}
                    onChange={(e) => setNewCardAnswer(e.target.value)}
                    placeholder="Concise answer..."
                    required
                    rows={2}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 text-white resize-none"
                  />
                </div>
                <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all mt-1">
                  Save Card
                </button>
              </form>
            ) : flashcards.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-neutral-950 p-4 rounded-2xl border border-neutral-850 text-center">
                <p className="text-xs text-neutral-500 italic">No study flashcards. Click Manual or write notes in Notepad and click AI Generate!</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                {/* Active card container */}
                <div 
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className={`flex-1 min-h-[140px] bg-neutral-950 rounded-2xl border p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 relative select-none ${
                    isCardFlipped ? 'border-indigo-500/30 bg-indigo-950/5 shadow-[0_0_15px_rgba(99,102,241,0.03)]' : 'border-neutral-850 hover:border-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-center text-[8px] font-mono tracking-wider text-neutral-500">
                    <span className="uppercase">{isCardFlipped ? '💡 Explanation' : '❓ Concept'}</span>
                    <span>Card {currentFlashcardIndex + 1} of {flashcards.length}</span>
                  </div>

                  {/* Question/Answer Text */}
                  <div className="my-auto py-3 text-center">
                    {isCardFlipped ? (
                      <p className="text-sm text-neutral-200 leading-relaxed font-sans">{flashcards[currentFlashcardIndex].answer}</p>
                    ) : (
                      <h4 className="text-base font-semibold text-white tracking-tight leading-snug">{flashcards[currentFlashcardIndex].question}</h4>
                    )}
                  </div>

                  <div className="text-center text-[9px] text-neutral-500 uppercase tracking-widest font-bold">
                    {isCardFlipped ? 'Click to flip back' : 'Click card to reveal answer'}
                  </div>
                </div>

                {/* Card controllers */}
                <div className="mt-3 flex justify-between items-center gap-4">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setIsCardFlipped(false);
                        setCurrentFlashcardIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
                      }}
                      className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-850 rounded-xl text-xs text-neutral-400 hover:text-white transition-all font-semibold"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => {
                        setIsCardFlipped(false);
                        setCurrentFlashcardIndex(prev => (prev + 1) % flashcards.length);
                      }}
                      className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-850 hover:bg-neutral-850 rounded-xl text-xs text-neutral-400 hover:text-white transition-all font-semibold"
                    >
                      Next →
                    </button>
                  </div>

                  <div className="flex gap-1.5 items-center">
                    <button
                      onClick={() => handleDeleteFlashcard(flashcards[currentFlashcardIndex].id)}
                      className="p-2 bg-neutral-950/50 border border-neutral-850 text-neutral-500 hover:text-rose-400 rounded-xl transition-all"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleMarkCardMastered}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-indigo-600/10"
                    >
                      <Check className="w-3.5 h-3.5" /> Know It (+2)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Premium AI Productivity Extensions */}
      <section id="premium-ai-extensions" className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 mt-2">
        
        {/* Autonomous Planning Agent */}
        <div id="autonomous-planner-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
                Autonomous Agent Planner
              </h3>
              <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[8px] font-mono text-purple-300 rounded uppercase font-bold tracking-wider">Agent Engine</span>
            </div>
            <p className="text-[10px] text-neutral-500 mb-4">Input an objective to let the AI agent decompose, prioritize and queue a multi-step task sequence automatically.</p>

            {isPlanning ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-20"></span>
                  <RefreshCw className="w-7 h-7 text-purple-400 animate-spin" />
                </div>
                <div className="space-y-1.5 mt-2">
                  <p className="text-xs font-bold text-white transition-all">
                    {planningSteps[planningStepIndex] || "Planning..."}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">Agent status: active execution</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={plannerGoalInput}
                    onChange={(e) => setPlannerGoalInput(e.target.value)}
                    placeholder="e.g. Build a TypeScript server prototype"
                    className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleExecuteAutonomousPlanner}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/10 flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" /> Plan Goal
                  </button>
                </div>

                {plannerResults.length > 0 && (
                  <div className="bg-neutral-950/65 border border-neutral-850 p-3 rounded-2xl max-h-[160px] overflow-y-auto scrollbar-thin">
                    <span className="text-[8px] uppercase tracking-wider font-bold text-purple-400 block mb-2">Planned Action Steps</span>
                    <div className="space-y-1.5">
                      {plannerResults.map((step, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] border-b border-neutral-850/40 pb-1 last:border-0 last:pb-0">
                          <span className="text-neutral-300 font-medium truncate max-w-[180px]">{idx + 1}. {step.taskName}</span>
                          <div className="flex gap-1.5 items-center">
                            <span className="px-1 bg-purple-500/10 text-purple-300 text-[8px] rounded uppercase font-bold">{step.category}</span>
                            <span className="text-neutral-500 font-mono text-[9px]">{step.durationMinutes}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-850/50 pt-3 mt-3 text-[9px] text-neutral-500 leading-relaxed font-sans">
            🤖 The agent auto-injects decomposed sub-tasks with calculated importance weights directly into your <strong>Critical Path & Reminders</strong> task board.
          </div>
        </div>

        {/* Goal & Habit Tracker */}
        <div id="habit-tracker-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-6 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Goal & Habit Tracking
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-mono text-emerald-300 rounded uppercase font-bold tracking-wider">Weekly Streak</span>
            </div>
            <p className="text-[10px] text-neutral-500 mb-4">Establish custom daily habits. Check off completions to maintain your streak and score focus multipliers.</p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Create new habit (e.g. Read 15m)..."
                  className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAddHabit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                {habits.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic text-center py-6">No habits tracked yet. Start something today!</p>
                ) : (
                  habits.map((habit) => (
                    <div key={habit.id} className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850/50 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{habit.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-amber-500 flex items-center gap-0.5">
                            <Flame className="w-3.5 h-3.5" /> {habit.streak}d
                          </span>
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="p-1 hover:bg-neutral-850 rounded text-neutral-500 hover:text-rose-400 transition-all"
                            title="Delete habit"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* 7-day checkboxes */}
                      <div className="grid grid-cols-7 gap-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleToggleHabitDay(habit.id, idx)}
                            className={`py-1 rounded text-[8px] font-mono font-bold transition-all border ${
                              habit.completedDays[idx] 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' 
                                : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-700'
                            }`}
                            title={`Toggle completion for ${day}`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-850/50 pt-3 mt-3 text-[9px] text-neutral-500 leading-relaxed font-sans">
            🚀 Streak counts are evaluated dynamically. Completing consecutive days updates your focal multiplier.
          </div>
        </div>

      </section>

      {/* Context-Aware Reminders Simulator & AI Recommendations */}
      <section id="context-recs-row" className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 mt-2">
        
        {/* Context-Aware Reminders Simulator */}
        <div id="context-simulator-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-7 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                Context-Aware Reminders
              </h3>
              <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[8px] font-mono text-rose-300 rounded uppercase font-bold tracking-wider">Context Trigger</span>
            </div>
            <p className="text-[10px] text-neutral-500 mb-3">Reminders that trigger ONLY when you match specific location or cognitive focus contexts. Use the simulator panel to test triggers!</p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              {/* Creator Column */}
              <div className="sm:col-span-6 space-y-2.5">
                <span className="text-[8px] uppercase tracking-wider font-bold text-rose-400 block">Add Context Goal</span>
                <input
                  type="text"
                  value={newContextText}
                  onChange={(e) => setNewContextText(e.target.value)}
                  placeholder="e.g. Do yoga stretch..."
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-neutral-500">Location</label>
                    <select
                      value={newContextLoc}
                      onChange={(e) => setNewContextLoc(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-850 text-neutral-300 rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Library">Library</option>
                      <option value="Gym">Gym</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-mono uppercase text-neutral-500">Focus Mode</label>
                    <select
                      value={newContextMode}
                      onChange={(e) => setNewContextMode(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-850 text-neutral-300 rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Focus Mode">Deep Focus</option>
                      <option value="Short Break">Short Break</option>
                      <option value="Long Break">Long Break</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAddContextReminder}
                  className="w-full py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-650/10"
                >
                  Create Context Goal
                </button>
              </div>

              {/* Simulator Column */}
              <div className="sm:col-span-6 bg-neutral-950/60 border border-neutral-850/80 p-3 rounded-2xl space-y-3">
                <span className="text-[8px] uppercase tracking-wider font-bold text-indigo-400 block">Simulation Panel</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                    <span className="text-[9px] text-neutral-400 font-mono font-medium">Virtual Location:</span>
                    <select
                      value={currentContextLocation}
                      onChange={(e) => setCurrentContextLocation(e.target.value as any)}
                      className="bg-neutral-950 text-white rounded px-1.5 py-0.5 text-[10px] focus:outline-none font-bold"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Library">Library</option>
                      <option value="Gym">Gym</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800">
                    <span className="text-[9px] text-neutral-400 font-mono font-medium">Focus Context:</span>
                    <select
                      value={currentContextFocusMode}
                      onChange={(e) => setCurrentContextFocusMode(e.target.value as any)}
                      className="bg-neutral-950 text-white rounded px-1.5 py-0.5 text-[10px] focus:outline-none font-bold"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Focus Mode">Deep Focus</option>
                      <option value="Short Break">Short Break</option>
                      <option value="Long Break">Long Break</option>
                    </select>
                  </div>
                </div>

                {/* Display list */}
                <div className="max-h-[100px] overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
                  {contextReminders.length === 0 ? (
                    <p className="text-[9px] text-neutral-600 italic text-center py-4">No context reminders set.</p>
                  ) : (
                    contextReminders.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-[9px] bg-neutral-900/60 p-1.5 rounded-lg border border-neutral-850/40">
                        <span className={`truncate max-w-[120px] ${item.isTriggered ? 'line-through text-neutral-600' : 'text-neutral-300'}`}>
                          {item.text}
                        </span>
                        <div className="flex gap-1 items-center">
                          {item.isTriggered ? (
                            <button
                              onClick={() => handleResetContextReminder(item.id)}
                              className="px-1 py-0.2 bg-emerald-500/10 text-emerald-400 text-[7.5px] font-bold rounded hover:bg-emerald-500/20"
                              title="Reset state"
                            >
                              Reset
                            </button>
                          ) : (
                            <span className="text-[7.5px] px-1 bg-amber-500/10 text-amber-400 font-bold rounded uppercase">
                              {item.triggerLocation} • {item.triggerMode === 'Focus Mode' ? 'Focus' : item.triggerMode}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteContextReminder(item.id)}
                            className="p-0.5 hover:bg-neutral-850 rounded text-neutral-500 hover:text-rose-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="border-t border-neutral-850/50 pt-3 mt-3 text-[9px] text-neutral-500 leading-relaxed font-sans">
            ⏰ Change Location/Focus Mode in the simulation panel to trigger. Matches auto-alert and voice dictate!
          </div>
        </div>

        {/* Personalized AI Recommendations */}
        <div id="ai-recommendations-card" className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:col-span-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                AI Recommendations
              </h3>
              <button
                onClick={handleAIGenerateRecs}
                disabled={isGeneratingRecs}
                className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-mono text-indigo-300 rounded uppercase font-bold tracking-wider hover:bg-indigo-500/20"
              >
                {isGeneratingRecs ? 'Recalculating...' : 'Refresh'}
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 mb-3">High-level recommendations computed based on calendar depth, focused streaks, and study logs.</p>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-thin">
              {aiRecsList.map((rec, idx) => {
                const isUrgent = rec.impact === 'critical';
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-2xl border transition-all ${
                      isUrgent 
                        ? 'bg-rose-500/5 border-rose-500/25' 
                        : rec.impact === 'high' 
                          ? 'bg-indigo-500/5 border-indigo-500/20' 
                          : 'bg-neutral-950/60 border-neutral-850/80'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black uppercase text-white truncate max-w-[150px]">{rec.area}</span>
                      <span className={`text-[7.5px] px-1 py-0.2 rounded font-mono uppercase font-bold ${
                        isUrgent ? 'bg-rose-500/15 text-rose-400' :
                        rec.impact === 'high' ? 'bg-indigo-500/15 text-indigo-400' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {rec.impact} impact
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal font-sans">{rec.advice}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-neutral-850/50 pt-3 mt-3 text-[9px] text-neutral-500 leading-relaxed font-sans">
            🧠 Refreshes dynamically using prompt context grounding in recent task structures.
          </div>
        </div>

      </section>

      {/* Immersive Fullscreen Focus Mode Overlay */}
      {isFocusModeActive && (
        <div id="focus-overlay" className="fixed inset-0 bg-neutral-950/98 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
          
          {/* Header row */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="font-bold tracking-wider text-xs uppercase text-neutral-400">Deep Work Session</span>
            </div>
            <button
              onClick={() => {
                synthRef.current?.stop();
                setIsFocusModeActive(false);
                setIsTimerRunning(false);
                setSelectedSound('none');
              }}
              className="p-2 hover:bg-neutral-900 rounded-full border border-neutral-800 hover:text-white transition-colors"
              title="Quit Focus Session"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          <div className="w-full max-w-xl flex flex-col items-center gap-8">
            
            {/* Ambient Breathing Guide Circle */}
            {breathingGuideEnabled && (
              <div className="flex flex-col items-center">
                <div className={`w-36 h-36 rounded-full border border-indigo-500/20 flex items-center justify-center transition-all duration-[4000ms] ${
                  breathingPhase === 'inhale' ? 'scale-150 bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_40px_rgba(99,102,241,0.2)]' :
                  breathingPhase === 'hold' ? 'scale-150 bg-purple-500/15 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.2)]' :
                  'scale-100 bg-neutral-900 border-neutral-800'
                }`}>
                  <Wind className="w-8 h-8 text-indigo-300 animate-spin-slow" />
                </div>
                <div className="mt-4">
                  <p className="text-indigo-300 font-bold tracking-widest uppercase text-xs">
                    {breathingPhase === 'inhale' && 'Inhale...'}
                    {breathingPhase === 'hold' && 'Hold...'}
                    {breathingPhase === 'exhale' && 'Exhale...'}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{breathingSecs}s remaining</p>
                </div>
              </div>
            )}

            {/* Core Circular Countdown Clock */}
            <div>
              <h2 className="text-7xl md:text-8xl font-mono text-white tracking-widest font-bold">
                {formatTime(focusTimeLeft)}
              </h2>
              <p className="text-xs text-neutral-500 mt-2 font-mono uppercase tracking-widest">
                Target block focus time slot ({Math.floor(focusTimeTotal / 60)}m)
              </p>
            </div>

            {/* Audio soundscape controls */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 w-full">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-indigo-400" />
                  Offline Focus Synth Soundscape
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSoundChange('none')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      selectedSound === 'none' ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-500'
                    }`}
                  >
                    Mute
                  </button>
                  <button
                    onClick={() => handleSoundChange('rain')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      selectedSound === 'rain' ? 'bg-indigo-600 text-white' : 'text-neutral-400 bg-neutral-950 hover:bg-neutral-800'
                    }`}
                  >
                    🌧️ Rain
                  </button>
                  <button
                    onClick={() => handleSoundChange('deep')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      selectedSound === 'deep' ? 'bg-indigo-600 text-white' : 'text-neutral-400 bg-neutral-950 hover:bg-neutral-800'
                    }`}
                  >
                    ⚡ Hum
                  </button>
                  <button
                    onClick={() => handleSoundChange('zen')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      selectedSound === 'zen' ? 'bg-indigo-600 text-white' : 'text-neutral-400 bg-neutral-950 hover:bg-neutral-800'
                    }`}
                  >
                    🧘 Zen Wave
                  </button>
                </div>
              </div>

              {/* Volume Slider */}
              {selectedSound !== 'none' && (
                <div className="flex items-center gap-3 mt-2">
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-500 h-1 bg-neutral-950 rounded-lg appearance-none cursor-pointer"
                  />
                  <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              )}
            </div>

            {/* Session Timer controllers */}
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  isTimerRunning ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-750' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isTimerRunning ? 'Pause Session' : 'Resume Session'}
              </button>

              <button
                onClick={() => setFocusTimeLeft(focusTimeTotal)}
                className="px-4 py-3 bg-neutral-950 border border-neutral-850 hover:bg-neutral-900 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold"
                title="Reset timer"
              >
                Reset Timer
              </button>

              <button
                onClick={() => setBreathingGuideEnabled(!breathingGuideEnabled)}
                className={`px-3 py-3 rounded-xl text-xs font-semibold ${
                  breathingGuideEnabled ? 'bg-indigo-500/20 text-indigo-300' : 'bg-neutral-950 text-neutral-500'
                }`}
              >
                Guide: {breathingGuideEnabled ? 'On' : 'Off'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cross Platform Cloud Sync Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                Cross-Platform Cloud Sync
              </h3>
              <button 
                onClick={() => {
                  setIsSyncModalOpen(false);
                  setSyncStatus('idle');
                }}
                className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Transfer your exact Bento schedule, tasks, notepad drafts, and progress stats across browsers or devices instantly using secure sync hashes.
            </p>

            {/* Sync node export */}
            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-850 flex flex-col gap-2">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-500">Device Back-Up Code</span>
              <div className="flex justify-between items-center">
                {syncCode ? (
                  <strong className="text-lg font-mono text-indigo-400 tracking-wider bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/20">{syncCode}</strong>
                ) : (
                  <span className="text-xs text-neutral-500 italic">No cloud sync code active</span>
                )}
                
                <button
                  onClick={handleSaveSyncCode}
                  disabled={syncStatus === 'loading'}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-850 rounded-xl text-white text-xs font-bold transition-all"
                >
                  Generate Code
                </button>
              </div>
              <p className="text-[9px] text-neutral-500 mt-1">Copy this 6-digit code and paste it on any other browser tab to load your exact state.</p>
            </div>

            {/* Sync node import */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-500">Load Existing Device State</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit hash..."
                  value={inputSyncCode}
                  onChange={(e) => setInputSyncCode(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 uppercase"
                />
                <button
                  onClick={handleLoadSyncCode}
                  disabled={syncStatus === 'loading'}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 rounded-xl text-white text-xs font-bold border border-neutral-750 transition-all"
                >
                  Sync Load
                </button>
              </div>
            </div>

            {/* Status indicators */}
            {syncStatus === 'loading' && (
              <div className="text-xs text-indigo-400 text-center animate-pulse flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Transmitting data...
              </div>
            )}
            {syncStatus === 'success' && !syncCode && (
              <div className="text-xs text-emerald-400 text-center">
                ✓ State loaded and synchronized successfully!
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="text-xs text-rose-400 text-center">
                ⚠ {syncErrorMessage || 'Synchronization failed'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book Calendar Slot Dialog */}
      {isAddEventOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddCalendarEvent} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full flex flex-col gap-4 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <CalendarDays className="w-4.5 h-4.5 text-indigo-400" />
                Book Schedule Slot
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Event Title</label>
              <input
                type="text"
                placeholder="Standup, Focus Block, Sprint Planning..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                required
                className="bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Start Time</label>
                <input
                  type="time"
                  value={newEventStart}
                  onChange={(e) => setNewEventStart(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">End Time</label>
                <input
                  type="time"
                  value={newEventEnd}
                  onChange={(e) => setNewEventEnd(e.target.value)}
                  className="bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Theme Color Accent</label>
              <div className="flex gap-2">
                {['indigo', 'emerald', 'rose', 'amber', 'neutral'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewEventColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      c === 'indigo' ? 'bg-indigo-500' :
                      c === 'emerald' ? 'bg-emerald-500' :
                      c === 'rose' ? 'bg-rose-500' :
                      c === 'amber' ? 'bg-amber-500' :
                      'bg-neutral-600'
                    } ${newEventColor === c ? 'border-white scale-110 shadow-lg shadow-white/10' : 'border-transparent hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Allocate Slot
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

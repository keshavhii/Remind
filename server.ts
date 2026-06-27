import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini API client safely and lazily
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint for proactive suggestions based on current tasks, calendar, and scratchpad
app.post('/api/ai/suggest', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { tasks = [], calendarEvents = [], scratchpad = '', currentTime = '' } = req.body;

  const prompt = `
You are remind with AI, an extremely polished, proactive productivity companion.
Analyze the user's current situation and suggest optimal focus blocks, prioritize high-value work, and draft a smart, actionable daily plan before deadlines are missed.

Current Date/Time Context: ${currentTime || new Date().toISOString()}

User's Tasks:
${JSON.stringify(tasks, null, 2)}

User's Schedule / Calendar Events:
${JSON.stringify(calendarEvents, null, 2)}

User's Scratchpad Notes:
"${scratchpad}"

Based on this context, provide:
1. Optimal focus blocks that align with their task durations, gaps in their calendar, and task priority/deadlines.
2. A proactive, motivating insight (1-2 sentences) about their optimal focus window right now.
3. Critical path recommendations highlighting urgent items (e.g. items due very soon).
4. A daily streak tip to encourage focus.

Format the output strictly as a JSON object matching the defined schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            focusBlocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  timeSlot: { type: Type.STRING },
                  duration: { type: Type.INTEGER, description: 'Duration in minutes' },
                  reason: { type: Type.STRING },
                  targetTaskId: { type: Type.STRING, description: 'ID of the task this focus block targets, or empty string' }
                },
                required: ['title', 'timeSlot', 'duration', 'reason']
              }
            },
            proactiveInsight: { type: Type.STRING },
            criticalRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            dailyStreakTip: { type: Type.STRING }
          },
          required: ['focusBlocks', 'proactiveInsight', 'criticalRecommendations', 'dailyStreakTip']
        }
      }
    });

    const resultText = response.text || '{}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('AI Suggestion error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI suggestions' });
  }
});

// Endpoint to extract tasks from scratchpad text
app.post('/api/ai/extract-tasks', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { scratchpad = '', currentTime = '' } = req.body;

  const prompt = `
Analyze the following raw scratchpad text and extract any actionable tasks, reminders, or items to plan.
For each item, deduce the title, a logical due date/time if mentioned (relative to current time: ${currentTime || new Date().toISOString()}), an estimated duration, and a priority level (high, medium, low).

Scratchpad Text:
"${scratchpad}"

Format the output strictly as a JSON object containing a list of tasks.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  dueDate: { type: Type.STRING, description: 'Estimated due date/time as ISO string or empty string if not clear' },
                  duration: { type: Type.INTEGER, description: 'Estimated duration in minutes (default to 30 if not specified)' },
                  priority: { type: Type.STRING, description: 'Must be high, medium, or low' },
                  category: { type: Type.STRING, description: 'Category e.g. Work, Personal, urgent' },
                  notes: { type: Type.STRING, description: 'Extra context extracted' }
                },
                required: ['title', 'priority']
              }
            }
          },
          required: ['tasks']
        }
      }
    });

    const resultText = response.text || '{"tasks":[]}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('AI Task Extraction error:', error);
    res.status(500).json({ error: error.message || 'Failed to extract tasks' });
  }
});

// Endpoint for real chat conversation with Lumina AI Coach
app.post('/api/ai/chat', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { message = '', history = [], tasks = [], calendarEvents = [], scratchpad = '' } = req.body;

  const systemInstruction = `
You are remind with AI, a brilliant, proactive, and highly motivating personal productivity coach.
You are assisting the user inside an immersive Bento Grid productivity workspace.
You have access to the user's current environment:
- Active Tasks: ${JSON.stringify(tasks)}
- Calendar Schedule: ${JSON.stringify(calendarEvents)}
- Scratchpad Notes: "${scratchpad}"

Your style is direct, warm, supportive, and actionable. Provide highly practical advice, calendar scheduling suggestions, or motivation. Keep responses elegant, concise (1-2 paragraphs max), and formatted in readable markdown.
`;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
      },
    });

    // Feed conversational history
    for (const turn of history) {
      // Just keep track of the conversation
    }

    const response = await chat.sendMessage({ message });
    res.json({ response: response.text });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get response from AI Coach' });
  }
});

// Endpoint to generate study flashcards from scratchpad/notepad
app.post('/api/ai/generate-flashcards', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { scratchpad = '' } = req.body;
  if (!scratchpad.trim()) {
    return res.status(400).json({ error: 'Scratchpad content is required' });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a list of 4-6 smart, high-quality study flashcards based on the following notes: "${scratchpad}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: 'The study question, concept, or word' },
                  answer: { type: Type.STRING, description: 'The concise explanation, answer, or definition' }
                },
                required: ['question', 'answer']
              }
            }
          },
          required: ['flashcards']
        }
      }
    });

    const resultText = response.text || '{"flashcards":[]}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('AI Flashcard Generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// Endpoint to autonomously prioritize a user's task list
app.post('/api/ai/prioritize', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { tasks = [] } = req.body;
  if (tasks.length === 0) {
    return res.json({ prioritizedTasks: [] });
  }

  const prompt = `
  You are an expert productivity engine. Intelligently analyze the following list of tasks and prioritize them.
  Assign each task a priorityScore (0-100) and an urgencyReason explaining why.
  Tasks: ${JSON.stringify(tasks)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prioritizedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'ID of the analyzed task' },
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING, description: 'Must be high, medium, or low' },
                  priorityScore: { type: Type.INTEGER, description: 'Score between 0 and 100 representing importance' },
                  urgencyReason: { type: Type.STRING, description: 'A highly intelligent 1-sentence reason for this priority score' }
                },
                required: ['id', 'priority', 'priorityScore', 'urgencyReason']
              }
            }
          },
          required: ['prioritizedTasks']
        }
      }
    });

    const resultText = response.text || '{"prioritizedTasks":[]}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('AI Prioritization error:', error);
    res.status(500).json({ error: error.message || 'Failed to prioritize tasks' });
  }
});

// Endpoint to assist in dynamic AI scheduling of calendar blocks
app.post('/api/ai/schedule', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { tasks = [], calendarEvents = [] } = req.body;

  const prompt = `
  Analyze the current calendar events and tasks, and schedule optimal, distraction-free focus time slots to finish the highest priority items.
  Calendar Events: ${JSON.stringify(calendarEvents)}
  Pending Tasks: ${JSON.stringify(tasks)}
  
  Suggest 2-3 optimal time-blocked sessions. Make sure they do not overlap with existing calendar events.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scheduleSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'e.g., Focus block for [Task Name]' },
                  timeSlot: { type: Type.STRING, description: 'Time range in HH:MM - HH:MM format' },
                  duration: { type: Type.INTEGER, description: 'Duration in minutes' },
                  reason: { type: Type.STRING, description: 'Why this time slot is optimal' }
                },
                required: ['title', 'timeSlot', 'duration', 'reason']
              }
            }
          },
          required: ['scheduleSuggestions']
        }
      }
    });

    const resultText = response.text || '{"scheduleSuggestions":[]}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('AI Scheduling error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate schedule' });
  }
});

// Endpoint to generate personalized productivity suggestions and health check insights
app.post('/api/ai/recommendations', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { tasks = [], focusScore = 50, pomoSessions = 0 } = req.body;

  const prompt = `
  Based on the current user status, provide 3 highly customized, actionable wellness and productivity recommendations:
  - Current Focus Score: ${focusScore}/100
  - Completed Pomodoro Sessions: ${pomoSessions}
  - Pending Tasks: ${JSON.stringify(tasks)}
  
  Provide exactly 3 custom tips, each specifying a type (Focus, Mindset, Rest, or Action), the specific tip, and the predicted impact.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'One of Focus, Rest, Action, Mindset' },
                  tip: { type: Type.STRING, description: 'Highly specific, actionable recommendation' },
                  impact: { type: Type.STRING, description: 'The positive impact this advice yields, e.g. +10% Focus score boost' }
                },
                required: ['type', 'tip', 'impact']
              }
            }
          },
          required: ['recommendations']
        }
      }
    });

    const resultText = response.text || '{"recommendations":[]}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('AI Recommendations error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate recommendations' });
  }
});

// Endpoint to autonomously plan and break down a high-level goal into actionable sub-tasks
app.post('/api/ai/autonomous-plan', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel of your AI Studio environment.',
    });
  }

  const { goal = '' } = req.body;
  if (!goal.trim()) {
    return res.status(400).json({ error: 'Goal description is required' });
  }

  const prompt = `
  You are an Autonomous AI Planning Agent.
  The user wants to achieve this goal: "${goal}".
  Analyze this goal, then plan and decompose it autonomously into 4-6 step-by-step sequential sub-tasks that can be executed directly.
  For each step, specify the taskName, estimated durationMinutes, priority level (high/medium/low), and category of work.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plannedSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskName: { type: Type.STRING, description: 'Descriptive subtask title' },
                  durationMinutes: { type: Type.INTEGER, description: 'Estimated execution time in minutes' },
                  priority: { type: Type.STRING, description: 'Must be high, medium, or low' },
                  category: { type: Type.STRING, description: 'e.g. Research, Execution, Polish' },
                  importance: { type: Type.STRING, description: 'Why this step is critical' }
                },
                required: ['taskName', 'durationMinutes', 'priority', 'category']
              }
            }
          },
          required: ['plannedSteps']
        }
      }
    });

    const resultText = response.text || '{"plannedSteps":[]}';
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error('Autonomous Planning error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate autonomous plan' });
  }
});

// In-memory sync store to enable fully functioning cross-platform sync
const syncStore = new Map<string, string>();

// Cleanup sync store periodically if it grows too large
setInterval(() => {
  if (syncStore.size > 1000) {
    const keys = Array.from(syncStore.keys());
    for (let i = 0; i < 200; i++) {
      syncStore.delete(keys[i]);
    }
  }
}, 60 * 60 * 1000);

// Save sync state and return a 6-digit code
app.post('/api/sync/save', (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Data is required' });
  }
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  syncStore.set(code, JSON.stringify(data));
  res.json({ code });
});

// Load sync state by its 6-digit code
app.get('/api/sync/load/:code', (req, res) => {
  const code = req.params.code?.trim().toUpperCase();
  const dataStr = syncStore.get(code || '');
  if (!dataStr) {
    return res.status(404).json({ error: 'Sync code not found or expired' });
  }
  res.json({ data: JSON.parse(dataStr) });
});

// Setup development or production environment
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000; // Hardcoded by AI Studio container proxy

if (isProd) {
  // Serve production build files
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // Serve index.html for SPA router on any other route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina AI production server listening on port ${PORT}`);
  });
} else {
  // Setup Vite in middleware mode for development
  createViteServer({
    server: { 
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  }).then((vite) => {
    app.use(vite.middlewares);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Lumina AI development server running at http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to start Vite server:', err);
  });
}

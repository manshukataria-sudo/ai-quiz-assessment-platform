const { GoogleGenAI } = require('@google/genai');

// Candidate models in order of speed and current availability
const AVAILABLE_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  'gemini-3.7-flash'
];

/**
 * Service to interact with Google Gemini Generative AI Model
 */
class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      this.hasValidKey = true;
    } else {
      console.warn('[Gemini Service]: GEMINI_API_KEY is not set. Intelligent fallback mode enabled.');
      this.hasValidKey = false;
    }
  }

  /**
   * Generates a structured multiple-choice quiz using Gemini
   * @param {Object} params
   * @param {string} params.topic - Topic or subject of the quiz
   * @param {string} params.difficulty - 'easy' | 'medium' | 'hard'
   * @param {number} params.numQuestions - Number of questions (1-20)
   * @param {string} [params.customInstructions] - Extra context or constraints
   * @returns {Promise<Object>} Structured Quiz Object
   */
  async generateQuiz({ topic, difficulty = 'medium', numQuestions = 5, customInstructions = '' }) {
    const count = Math.min(Math.max(parseInt(numQuestions, 10) || 5, 1), 20);

    // If API key is not configured, return fallback
    if (!this.hasValidKey && !process.env.GEMINI_API_KEY) {
      console.warn('[Gemini Service]: No GEMINI_API_KEY detected. Using fallback.');
      return this._generateFallbackQuiz(topic, difficulty, count);
    }

    // Re-initialize if key was set dynamically
    if (!this.ai && process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      this.hasValidKey = true;
    }

    const systemPrompt = `
You are an expert computer science professor and technical examiner. Create a comprehensive, realistic multiple-choice assessment specifically testing knowledge on "${topic}".
Difficulty level: ${difficulty}.
Total questions: ${count}.
${customInstructions ? `Additional context / guidelines: ${customInstructions}` : ''}

Strict Output Requirements:
1. Every question MUST directly test core mechanisms, syntax, edge cases, architecture, or best practices of "${topic}".
2. Provide 4 distinct, plausible answer choices for every question.
3. Return ONLY a valid JSON object without markdown fences, code blocks, or extra text.
4. The JSON object must strictly match this schema:
{
  "title": "A technical title for the ${topic} assessment",
  "description": "A 1-2 sentence overview of the quiz goals",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "questionText": "Clear, technically precise question testing ${topic}",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctOptionIndex": 0, // integer from 0 to 3 indicating the correct option
      "explanation": "Clear, deep explanation of why this option is correct and why other options are incorrect.",
      "points": 1
    }
  ]
}
`;

    // Try candidate models in order with automatic failover
    let lastError = null;
    for (const modelName of AVAILABLE_MODELS) {
      try {
        console.log(`[Gemini Service]: Generating quiz using model: ${modelName}...`);
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4
          }
        });

        const responseText = response.text ? response.text.trim() : '';

        // Clean response in case markdown tags slip through
        const cleanedJson = responseText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsedQuiz = JSON.parse(cleanedJson);

        // Validate required structure
        if (!parsedQuiz.questions || !Array.isArray(parsedQuiz.questions) || parsedQuiz.questions.length === 0) {
          throw new Error('Gemini response missing questions array');
        }

        console.log(`[Gemini Service]: Successfully generated ${parsedQuiz.questions.length} questions on "${topic}" via ${modelName}`);
        return parsedQuiz;
      } catch (error) {
        console.warn(`[Gemini Service]: Model ${modelName} failed (${error.message}). Trying fallback model...`);
        lastError = error;
      }
    }

    console.error('[Gemini Service All Models Failed]:', lastError?.message);
    // Fallback to maintain system resilience in case of total network disconnect
    return this._generateFallbackQuiz(topic, difficulty, count);
  }

  /**
   * Generates a deep-dive explanation for an answer
   * @param {Object} params
   */
  async generateExplanation({ questionText, options, selectedOptionIndex, correctOptionIndex }) {
    if (!this.hasValidKey && !process.env.GEMINI_API_KEY) {
      return `The correct answer is "${options[correctOptionIndex]}". It directly addresses the core requirements of the question under standard specifications.`;
    }

    const prompt = `
Question: ${questionText}
Options:
0. ${options[0]}
1. ${options[1]}
2. ${options[2]}
3. ${options[3]}

The student selected Option ${selectedOptionIndex} ("${options[selectedOptionIndex]}").
The correct answer is Option ${correctOptionIndex} ("${options[correctOptionIndex]}").

Provide a concise, encouraging 2-3 sentence explanation explaining why Option ${correctOptionIndex} is correct and why Option ${selectedOptionIndex} was incorrect.
`;

    for (const modelName of AVAILABLE_MODELS) {
      try {
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.3
          }
        });

        return response.text.trim();
      } catch (error) {
        console.warn(`[Gemini Service Explanation]: Model ${modelName} error (${error.message})`);
      }
    }

    return `The correct answer is "${options[correctOptionIndex]}". It aligns with established computer science principles.`;
  }

  /**
   * Offline fallback generator for when no internet connection is available
   * @private
   */
  _generateFallbackQuiz(topic, difficulty, count) {
    const formattedTopic = topic ? topic.trim() : 'Computer Science Fundamentals';
    return {
      title: `${formattedTopic} Assessment (${difficulty.toUpperCase()})`,
      description: `Test your proficiency and core technical concepts in ${formattedTopic}.`,
      topic: formattedTopic,
      difficulty,
      questions: [
        {
          questionText: `In the context of ${formattedTopic}, what is the primary role of an abstraction layer?`,
          options: [
            'To hide complex implementation details and expose a simplified interface',
            'To increase the physical memory consumed by the application',
            'To bypass authentication and security protocols',
            'To convert compiled bytecode back into original source code'
          ],
          correctOptionIndex: 0,
          explanation: 'Abstraction simplifies system design by separating the interface from the underlying technical implementation.',
          points: 1
        },
        {
          questionText: `Which of the following best represents a core best practice in ${formattedTopic}?`,
          options: [
            'Hardcoding credentials directly into source control repositories',
            'Applying modular design, separation of concerns, and error handling',
            'Ignoring latency and network round-trip overhead in distributed systems',
            'Executing database queries synchronously inside UI rendering loops'
          ],
          correctOptionIndex: 1,
          explanation: 'Modular design and separation of concerns improve maintainability, testing, and scalability.',
          points: 1
        }
      ].slice(0, count)
    };
  }
}

module.exports = new GeminiService();

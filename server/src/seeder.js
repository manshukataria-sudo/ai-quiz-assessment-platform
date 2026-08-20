const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Attempt = require('./models/Attempt');

dotenv.config();

const sampleQuizzes = [
  {
    title: 'Microsoft Azure Fundamentals (AZ-900 Core)',
    description: 'Assess your knowledge on Azure cloud compute, storage, networking, and security architecture.',
    topic: 'Cloud Computing & Azure',
    difficulty: 'medium',
    timeLimitMinutes: 10,
    isAIGenerated: true,
    questions: [
      {
        questionText: 'Which Azure service provides a fully managed platform for deploying containerized web applications without managing underlying virtual machines?',
        options: [
          'Azure App Service',
          'Azure Virtual Machines',
          'Azure Logic Apps',
          'Azure Dedicated Hosts'
        ],
        correctOptionIndex: 0,
        explanation: 'Azure App Service is a fully managed PaaS (Platform as a Service) for hosting web apps, REST APIs, and mobile backends with built-in auto-scaling and CI/CD integration.',
        points: 1
      },
      {
        questionText: 'In cloud architecture, what is the primary benefit of deploying across multiple Azure Availability Zones?',
        options: [
          'Protection against entire datacenter failures within a region',
          'Automatic reduction of cloud subscription billing to zero',
          'Elimination of the need for data backups and encryption',
          'Instant conversion of relational databases into NoSQL document stores'
        ],
        correctOptionIndex: 0,
        explanation: 'Azure Availability Zones are physically separate datacenters within an Azure region, providing redundancy, fault tolerance, and high availability.',
        points: 1
      },
      {
        questionText: 'Which Azure identity service is used for enterprise Single Sign-On (SSO) and Role-Based Access Control (RBAC)?',
        options: [
          'Microsoft Entra ID (Azure AD)',
          'Azure Key Vault',
          'Azure Traffic Manager',
          'Azure Sentinel'
        ],
        correctOptionIndex: 0,
        explanation: 'Microsoft Entra ID (formerly Azure Active Directory) is the cloud-based identity and access management service used by enterprises.',
        points: 1
      },
      {
        questionText: 'What is the main advantage of Serverless computing (such as Azure Functions) from a cost perspective?',
        options: [
          'You only pay for compute resources during the exact duration of execution',
          'Compute instances are pre-allocated and billed 24/7 regardless of usage',
          'It requires purchasing physical hardware servers upfront',
          'It replaces software development with automated AI agents entirely'
        ],
        correctOptionIndex: 0,
        explanation: 'Serverless models follow a consumption-based pricing model where customers are only billed for the memory and execution time consumed per event.',
        points: 1
      },
      {
        questionText: 'Which Azure caching service is recommended to reduce database query load for frequently requested data?',
        options: [
          'Azure Cache for Redis',
          'Azure Blob Storage Cold Tier',
          'Azure Archive Storage',
          'Azure Data Factory'
        ],
        correctOptionIndex: 0,
        explanation: 'Azure Cache for Redis provides high-throughput, low-latency in-memory data storage to dramatically speed up data-intensive applications.',
        points: 1
      }
    ]
  },
  {
    title: 'React.js & State Management Mastery',
    description: 'Deep dive into React hooks, reconciliation, virtual DOM, and component lifecycles.',
    topic: 'React.js & Frontend Engineering',
    difficulty: 'medium',
    timeLimitMinutes: 10,
    isAIGenerated: true,
    questions: [
      {
        questionText: 'Why should you avoid mutating state directly in React (e.g., state.count = 5)?',
        options: [
          'Direct mutations do not trigger a re-render because React relies on shallow reference equality checks',
          'Direct mutations crash the browser JavaScript V8 engine immediately',
          'Direct mutations automatically delete CSS style definitions',
          'React does not allow variables to have numerical values'
        ],
        correctOptionIndex: 0,
        explanation: 'React compares previous and next state references. If state is mutated directly, the object reference remains identical and React will not schedule a re-render.',
        points: 1
      },
      {
        questionText: 'What is the primary purpose of the useMemo hook in React?',
        options: [
          'To memoize the result of an expensive calculation between renders',
          'To replace Redux for global application state',
          'To fetch data from REST APIs asynchronously on component unmount',
          'To automatically write unit tests for JSX components'
        ],
        correctOptionIndex: 0,
        explanation: 'useMemo caches the calculated value of a function and only recalculates it when one of its dependencies changes.',
        points: 1
      },
      {
        questionText: 'In React Context API, what problem does it primarily solve?',
        options: [
          'Prop drilling across deeply nested component hierarchies',
          'SQL injection vulnerabilities on the client side',
          'Converting JSON payloads into XML documents',
          'Bypassing CSS media queries for mobile devices'
        ],
        correctOptionIndex: 0,
        explanation: 'Context provides a way to pass data through the component tree without having to pass props down manually at every level.',
        points: 1
      }
    ]
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-quiz-platform';
    await mongoose.connect(mongoUri);
    console.log('[Seeder]: Connected to MongoDB at', mongoUri);

    // Clear existing collections
    await User.deleteMany();
    await Quiz.deleteMany();
    await Attempt.deleteMany();
    console.log('[Seeder]: Cleared existing users, quizzes, and attempts.');

    // Create Demo User
    const demoUser = await User.create({
      name: 'Alex Morgan (Demo Candidate)',
      email: 'student@microsoft.com',
      password: 'Password123',
      role: 'student'
    });
    console.log('[Seeder]: Created demo user: student@microsoft.com / Password123');

    // Create Quizzes
    const createdQuizzes = [];
    for (const q of sampleQuizzes) {
      const quiz = await Quiz.create({
        ...q,
        creator: demoUser._id
      });
      createdQuizzes.push(quiz);
    }
    console.log(`[Seeder]: Created ${createdQuizzes.length} initial quizzes.`);

    // Create Sample Completed Attempts for Analytics Dashboard
    const azureQuiz = createdQuizzes[0];
    const evaluatedAnswers = azureQuiz.questions.map((q, idx) => ({
      questionIndex: idx,
      questionText: q.questionText,
      options: q.options,
      selectedOptionIndex: idx === 3 ? 1 : q.correctOptionIndex, // 1 intentional wrong answer
      correctOptionIndex: q.correctOptionIndex,
      isCorrect: idx !== 3,
      pointsAwarded: idx !== 3 ? 1 : 0,
      explanation: q.explanation
    }));

    const correctCount = evaluatedAnswers.filter(a => a.isCorrect).length;
    const totalPts = evaluatedAnswers.length;
    const percentage = Math.round((correctCount / totalPts) * 100);

    await Attempt.create({
      user: demoUser._id,
      quiz: azureQuiz._id,
      quizTitle: azureQuiz.title,
      topic: azureQuiz.topic,
      difficulty: azureQuiz.difficulty,
      answers: evaluatedAnswers,
      score: correctCount,
      totalPossibleScore: totalPts,
      percentage,
      passed: percentage >= 60,
      timeTakenSeconds: 245
    });

    console.log('[Seeder]: Created sample assessment attempt with 80% score.');
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error.message);
    process.exit(1);
  }
};

seedData();

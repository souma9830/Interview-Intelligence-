/**
 * Ollama LLM Service for AI Question Generation
 * Integrates dynamic prompt engineering with robust developer offline schema fallbacks.
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
const sanitizeAndParseJson = (text, fallback) => {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.slice(start, end));
    }
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
};

/**
 * Generate technical, HR, and coding questions using local Ollama LLM.
 * Falls back gracefully to high-quality deterministic mock generation if Ollama is not active.
 * 
 * @param {object} params - Input parameters.
 * @param {string} params.role - Target interview role.
 * @param {string} params.experience - Candidate experience level.
 * @param {Array<string>} params.skills - Extracted resume skills list.
 * @param {string} params.jobDescription - pasted JD context.
 * @returns {Promise<object>} Categorized questions object.
 */
const generateCategorizedQuestions = async ({ role, experience, skills, jobDescription }) => {
  const skillsStr = skills && skills.length > 0 ? skills.join(', ') : 'General track proficiencies';
  
  const systemPrompt = `You are a futuristic AI Technical Recruiter.
Generate customized interview questions for a candidate with the following credentials:
- Target Role: ${role}
- Experience Level: ${experience}
- Core Skills: ${skillsStr}
- Job Description: ${jobDescription || 'Standard requirements'}

You MUST generate three distinct categories of questions:
1. Technical Questions (assessing core syntax, system design, and tool integrations matching their skills)
2. HR Questions (assessing behavioral scenarios, leadership qualities, and communication tempos customized to their experience level)
3. Coding Questions (assessing data structures, space-time complexities, and algorithmic designs)

Output strictly a JSON object with this EXACT structure, containing no other text or explanation:
{
  "technical": [
    "first technical question text",
    "second technical question text"
  ],
  "hr": [
    "first HR question text",
    "second HR question text"
  ],
  "coding": [
    "first coding problem text"
  ]
}`;

  try {
    console.log(`[Ollama] Dispatching generation request to model '${OLLAMA_MODEL}' at ${OLLAMA_HOST}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for fast response

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: systemPrompt,
        stream: false,
        format: 'json'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama service returned status ${response.status}`);
    }

    const resJson = await response.json();
    const cleanResponseText = resJson.response || '';

    // Attempt to parse clean JSON object from the response string using the sanitizer
    const parsedData = sanitizeAndParseJson(cleanResponseText, null);
    if (parsedData && parsedData.technical && parsedData.hr && parsedData.coding) {
      console.log('✔ Ollama dynamic question generation completed successfully.');
      return parsedData;
    }
    
    throw new Error('Ollama output did not match expected JSON schema boundaries');
  } catch (error) {
    console.warn(`⚠️ Ollama offline or inactive (${error.message}). Invoking randomized fallback generator...`);

    const pick = (pool, count) => {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    };

    const questionPools = {
      'Frontend Engineer': {
        technical: [
          `How would you optimize React's reconciliation engine specifically when managing complex ${skillsStr} components?`,
          `Explain how you would minimize paint-reflow barriers in a production layout containing advanced elements.`,
          `How do you implement code splitting and lazy loading to improve initial page load times?`,
          `Describe your approach to managing global state in a large React application. When would you choose Context API vs Redux vs Zustand?`,
          `How do you handle accessibility (a11y) compliance in a component library?`,
          `What is your strategy for handling cross-browser compatibility issues in CSS?`,
          `How do you implement responsive design that works across mobile, tablet, and desktop?`,
          `Explain how you would build a real-time collaborative editing feature in the browser.`,
          `How do you optimize images and assets for web performance?`,
          `What is your approach to writing end-to-end tests for a frontend application?`,
        ],
        hr: [
          `Describe a situation at your ${experience} level where you had to negotiate layout design trade-offs with backend developers.`,
          `How do you manage sprint boundaries when client specifications shift mid-cycle?`,
          `Tell me about a time you improved developer experience or tooling for your team.`,
          `How do you handle feedback when your UI design is rejected by stakeholders?`,
          `Describe a time you had to deliver a frontend feature with incomplete backend APIs.`,
          `How do you balance pixel-perfect design implementation with development velocity?`,
        ],
        coding: [
          `Write a JavaScript function that flattens a deeply nested array structure, filtering out null values while maintaining O(N) space efficiency.`,
          `Implement a custom React hook that debounces API calls and cancels stale requests.`,
          `Write a function to deep-clone an object without using JSON.parse/stringify (handle circular references).`,
          `Implement a virtual scrolling component that efficiently renders 10,000 list items.`,
          `Write a throttle function with leading and trailing edge options.`,
        ]
      },
      'Backend Engineer': {
        technical: [
          `Explain your approach to designing a high-throughput API layer using ${skillsStr} while maintaining optimal database lock boundaries.`,
          `How do you design a distributed rate-limiter across multi-tenant servers?`,
          `How would you implement database sharding for a rapidly growing user table?`,
          `Explain your strategy for handling long-running background jobs and task queues.`,
          `How do you design idempotent APIs and handle retry logic for network failures?`,
          `Describe your approach to managing database connection pooling under heavy load.`,
          `How would you implement a pub/sub system for real-time notifications?`,
          `What is your approach to API versioning in a production microservice ecosystem?`,
          `How do you handle data consistency across microservices without distributed transactions?`,
          `Explain how you would design a file upload service that handles large files (>1GB) reliably.`,
        ],
        hr: [
          `Detail a scenario where you had to refactor a slow backend database query under extreme production load.`,
          `How do you mentor junior backend developers to adopt optimal secure coding practices?`,
          `Tell me about a time you had to make a critical architectural decision under pressure.`,
          `How do you handle technical debt while delivering new features on schedule?`,
          `Describe a production incident you resolved and what you learned from it.`,
          `How do you communicate complex backend constraints to frontend developers or product managers?`,
        ],
        coding: [
          `Write a Node.js script that parses a stream of incoming HTTP logs, extracting key metrics and returning top latency endpoints in O(1) time.`,
          `Implement a simple in-memory key-value store with TTL-based expiration.`,
          `Write a middleware function that implements request rate limiting using the sliding window algorithm.`,
          `Implement a basic connection pool manager that reuses database connections.`,
          `Write a function to detect and break circular dependencies in a module graph.`,
        ]
      },
      'Fullstack Engineer': {
        technical: [
          `Describe the performance trade-offs between utilizing Server-Sent Events (SSE) versus WebSockets in ${skillsStr} applications.`,
          `How do you secure serverless functions against advanced cross-site scripting vulnerabilities?`,
          `How do you handle authentication flows (OAuth, JWT) end-to-end from frontend to backend?`,
          `Explain how you would design a full-stack feature with offline support and sync capabilities.`,
          `How do you manage environment-specific configurations across frontend and backend deployments?`,
          `Describe your approach to setting up a monorepo for a full-stack application.`,
          `How would you implement server-side rendering vs static site generation for SEO-critical pages?`,
          `What is your strategy for handling file uploads from the browser through to cloud storage?`,
          `How do you implement real-time features using WebSockets in a full-stack application?`,
          `Explain how you would design a permissions system that spans both UI and API layers.`,
        ],
        hr: [
          `As a ${experience} candidate, how do you balance business priority timelines with technical debt refactoring?`,
          `Tell us about a time you owned a full-stack feature launch from database schema design to frontend deployment.`,
          `How do you decide which parts of a feature to build on the frontend vs backend?`,
          `Describe a time you had to quickly switch between frontend and backend work to unblock a release.`,
          `How do you handle disagreements between design, frontend, and backend teams?`,
          `Tell me about a time you identified and fixed a performance bottleneck that spanned the full stack.`,
        ],
        coding: [
          `Design a custom event emitter interface supporting subscription, publishing, and unsubscribe functions.`,
          `Build a REST API endpoint and its corresponding React component that implements paginated search with debounced input.`,
          `Write a function to implement optimistic UI updates with rollback on API failure.`,
          `Implement a basic form validation library that works both client-side and server-side.`,
          `Write a caching utility that stores API responses with TTL and automatic invalidation.`,
        ]
      },
      'AI / ML Engineer': {
        technical: [
          `Explain the mathematical difference between standard self-attention and FlashAttention when training on ${skillsStr} models.`,
          `How do you mitigate semantic embedding drift inside large retrieval vector indexes?`,
          `Describe your approach to feature engineering for tabular data vs unstructured text data.`,
          `How would you design an A/B testing framework for ML model deployments?`,
          `Explain the trade-offs between fine-tuning a pre-trained model vs training from scratch.`,
          `How do you handle class imbalance in a classification problem?`,
          `Describe your approach to implementing a recommendation system from scratch.`,
          `How would you design a real-time inference pipeline with sub-100ms latency requirements?`,
          `Explain how you would implement RAG (Retrieval-Augmented Generation) for a domain-specific chatbot.`,
          `How do you monitor and detect model drift in production?`,
        ],
        hr: [
          `Describe a situation where a model's production outputs began to show bias, and explain how you resolved it.`,
          `How do you articulate AI model black-box decisions to non-technical business partners?`,
          `Tell me about a time your ML experiment results didn't match expectations. What did you do?`,
          `How do you decide when to use a simple heuristic vs a complex ML model?`,
          `Describe your experience collaborating with data engineers to build production data pipelines.`,
          `How do you handle ethical concerns when building AI-powered products?`,
        ],
        coding: [
          `Write a python/JS matrix multiplication helper function that optimizes row-wise cache access patterns.`,
          `Implement a k-nearest neighbors classifier from scratch without using ML libraries.`,
          `Write a function to compute TF-IDF scores for a collection of documents.`,
          `Implement a simple gradient descent optimizer for linear regression.`,
          `Write a tokenizer that splits text into word pieces using a basic BPE-like algorithm.`,
        ]
      }
    };

    const pools = questionPools[role] || questionPools['Frontend Engineer'];
    return {
      technical: pick(pools.technical, 2),
      hr: pick(pools.hr, 2),
      coding: pick(pools.coding, 1),
    };
  }
};

module.exports = { generateCategorizedQuestions };

// Gemini caching service integration

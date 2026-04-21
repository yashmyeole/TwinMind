/**
 * Detects if a text contains a question or statement requiring suggestions
 * Returns true if the text likely contains a question or needs analysis
 * STRICT: Only matches explicit questions, not casual statements
 */
export function containsQuestion(text) {
  if (!text || text.trim() === "") {
    return false;
  }

  const cleanText = text.trim().toLowerCase();

  // PRIMARY: Check for explicit question marks - THE MOST RELIABLE SIGNAL
  if (cleanText.includes("?")) {
    return true;
  }

  // Split into sentences to check sentence starters independently
  const sentences = cleanText.split(/[.!]/);
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence || trimmedSentence.length < 4) continue; // Skip very short fragments

    // Question words at SENTENCE START (strict position - must be first word)
    const questionStarters = [
      "what ", "what's ", "whats ",
      "why ", "how ", "when ", "where ", "who ", "which ",
      "whose ", "whom "
    ];

    for (const starter of questionStarters) {
      if (trimmedSentence.startsWith(starter)) {
        return true;
      }
    }

    // Interrogative verbs ONLY at sentence start (NOT in the middle)
    // BUT: be strict - these only count if clearly interrogative
    const interrogativePatterns = [
      /^is\s+(?:it|this|that|there|[a-z]+\s+)?/i,      // "Is it...", "Is this..."
      /^are\s+(?:you|we|they|[a-z]+\s+)?/i,             // "Are you...", "Are we..."
      /^was\s+(?:it|there)?/i,                           // "Was it..."
      /^were\s+(?:you|we|they)?/i,                       // "Were they..."
      /^can\s+(?:you|i|we|they)?/i,                      // "Can you...", "Can we..."
      /^could\s+(?:you|i|we|they)?/i,                    // "Could you..."
      /^will\s+(?:you|i|this|that)?/i,                   // "Will you..."
      /^would\s+(?:you|i|we)?/i,                         // "Would you..."
      /^should\s+(?:i|we|you)?/i,                        // "Should we..."
      /^may\s+(?:i|we)?/i,                               // "May I..."
      /^might\s+(?:i|we|you)?/i,                         // "Might we..."
      /^must\s+(?:i|we)?/i,                              // "Must we..."
      /^have\s+(?:you|we|they)?/i,                       // "Have you..."
      /^has\s+(?:it|this|that)?/i,                       // "Has it..."
      /^do\s+(?:you|we|they|i)?/i,                       // "Do you..."
      /^does\s+(?:it|he|she)?/i,                         // "Does it..."
      /^did\s+(?:you|he|they)?/i,                        // "Did you..."
    ];

    for (const pattern of interrogativePatterns) {
      if (pattern.test(trimmedSentence)) {
        return true;
      }
    }

    // Specific phrase-based questions (these are reliable)
    const explicitQuestionPhrases = [
      "can you tell",
      "could you tell",
      "would you tell",
      "will you tell",
      "can you explain",
      "could you explain",
      "can you clarify",
      "is it true",
      "is this correct",
      "did you mean",
    ];

    for (const phrase of explicitQuestionPhrases) {
      if (trimmedSentence.includes(phrase)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Detects if text contains factual claims that need verification
 * Examples: "We're using PostgreSQL 15", "The API costs $50/month", "Version 2.0 supports GraphQL"
 */
export function containsFactualClaim(text) {
  if (!text || text.trim() === "") {
    return false;
  }

  const cleanText = text.toLowerCase();

  // Patterns that indicate specific factual claims
  const factualPatterns = [
    // Technology/tool mentions with specificity
    /using\s+\w+\s*(\d+|v\d+\.)/i,                    // "using PostgreSQL 15"
    /\b(uses|use)\s+\w+\s*(\d+|v\d+\.)/i,            // "uses Node.js 18"
    /\b(running|run)\s+(on|with)?\s+\w+\s*(\d+|v)/i, // "running PostgreSQL"
    /supports?\s+\w+\s*(\d+|v\d+\.)/i,               // "supports Python 3.11"
    
    // Version/release mentions
    /version\s+(\d+\.)?(\d+\.)?(\d+)/i,              // "version 2.0"
    /v\d+\.\d+/i,                                     // "v1.5"
    /release\s+(\d+\.)?(\d+\.)?(\d+)/i,              // "release 3.0"
    
    // Cost/pricing claims (IMPORTANT)
    /costs?\s*\$\d+/i,                                // "costs $50"
    /\$\d+\s*(per|a|an)/i,                           // "$100 per month"
    /price\s*is\s*\$\d+/i,                           // "price is $99"
    /pay\s+\$?\d+/i,                                 // "pay 299" or "pay $299"
    /free|premium|paid/i,                             // "free", "paid", "premium" (claim)
    
    // Time/date claims
    /\b(in|since|from)\s+(\d{4}|january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /\d+\s+(years?|months?|days?|hours?)\s+(ago|from|later)/i,
    
    // Numerical claims
    /\b\d+\s*(million|billion|thousand|mb|gb|users?|servers?|clients?|requests?|endpoints?)/i,
    /\b\d+%\s+(increase|decrease|growth|adoption)/i,
    
    // Comparison claims
    /\b(is|are|was|were)\s+\w+\s*(than|as)\s+\w+/i,  // "is better than X"
    /\b(supports?|compatible with|works with)\s+\w+/i,
    
    // Architecture/technical claims
    /\b(uses|based on|built with)\s+\w+\s+(architecture|pattern|design|framework)/i,
    /\b(microservices?|monolithic|serverless|containers?|kubernetes|docker)/i,
    
    // Infrastructure claims
    /\b(deployed on|hosted on|runs on|in the cloud|on-premise)/i,
    /\b(database|sql|nosql|mongodb|postgresql|mysql|elasticsearch)/i,
    
    // Team/resource claims
    /\b(team|team of|with)\s+\d+\s+(people|developers?|engineers?)/i,
    /\b(requires?)\s+\d+\s+(days?|weeks?|months?)/i,
    
    // Tool-specific and feature claims (EXPANDED)
    /\b(has|have|includes?|supports?|offers?|includes?)\s+\w+/i,  // "has features", "offers tools"
    /\b(scraper?|scraping|crawling|api|integration|plugin|extension)/i,  // Technical tools
    /\b(built.?in|integrated|included|comes.?with)/i,  // Built-in features
  ];

  for (const pattern of factualPatterns) {
    if (pattern.test(cleanText)) {
      return true;
    }
  }

  // Keyword-based claims (look for declarative statements with factual indicators)
  const factualKeywords = [
    "we're using",
    "we use",
    "we have",
    "it supports",
    "it's compatible",
    "the cost",
    "the price",
    "version",
    "release",
    "compatibility",
    "performance",
    "throughput",
    "latency",
    "api",
    "tool",
    "scraper",
    "feature",
    "integration",
    "plugin",
    "built in",
    "offers",
    "provides",
    "includes",
  ];

  for (const keyword of factualKeywords) {
    if (cleanText.includes(keyword)) {
      return true;
    }
  }

  return false;
}

/**
 * Determines the PRIMARY statement type for suggestion generation
 * Returns: "QUESTION" | "FACT_CLAIM" | "BOTH" | "NONE"
 */
export function detectStatementType(text) {
  const hasQuestion = containsQuestion(text);
  const hasFactClaim = containsFactualClaim(text);

  if (hasQuestion && hasFactClaim) {
    return "BOTH"; // Both present - prioritize question
  } else if (hasQuestion) {
    return "QUESTION";
  } else if (hasFactClaim) {
    return "FACT_CLAIM";
  } else {
    return "NONE";
  }
}

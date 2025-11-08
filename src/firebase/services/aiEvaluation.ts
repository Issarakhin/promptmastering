export interface LabEvaluationResult {
  score: number; // 0-100
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keywordMatches: number;
  totalKeywords: number;
}

/**
 * Evaluate a lab submission using AI-powered analysis
 * @param submission - User's lab submission text
 * @param expectedKeywords - Keywords that should be present
 * @param labPrompt - The original lab prompt/instructions
 * @param passingScore - Minimum score to pass (default 70)
 */
export async function evaluateLabSubmission(
  submission: string,
  expectedKeywords: string[],
  _labPrompt: string,
  passingScore: number = 70
): Promise<LabEvaluationResult> {
  
  // Normalize submission
  const normalizedSubmission = submission.toLowerCase().trim();
  
  if (normalizedSubmission.length < 10) {
    return {
      score: 0,
      passed: false,
      feedback: 'Your submission is too short. Please provide a more detailed answer.',
      strengths: [],
      improvements: ['Provide more detail', 'Explain your reasoning'],
      keywordMatches: 0,
      totalKeywords: expectedKeywords.length
    };
  }
  
  // Keyword matching
  const keywordMatches = expectedKeywords.filter(keyword => 
    normalizedSubmission.includes(keyword.toLowerCase())
  ).length;
  
  const keywordScore = (keywordMatches / expectedKeywords.length) * 40; // 40% weight
  
  // Length and completeness (20% weight)
  const lengthScore = Math.min((normalizedSubmission.length / 100) * 20, 20);
  
  // Structure and clarity (20% weight)
  const hasGoodStructure = normalizedSubmission.split(/[.!?]/).length > 2;
  const structureScore = hasGoodStructure ? 20 : 10;
  
  // Specificity (20% weight)
  const specificityScore = calculateSpecificity(normalizedSubmission);
  
  // Calculate total score
  const totalScore = Math.round(keywordScore + lengthScore + structureScore + specificityScore);
  
  // Generate feedback
  const feedback = generateFeedback(
    totalScore,
    keywordMatches,
    expectedKeywords.length,
    normalizedSubmission.length
  );
  
  // Identify strengths
  const strengths = identifyStrengths(
    keywordMatches,
    expectedKeywords.length,
    normalizedSubmission,
    hasGoodStructure
  );
  
  // Identify improvements
  const improvements = identifyImprovements(
    keywordMatches,
    expectedKeywords.length,
    normalizedSubmission,
    hasGoodStructure
  );
  
  return {
    score: totalScore,
    passed: totalScore >= passingScore,
    feedback,
    strengths,
    improvements,
    keywordMatches,
    totalKeywords: expectedKeywords.length
  };
}

/**
 * Calculate specificity score based on content analysis
 */
function calculateSpecificity(text: string): number {
  let score = 0;
  
  // Check for specific indicators
  const specificIndicators = [
    'for example',
    'such as',
    'specifically',
    'in particular',
    'namely',
    'like',
    'including'
  ];
  
  specificIndicators.forEach(indicator => {
    if (text.includes(indicator)) score += 3;
  });
  
  // Check for numbers or data
  if (/\d+/.test(text)) score += 3;
  
  // Check for quotes
  if (text.includes('"') || text.includes("'")) score += 2;
  
  return Math.min(score, 20);
}

/**
 * Generate detailed feedback based on evaluation
 */
function generateFeedback(
  score: number,
  _keywordMatches: number,
  _totalKeywords: number,
  _textLength: number
): string {
  if (score >= 90) {
    return 'Excellent work! Your submission demonstrates a strong understanding of the concept and includes all key elements. Your explanation is clear, specific, and well-structured.';
  } else if (score >= 80) {
    return 'Great job! Your submission shows good understanding and covers most key points. With minor improvements, this could be perfect.';
  } else if (score >= 70) {
    return 'Good effort! Your submission meets the basic requirements. Consider adding more specific details and examples to strengthen your answer.';
  } else if (score >= 50) {
    return 'Your submission shows some understanding but needs improvement. Make sure to address all key concepts and provide more detailed explanations.';
  } else {
    return 'Your submission needs significant improvement. Please review the lab instructions carefully and ensure you address all required elements with specific details.';
  }
}

/**
 * Identify strengths in the submission
 */
function identifyStrengths(
  keywordMatches: number,
  totalKeywords: number,
  text: string,
  hasGoodStructure: boolean
): string[] {
  const strengths: string[] = [];
  
  if (keywordMatches === totalKeywords) {
    strengths.push('Includes all key concepts');
  } else if (keywordMatches >= totalKeywords * 0.7) {
    strengths.push('Covers most important concepts');
  }
  
  if (text.length > 150) {
    strengths.push('Provides detailed explanation');
  }
  
  if (hasGoodStructure) {
    strengths.push('Well-structured response');
  }
  
  if (text.includes('example') || text.includes('such as')) {
    strengths.push('Includes examples');
  }
  
  if (text.split(' ').length > 50) {
    strengths.push('Comprehensive answer');
  }
  
  return strengths;
}

/**
 * Identify areas for improvement
 */
function identifyImprovements(
  keywordMatches: number,
  totalKeywords: number,
  text: string,
  hasGoodStructure: boolean
): string[] {
  const improvements: string[] = [];
  
  if (keywordMatches < totalKeywords) {
    improvements.push(`Include ${totalKeywords - keywordMatches} more key concept(s)`);
  }
  
  if (text.length < 100) {
    improvements.push('Provide more detailed explanation');
  }
  
  if (!hasGoodStructure) {
    improvements.push('Organize your answer into clear sentences');
  }
  
  if (!text.includes('example') && !text.includes('such as')) {
    improvements.push('Add specific examples to illustrate your points');
  }
  
  if (text.split(' ').length < 30) {
    improvements.push('Expand your answer with more details');
  }
  
  return improvements;
}

/**
 * Advanced AI evaluation using external AI service (optional)
 * This can be integrated with OpenAI or other AI APIs for more sophisticated evaluation
 */
export async function evaluateLabWithAI(
  submission: string,
  labPrompt: string,
  expectedKeywords: string[]
): Promise<LabEvaluationResult> {
  // For now, use the rule-based evaluation
  // In production, you could call an AI API here:
  /*
  const response = await fetch('YOUR_AI_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: `Evaluate this lab submission:\n\nPrompt: ${labPrompt}\n\nSubmission: ${submission}\n\nExpected keywords: ${expectedKeywords.join(', ')}\n\nProvide a score (0-100) and detailed feedback.`,
    })
  });
  
  const aiResult = await response.json();
  return parseAIResponse(aiResult);
  */
  
  return evaluateLabSubmission(submission, expectedKeywords, labPrompt);
}

/**
 * Get sample good answer for reference (for hints)
 */
export function generateSampleAnswer(_labPrompt: string, expectedKeywords: string[]): string {
  return `A good answer should include these key concepts: ${expectedKeywords.join(', ')}. 
  
Make sure to:
- Address the main question directly
- Include specific examples
- Explain your reasoning
- Use clear and concise language
- Demonstrate understanding of the concept`;
}

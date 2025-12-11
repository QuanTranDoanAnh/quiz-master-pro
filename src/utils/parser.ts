import type { Question, Option } from '../types';

/**
 * Parses HTML string content (exported from Word) into structured Question objects.
 * Logic:
 * 1. Looks for paragraphs starting with "Question X:" (in bold usually).
 * 2. Looks for paragraphs starting with "a.", "b.", "c.", "d.".
 * 3. Checks if the option text contains <b> or <strong> tags to determine correctness.
 */
export const parseHtmlToQuestions = (htmlContent: string): Question[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const elements = Array.from(doc.body.querySelectorAll('p, div, li')); // Grab common block elements

  const questions: Question[] = [];
  let currentQuestion: Partial<Question> | null = null;
  let currentOptions: Option[] = [];

  // Regex patterns
  // Matches: "Question 1:", "Question 105:"
  const questionStartRegex = /^\s*Question\s+(\d+)\s*:/i; 
  // Matches: "a.", "a)", "A." at start of line
  const optionStartRegex = /^\s*([a-d])[.)]\s+/i; 

  elements.forEach((el) => {
    const text = el.textContent?.trim() || '';
    
    // 1. Detect Question Start
    const questionMatch = text.match(questionStartRegex);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          ...(currentQuestion as Partial<Question>),
          options: currentOptions
        } as Question);
      }

      // Start new question
      const originalNumber = parseInt(questionMatch[1], 10);
      // Remove the "Question X:" prefix from the text for cleaner display
      const cleanText = text.replace(questionStartRegex, '').trim();

      currentQuestion = {
        id: Date.now() + Math.random(), // generate unique temp ID
        originalNumber,
        text: cleanText || text, // Fallback if replace fails
      };
      currentOptions = [];
      return;
    }

    // 2. Detect Option
    const optionMatch = text.match(optionStartRegex);
    if (currentQuestion && optionMatch) {
      const optionId = optionMatch[1].toLowerCase(); // 'a', 'b', etc.
      const optionText = text.replace(optionStartRegex, '').trim();

      // Check for bold styling to determine correctness
      // Word exports usually wrap bold text in <b>, <strong>, or <span style="font-weight:bold">
      const isBold = 
        el.querySelector('b') !== null || 
        el.querySelector('strong') !== null ||
        (el as HTMLElement).style.fontWeight === 'bold' ||
        el.innerHTML.includes('<b>') || // simple string check for nested bold
        el.innerHTML.includes('<strong>');

      currentOptions.push({
        id: optionId,
        text: optionText,
        isCorrect: isBold
      });
    }
  });

  // Push the last question
  if (currentQuestion && currentOptions.length > 0) {
    questions.push({
      ...(currentQuestion as Partial<Question>),
      options: currentOptions
    } as Question);
  }

  return questions;
};

export const getRandomQuestions = (allQuestions: Question[], count: number = 42): Question[] => {
  // Fisher-Yates shuffle
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};
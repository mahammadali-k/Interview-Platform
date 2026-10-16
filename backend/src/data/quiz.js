// Default interview questions. Every host starts with their own editable copy (see
// services/questionBank.js). The answer key only lives on the server: candidates don't
// get it until the interview is over.

export const PASS_PERCENT = 60;

const GENERAL = [
  {
    id: "g-hash-lookup",
    question: "What is the average time complexity of looking up a key in a hash map?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 0,
    explanation: "A hash function maps the key straight to a bucket, so lookups are constant time on average.",
  },
  {
    id: "g-fifo",
    question: "Which data structure processes elements in first-in, first-out order?",
    options: ["Stack", "Queue", "Heap", "Binary tree"],
    answer: 1,
    explanation: "A queue removes the oldest element first (FIFO). A stack is last-in, first-out.",
  },
  {
    id: "g-big-o",
    question: "What does Big-O notation describe?",
    options: [
      "The exact running time in seconds",
      "An upper bound on how the cost grows as the input grows",
      "The amount of memory an array occupies",
      "The number of lines in a program",
    ],
    answer: 1,
    explanation: "Big-O describes the growth rate of time or space in terms of input size, not exact timings.",
  },
];

const BY_PROBLEM = {
  "Two Sum": [
    {
      id: "two-sum-time",
      question: "What is the time complexity of the optimal Two Sum solution?",
      options: ["O(n^2)", "O(n)", "O(log n)", "O(1)"],
      answer: 1,
      explanation: "One pass with a hash map checks each element once, giving O(n).",
    },
    {
      id: "two-sum-why-map",
      question: "Why is a hash map useful for Two Sum?",
      options: [
        "It sorts the array for free",
        "It checks in O(1) whether the needed complement was already seen",
        "It lets you skip reading some elements",
        "It reduces the space to O(1)",
      ],
      answer: 1,
      explanation: "For each number you look up target - number in constant time instead of scanning the array again.",
    },
    {
      id: "two-sum-space",
      question: "What is the space complexity of the hash map approach?",
      options: ["O(1)", "O(n)", "O(n^2)", "O(log n)"],
      answer: 1,
      explanation: "In the worst case every element is stored in the map.",
    },
  ],
  "Reverse String": [
    {
      id: "reverse-time",
      question: "What is the time complexity of reversing a string in place with two pointers?",
      options: ["O(1)", "O(n)", "O(n^2)", "O(log n)"],
      answer: 1,
      explanation: "Each element is visited once (n/2 swaps), which is O(n).",
    },
    {
      id: "reverse-inplace",
      question: "Which approach reverses the array in place using O(1) extra space?",
      options: [
        "Copy the characters backwards into a new array",
        "Swap elements from both ends while moving inward",
        "Recursively remove the first character",
        "Sort the characters in descending order",
      ],
      answer: 1,
      explanation: "Swapping the left and right elements and moving the pointers inward needs no extra array.",
    },
    {
      id: "reverse-stop",
      question: "When should the two pointers stop?",
      options: ["When left equals the array length", "When left >= right", "When right equals 0", "After n * n steps"],
      answer: 1,
      explanation: "Once the pointers meet or cross, every pair has been swapped.",
    },
  ],
  "Valid Palindrome": [
    {
      id: "palindrome-clean",
      question: "What must be ignored when checking whether a phrase is a valid palindrome?",
      options: [
        "Only spaces",
        "Non-alphanumeric characters and letter case",
        "Digits",
        "Vowels",
      ],
      answer: 1,
      explanation: "The problem compares only letters and digits, case-insensitively.",
    },
    {
      id: "palindrome-time",
      question: "What is the time complexity of the two-pointer solution?",
      options: ["O(n^2)", "O(n)", "O(log n)", "O(n log n)"],
      answer: 1,
      explanation: "Both pointers move inward once over the string, so the work is linear.",
    },
    {
      id: "palindrome-panama",
      question: 'Is "A man, a plan, a canal: Panama" a valid palindrome under the usual rules?',
      options: ["Yes", "No", "Only if converted to uppercase", "Only if spaces are kept"],
      answer: 0,
      explanation: 'After cleaning it becomes "amanaplanacanalpanama", which reads the same both ways.',
    },
  ],
  "Maximum Subarray": [
    {
      id: "subarray-algo",
      question: "Which algorithm solves Maximum Subarray in O(n) time?",
      options: ["Kadane's algorithm", "Binary search", "Merge sort", "Dijkstra's algorithm"],
      answer: 0,
      explanation: "Kadane's algorithm keeps a running best sum and finishes in a single pass.",
    },
    {
      id: "subarray-running",
      question: "In Kadane's algorithm, what does the running value represent?",
      options: [
        "The sum of the whole array",
        "The best sum of a subarray ending at the current index",
        "The largest single element so far",
        "The count of positive numbers",
      ],
      answer: 1,
      explanation: "At each index you either extend the previous subarray or start a new one.",
    },
    {
      id: "subarray-negatives",
      question: "What is the answer for [-3, -1, -2]?",
      options: ["0", "-1", "-6", "-3"],
      answer: 1,
      explanation: "The subarray must contain at least one element, so the best choice is the largest element, -1.",
    },
  ],
  "Container With Most Water": [
    {
      id: "container-technique",
      question: "Which technique gives an O(n) solution?",
      options: [
        "Two pointers moving inward",
        "Nested loops over all pairs",
        "Sorting then binary search",
        "Prefix sums",
      ],
      answer: 0,
      explanation: "Start at both ends and move one pointer inward each step; every index is visited once.",
    },
    {
      id: "container-move",
      question: "Which pointer should move inward at each step?",
      options: ["The one at the taller line", "The one at the shorter line", "Always the left one", "Always the right one"],
      answer: 1,
      explanation: "The area is limited by the shorter line, so moving the taller one can never increase it.",
    },
    {
      id: "container-area",
      question: "What does the area between two lines depend on?",
      options: [
        "The sum of the two heights",
        "The shorter height multiplied by the distance between them",
        "The taller height multiplied by the distance",
        "Only the distance between them",
      ],
      answer: 1,
      explanation: "Water level is capped by the shorter line, and the width is the index distance.",
    },
  ],
};

export const GENERAL_PROBLEM = "*";

export const DEFAULT_QUESTIONS = [
  ...GENERAL.map((q) => ({ ...q, problem: GENERAL_PROBLEM })),
  ...Object.entries(BY_PROBLEM).flatMap(([problem, questions]) =>
    questions.map((q) => ({ ...q, problem }))
  ),
];

// questions for sessions created before we started snapshotting quizzes
export const defaultQuizFor = (problem) =>
  DEFAULT_QUESTIONS.filter((q) => q.problem === GENERAL_PROBLEM || q.problem === problem).map(
    ({ id, question, options, answer, explanation }) => ({ id, question, options, answer, explanation })
  );

export const toPublicQuestion = ({ id, question, options }) => ({ id, question, options });

/**
 * @param {{id: string, question: string, options: string[], answer: number, explanation?: string}[]} questions
 * @param {{questionId: string, selected: number}[]} answers
 */
export function gradeQuiz(questions, answers = []) {
  const selectedById = new Map(answers.map((a) => [a.questionId, a.selected]));

  const items = questions.map((q) => {
    const selected = selectedById.has(q.id) ? selectedById.get(q.id) : null;

    return { ...q, selected, isCorrect: selected === q.answer };
  });

  const correct = items.filter((item) => item.isCorrect).length;
  const unanswered = items.filter((item) => item.selected === null).length;

  return {
    items,
    correct,
    unanswered,
    incorrect: items.length - correct - unanswered,
    total: items.length,
    percent: items.length ? Math.round((correct / items.length) * 100) : 0,
  };
}

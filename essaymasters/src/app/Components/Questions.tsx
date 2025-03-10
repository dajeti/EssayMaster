"use client";

import { useState } from "react";
import { ThemeProvider } from "next-themes";


const Questions = () => {
  const [activeQuestion, setActiveQuestion] = useState<number>(-1);

  const questions = [
    {
      id: 0,
      question: "How does EssayMaster's Ai analyse my essay",
      answer:
        "EssayMaster's Ai reviews your essay by checking for errors in grammar, tone, clarity, and length. It then provides feedback on how to improve these aspects, offering specific suggestions for each issue.",
    },
    {
        id: 1,
        question: "What file formats can I to EssayMaster?",
        answer:
          "You can upload your essay as either a text input or a PDF file. The system can process both formats for analysis and feedback.",
      },
      {
        id: 2,
        question: "How does EssayMaster generate feedback for my essay?",
        answer:
          "EssayMaster uses natural language processing (NLP) to understand your writing and provide suggestions for grammar corrections, clearer sentence structures, and improved tone based on your selected features.",
      },
      {
        id: 3,
        question: "Can I customise the feedback categories?",
        answer:
          "Yes, you can create custom feedback categories based on your needs. In addition to the default categories like grammar and tone, you can request feedback on other specific areas of your essay",
      },
      {
        id: 4,
        question: "What does the scoring system evaluate?",
        answer:
          "The scoring system evaluates your essay based on predefined categories like grammar, clarity, tone, and length. Each category is assigned a grade, and an overall average score is calculated to track your progress.",
      },
      {
        id: 5,
        question: "How is my progress tracked over time?",
        answer:
          "EssayMaster tracks your progress by recording your scores for each essay. Visual charts display how your performance in different categories improves over time, helping you see your writing development.",
      },
      {
        id: 6,
        question: "How accurate is the feedback provided by EssayMaster?",
        answer:
          "EssayMaster's feedback is based on advanced AI algorithms and natural language processing, ensuring high accuracy. However, it's recommended to review the suggestions as the AI may not catch every nuance in complex writing.",
      },
      // Add more questions here

  ];

  const handleQuestionClick = (index: number) => {
    if (activeQuestion !== index) {
      setActiveQuestion(index);
    } else {
      setActiveQuestion(-1);
    }
  };

  return (
    <ThemeProvider attribute="class">
    <main className="flex items-center justify-center">
        
      <div className="w-full max-w-3xl shadow-2xl rounded-lg">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="hover:pointer flex w-full rounded-lg cursor-pointer flex-col border-b-2 py-4 font-sans text-white bg-blue-custom dark:bg-blue-custom-dark last:dark:border-none"
            onClick={() => handleQuestionClick(index)}
          >
            <div className="flex items-center">
              <button className="px-2 py-2 text-3xl font-bold opacity-90 dark:text-white lg:px-4">
                {activeQuestion === index ? "-" : "+"}
              </button>
              <h1 className="px-2 text-left text-lg font-semibold opacity-90 hover:underline dark:text-white lg:ml-4">
                {q.question}
              </h1>
            </div>
            {activeQuestion === index && (
              <div className="px-4 text-left opacity-90 text-slate-300 dark:text-slate-300 lg:mx-10">
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
    </ThemeProvider>
  );
};

export default Questions;

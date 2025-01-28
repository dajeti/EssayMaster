"use client";

import { useState } from "react";

const Questions = () => {
  const [activeQuestion, setActiveQuestion] = useState<number>(-1);

  const questions = [
    {
      id: 0,
      question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    },
    {
        id: 1,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      },
      {
        id: 2,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      },
      {
        id: 3,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      },
      {
        id: 4,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      },
      {
        id: 5,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
      },
      {
        id: 6,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
        answer:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
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
    <main className="flex items-center justify-center">
        
      <div className="w-full max-w-3xl shadow-2xl rounded-lg">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="hover:pointer flex w-full rounded-lg cursor-pointer flex-col border-b-2 py-4 font-sans bg-blue-custom last:dark:border-none"
            onClick={() => handleQuestionClick(index)}
          >
            <div className="flex items-center">
              <button className="px-2 py-2 text-3xl font-bold text-[#01243d] opacity-90 dark:text-white lg:px-4">
                {activeQuestion === index ? "-" : "+"}
              </button>
              <h1 className="px-2 text-left text-lg font-semibold text-[#01243d] opacity-90 hover:underline dark:text-white lg:ml-4">
                {q.question}
              </h1>
            </div>
            {activeQuestion === index && (
              <div className="px-4 text-left text-[#01243d] opacity-90 dark:text-slate-300 lg:mx-10">
                {q.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Questions;

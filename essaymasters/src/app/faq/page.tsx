import Questions from "../Components/Questions";
import Header from "../Components/Header";
import { ThemeProvider } from "next-themes";


const FaqsPage = () => {
  return (
    <ThemeProvider attribute="class">
    <div className="bg-white dark:bg-darker-custom">
      <div>
        <Header />
      </div>

      
      <div className="pt-20 md:pt-28 md:pb-24 px-6">
        <span className="block text-4xl font-bold text-center text-gray-800 dark:text-white">
          Have
        </span>

        <span className="block text-4xl font-bold text-center text-gray-800 dark:text-white">Questions?</span>
        
        <p className="block text-lg text-center text-gray-800 pt-5 dark:text-white">That's Great! We love answering questions,</p>
        <p className="block text-lg text-center text-gray-800 dark:text-white">here are some frequently asked ones...</p>

        <div className="mt-5">
          <Questions />
        </div>
        <h2 className="text-4xl font-semibold"></h2>
        <p className="text-md"></p>
      </div>
    </div>
    </ThemeProvider>
  );
};

export default FaqsPage;

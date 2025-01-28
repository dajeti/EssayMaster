import Questions from "../Components/Questions";
import Header from "../Components/Header";

const FaqsPage = () => {
  return (
    <div className="bg-white">
      <div>
        <Header />
      </div>

      
      <div className="pt-20 md:pt-28 md:pb-24 px-6">
        <span className="block text-4xl font-bold text-center text-gray-800">
          Have
        </span>

        <span className="block text-4xl font-bold text-center text-gray-800">questions?</span>
        
        <p className="block text-lg text-center text-gray-800 pt-5">That’s Great! We love answering questions,</p>
        <p className="block text-lg text-center text-gray-800">here are some frequently asked ones...</p>

        <div className="mt-5">
          <Questions />
        </div>
        <h2 className="text-4xl font-semibold"></h2>
        <p className="text-md"></p>
      </div>
    </div>
  );
};

export default FaqsPage;

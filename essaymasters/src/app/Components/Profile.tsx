"use client";
import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const Profile = () => {
  // Define state to manage dropdown open/close
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState(""); // State for first name
  const [lastName, setLastName] = useState(""); // State for last name
  const { data: session, status } = useSession();

  const router = useRouter();
  const redirectToDashboard = () => {
    router.push("/dashboard");
  };

  useEffect(() => {
    if (session?.user?.firstName) {
      console.log(session); // Log session to check the structure
      const fetchUserData = async () => {
        try {
          // fetching user data using the user ID from the session
          const response = await fetch("/api/userData"); // Call the API route
          const data = await response.json();
          if (response.ok) {
            setUserData({
              firstName: data.firstName,
              lastName: data.lastName,
            });
          } else {
            console.error("Error fetching user data:", data.message);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [session]);

  // Toggle the dropdown open/close
  const toggleDropdown = () => setDropdownOpen((prev) => !prev); // Toggle dropdown menu visibility

  console.log(session?.user);
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center h-full px-4 py-2 hover:underline focus:outline-none"
      >
        <UserCircleIcon className="h-8 w-8 text-white hover:cursor-pointer hover:text-blue-950 hover:shadow-lg" />
        <span>Welcome {session?.user?.email}</span>
      </button>

      {isDropdownOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-300 p-1">
          <button
            onClick={redirectToDashboard} // This is the redirect button
            className="mt-[-1px] w-full px-4 py-2 text-center text-white bg-green-500 hover:bg-green-700 rounded-lg"
            /* style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, green 0%, green 25%, white 25%, white 50%)',
                        backgroundSize: '15px 15px',
                    }} */
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2.5 w-full px-4 py-2 text-center text-white bg-blue-500 hover:bg-blue-700 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

{
  /* <div className="absolute-left-1/2 mt-1 w-48 bg-white shadow-lg rounded-lg border border-gray-200 translate-x-7"> */
}
{
  /* **Flex Column Layout for Dropdown** */
}
{
  /* <div className="flex flex-col items-center p-3"> */
}
{
  /* **Log out Button underneath** */
}

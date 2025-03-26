"use client";
import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import prisma from "@/lib/prisma";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { getSession } from "next-auth/react"; // To get the session

const Profile = () => {
    const { data: session, status } = useSession(); //session data using next-auth

    if (status === "loading") {
        return <div>Loading...</div>; // Add loading state while session is being fetched
    }

    if (!session?.user) {
        return <div>No user logged in</div>; // Handle the case when there is no session
    }

    // Proceed with rendering the user information
    const [userData, setUserData] = useState<{ firstName: string; lastName: string }>({ firstName: "", lastName: "" });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter(); // Create router object to navigate

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

    /* import prisma from "@/lib/prisma"; // Prisma client instance
    import { getSession } from "next-auth/react"; // To get the session
    
    // pages/api/userData.js
    export default async function handler(req, res) {
        const session = await getSession({ req });
    
        if (!session || !session.user?.firstName) {
            return res.status(401).json({ message: "User not authenticated" });
        }
    
        try {
            const user = await prisma.user.findUnique({
                where: { id: session.user.firstName }, // Use user.id here, not firstName
            });
    
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
    
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } */
    

   /*  <pages/api/userData /> */


    // Toggle the dropdown open/close
    const toggleDropdown = () => setIsDropdownOpen((prev) => !prev); // Toggle dropdown menu visibility

    const Logout = async () => {
        try {
            // Log out the user without an automatic redirect
            await signOut({ redirect: false });

            // Clear the token or any other user-related data from localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("userFirstName");
            localStorage.removeItem("userLastName");

            // Show alert after successful logout
            window.alert("You have been logged out.");

            // Log the logout action for debugging
            console.log("User logged out");

            // Redirect to login page after logout
            router.push("/login");
        } catch (error) {
            // Catch and log any errors during logout
            console.error("Error during logout:", error);
        }
    };

    const redirectToDashboard = () => {
        router.push("/dashboard");
    };

    return (
        <div>
            <button
                onClick={toggleDropdown}
                className="flex items-center h-full px-4 py-2 hover:underline focus:outline-none"
            >
                <UserCircleIcon className="h-8 w-8 text-white hover:cursor-pointer hover:text-blue-950 hover:shadow-lg" />
                &nbsp;
                <span> Welcome {userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : "Guest"}</span>
            </button>

            {isDropdownOpen && (
                <div className="flex flex-col items-center p-3">
                    <button
                        onClick={redirectToDashboard} // This is the redirect button
                        className="mt-4 w-full px-4 py-2 text-center text-white bg-green-500 hover:bg-green-700 rounded-lg"
                    /* style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, green 0%, green 25%, white 25%, white 50%)',
                        backgroundSize: '15px 15px',
                    }} */
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={Logout}
                        className="mt-4 w-full px-4 py-2 text-center text-white black bg-blue-500 hover:bg-blue-700 rounded-lg"
                    /* style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, blue 0%, blue 25%, white 25%, white 50%)',
                        backgroundSize: '15px 15px',
                    }} */
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;

{/* <div className="absolute-left-1/2 mt-1 w-48 bg-white shadow-lg rounded-lg border border-gray-200 translate-x-7"> */ }
{/* **Flex Column Layout for Dropdown** */ }
{/* <div className="flex flex-col items-center p-3"> */ }
{/* **Log out Button underneath** */ }
"use client";

import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const Profile = () => {
    // Define state to manage dropdown open/close
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [firstName, setFirstName] = useState(""); // State for first name
    const [lastName, setLastName] = useState(""); // State for last name 

    // Fetch user first name and last name from localStorage (or context / API)
    useEffect(() => {
        const storedFirstName = localStorage.getItem("usersFirstName");
        const storedLastName = localStorage.getItem("usersLastName");

        if (storedFirstName && storedLastName) {
            setFirstName(storedFirstName);
            setLastName(storedLastName);
        }
    }, []);


    // Toggle the dropdown open/close
    const toggleDropdown = () => {
        setDropdownOpen(!isDropdownOpen);
    };

    const Logout = () => {
        // Show alert when user logs out
        window.alert('You have been logged out.');
        // Clear the token or any other user-related data
        localStorage.removeItem("token");
        localStorage.removeItem("userFirstName");
        localStorage.removeItem("userLastName");
        // Handle the logout functionality here
        console.log('User logged out');
        // Example: localStorage.removeItem('token');
        // Redirect to login or home page, if needed
    };

    return (
        <div>
            <button onClick={toggleDropdown}
                className="flex items-center h-full px-4 py-2 hover:underline focus:outline-none"
            >
                <UserCircleIcon className="h-8 w-8 text-white hover:cursor-pointer hover:text-blue-950 hover:shadow-lg" />
                <span>Welcome{firstName && lastName ? `${firstName} ${lastName}` : " Guest"}</span>
            </button>

            {isDropdownOpen && (

                    <button
                        onClick={Logout}
                        className="mt-4 w-full px-4 py-2 text-center text-white bg-blue-500 hover:bg-blue-700 rounded-lg"
                    >
                        Logout
                    </button>

            )}
        </div>
    );
};

export default Profile;

{/* <div className="absolute-left-1/2 mt-1 w-48 bg-white shadow-lg rounded-lg border border-gray-200 translate-x-7"> */}
                    {/* **Flex Column Layout for Dropdown** */}
                    {/* <div className="flex flex-col items-center p-3"> */}
                    {/* **Log out Button underneath** */}
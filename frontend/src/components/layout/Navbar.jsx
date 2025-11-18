import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    queryClient.clear();
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <nav className="bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl text-black font-bold">
            Dashboard
          </Link>
          <Menu>
            {({ open }) => (
              <>
                <MenuButton className="hover:bg-gray-100 rounded-md p-2 flex items-center gap-2">
                  <span className="text-xl">👋</span>
                  <p className="text-xl font-bold">
                    Hello, {user ? user.username : "Guest"}
                  </p>
                  <svg
                    className={`w-4 h-4 text-black transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </MenuButton>
                <MenuItems
                  anchor="bottom center"
                  className="bg-blue-600 flex flex-col shadow-lg rounded-md py-2 min-w-[200px] mt-2 border-0"
                >
                  <MenuItem className="border-0">
                    <Link to="/profile" className="block">
                      <button className="text-white px-4 py-2 w-full text-left">
                        My Profile
                      </button>
                    </Link>
                  </MenuItem>
                  {user?.is_admin && (
                    <MenuItem className="border-0">
                      <Link to="/create-restaurant" className="block">
                        <button className="text-white px-4 py-2 w-full text-left">
                          Create a new restaurant
                        </button>
                      </Link>
                    </MenuItem>
                  )}
                  <MenuSeparator className="my-5 h-px bg-white w-4/5 mx-auto" />
                  <MenuItem className="mb-4 border-0">
                    <button onClick={handleLogout}>
                      <span className="text-black font-bold bg-white px-4 py-2 rounded-md">
                        Logout
                      </span>
                    </button>
                  </MenuItem>
                </MenuItems>
              </>
            )}
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import useAuthStore from "../../stores/authStore";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
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
            <MenuButton className="hover:bg-gray-100 rounded-md p-2">
              <p className="text-xl font-bold">
                Hello, {user ? user.username : "Guest"}
              </p>
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
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

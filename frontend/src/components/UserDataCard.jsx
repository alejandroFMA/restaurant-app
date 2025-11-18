import React from "react";
import useAuthStore from "../stores/authStore";

const UserDataCard = ({ user, onEdit }) => {
  const { user: currentUser } = useAuthStore();
  const isOwnProfile =
    currentUser?.id === user?.id || currentUser?._id === user?._id;
  const isAdmin = currentUser?.is_admin;

  // Mostrar email solo si es el propio usuario o admin
  const canViewEmail = isOwnProfile || isAdmin;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Personal Information
        </h2>
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            First Name
          </label>
          <p className="text-gray-800 mt-1">{user?.first_name || "N/A"}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Last Name
          </label>
          <p className="text-gray-800 mt-1">{user?.last_name || "N/A"}</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Username
          </label>
          <p className="text-gray-800 mt-1">{user?.username || "N/A"}</p>
        </div>

        {canViewEmail && (
          <div>
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Email
            </label>
            <p className="text-gray-800 mt-1">{user?.email || "N/A"}</p>
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Account Type
          </label>
          <p className="text-gray-800 mt-1">
            {user?.is_admin ? "Administrator" : "User"}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            Member Since
          </label>
          <p className="text-gray-800 mt-1">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDataCard;

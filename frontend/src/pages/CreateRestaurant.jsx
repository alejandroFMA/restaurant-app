import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import restaurantsAPI from "../api/restaurantsAPI";
import { restaurantSchema } from "../utils/validators/restaurant.schema";
import Spinner from "../components/Spinner";
import { showError } from "../utils/errorHandler";

const CreateRestaurant = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [operatingHours, setOperatingHours] = useState({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  });

  const { mutate: createRestaurant, isPending } = useMutation({
    mutationFn: (restaurant) => restaurantsAPI.createRestaurant(restaurant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      navigate("/dashboard");
    },
    onError: (error) => {
      showError(error);
    },
  });

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageError("");

    if (url && !isValidUrl(url)) {
      setImageError("Invalid URL");
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setImageError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const restaurantData = {
      name: name.trim(),
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      image: imageUrl.trim(),
      photograph: imageUrl.trim(),
      cuisine_type: cuisineType.trim(),
      operating_hours: {
        Monday: operatingHours.Monday.trim() || "Closed",
        Tuesday: operatingHours.Tuesday.trim() || "Closed",
        Wednesday: operatingHours.Wednesday.trim() || "Closed",
        Thursday: operatingHours.Thursday.trim() || "Closed",
        Friday: operatingHours.Friday.trim() || "Closed",
        Saturday: operatingHours.Saturday.trim() || "Closed",
        Sunday: operatingHours.Sunday.trim() || "Closed",
      },
    };

    const result = restaurantSchema.safeParse(restaurantData);

    if (!result.success) {
      const errorMessages = result.error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      showError(`Validation errors: ${errorMessages.join(", ")}`);
      return;
    }

    createRestaurant(result.data);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-8"
        >
          <div className="w-full md:w-1/2">
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100 aspect-video">
              {imageUrl && !imageError ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Image preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageError("Error loading image");
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Remove image
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-lg mb-2">Image preview</p>
                    <p className="text-sm">Enter an image URL</p>
                  </div>
                </div>
              )}
            </div>
            {imageError && (
              <p className="text-red-500 text-sm mt-2">{imageError}</p>
            )}
          </div>

          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://placeholder.pics/svg/300/DEDEDE/555555/Image"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Restaurant name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street name and number, Postal Code, City, Country (e.g., Calle Gran Vía 1, 28013, Madrid, Spain)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Neighborhood"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine type: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                placeholder="Cuisine type"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Operating Hours:
              </label>
              <div className="space-y-3">
                {Object.keys(operatingHours).map((day) => (
                  <div key={day}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {day}:
                    </label>
                    <input
                      type="text"
                      value={operatingHours[day]}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: e.target.value,
                        })
                      }
                      placeholder="e.g., 9:00 AM - 10:00 PM or Closed"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isPending && <Spinner className="h-5 w-5" />}
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRestaurant;

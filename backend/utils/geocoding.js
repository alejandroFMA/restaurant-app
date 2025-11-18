export const geocodeAddress = async (address) => {
  if (!address || typeof address !== "string" || address.trim() === "") {
    throw new Error("Address is required for geocoding");
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "RestaurantApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error("No coordinates found for the given address");
    }

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error("Invalid coordinates returned from geocoding service");
    }

    return { lat, lng };
  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw error;
  }
};

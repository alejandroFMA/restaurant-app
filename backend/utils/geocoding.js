export const geocodeAddress = async (address) => {
  if (!address || typeof address !== "string" || address.trim() === "") {
    throw new Error("Address is required for geocoding");
  }

  try {
    const cleanAddress = address.trim().replace(/\s+/g, " ");

    const encodedAddress = encodeURIComponent(cleanAddress);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1&extratags=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "RestaurantApp/1.0",
        "Accept-Language": "es,en",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      const postalCodeMatch = cleanAddress.match(/\b\d{4,5}\b/);

      const parts = cleanAddress
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
      let retryQuery = cleanAddress;

      if (parts.length > 1) {
        const lastParts = parts.slice(-2).join(", ");
        retryQuery = lastParts;
      } else if (postalCodeMatch) {
        const words = cleanAddress.split(/\s+/);
        const lastWord = words[words.length - 1];
        retryQuery = `${postalCodeMatch[0]} ${lastWord}`;
      }

      const encodedSimple = encodeURIComponent(retryQuery);
      const retryUrl = `https://nominatim.openstreetmap.org/search?q=${encodedSimple}&format=json&limit=1`;

      const retryResponse = await fetch(retryUrl, {
        headers: {
          "User-Agent": "RestaurantApp/1.0",
          "Accept-Language": "es,en",
        },
      });

      if (!retryResponse.ok) {
        throw new Error(`Geocoding API error: ${retryResponse.statusText}`);
      }

      const retryData = await retryResponse.json();

      if (!retryData || retryData.length === 0) {
        throw new Error(
          `No coordinates found for the given address: "${address}". Please verify the address is correct.`
        );
      }

      const result = retryData[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates returned from geocoding service");
      }

      return { lat, lng };
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

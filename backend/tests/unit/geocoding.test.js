import { jest } from "@jest/globals";

const { geocodeAddress: realGeocodeAddress } = await import(
  "../../utils/geocoding.js"
);

global.fetch = jest.fn();

describe("Geocoding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return coordinates for a valid address", async () => {
    const address = "123 Main St, Anytown, USA";
    const coordinates = { lat: 40.7128, lng: -74.006 };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          lat: coordinates.lat.toString(),
          lon: coordinates.lng.toString(),
        },
      ],
    });

    const result = await realGeocodeAddress(address);

    expect(result).toEqual(coordinates);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should throw an error for an invalid address", async () => {
    const address = "Invalid Address That Does Not Exist";

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    await expect(realGeocodeAddress(address)).rejects.toThrow(
      "No coordinates found"
    );
  });

  it("should throw an error for an empty address", async () => {
    const address = "";
    await expect(realGeocodeAddress(address)).rejects.toThrow(
      "Address is required for geocoding"
    );
  });

  it("should throw an error for a non-string address", async () => {
    const address = 123;
    await expect(realGeocodeAddress(address)).rejects.toThrow(
      "Address is required for geocoding"
    );
  });
});

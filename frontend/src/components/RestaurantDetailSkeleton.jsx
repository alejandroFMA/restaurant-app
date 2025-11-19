import React from "react";
import Skeleton from "./Skeleton";

const RestaurantDetailSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full h-64 bg-gray-200 rounded-lg animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <Skeleton type="title" className="h-8 w-64" />
          <Skeleton type="text" className="h-5 w-48" />
          <Skeleton type="text" className="h-5 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-4 items-center w-full">
          <Skeleton type="title" className="h-6 w-24" />
          <div className="flex flex-col gap-4 w-full max-w-3xl">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton type="circle" className="h-10 w-10" />
                  <Skeleton type="text" className="h-4 w-32" />
                </div>
                <Skeleton type="text" className="h-4 w-full" />
                <Skeleton type="text" className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:grid-cols-2 gap-4 rounded-lg p-4 w-max">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 ml-3">
                <Skeleton type="text" className="h-4 w-32" />
              </div>
            ))}
          </div>

          <div className="flex-1 max-w-lg">
            <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-4">
              <Skeleton type="text" className="h-4 w-24" />
              <Skeleton type="text" className="h-20 w-full" />
              <Skeleton type="text" className="h-10 w-32" />
            </div>
            <div className="flex flex-row gap-2 my-2">
              <Skeleton type="text" className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailSkeleton;

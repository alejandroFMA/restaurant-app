import Skeleton from "./Skeleton";

const RestaurantCardSkeleton = () => {
  return (
    <div className="my-4 p-4 rounded-md border border-gray-200">
      <Skeleton variant="image" className="h-40 mb-4" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Skeleton variant="title" className="w-48" />
          <Skeleton variant="text" className="w-24" />
        </div>
        <div className="flex flex-row gap-12 items-center">
          <div className="flex flex-row gap-1 items-center">
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-12" />
            <Skeleton variant="text" className="w-16" />
          </div>
          <Skeleton variant="text" className="w-20" />
        </div>
      </div>
    </div>
  );
};

export default RestaurantCardSkeleton;

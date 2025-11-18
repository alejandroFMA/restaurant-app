import Skeleton from "./Skeleton";

const UserDataCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl w-full">
      <div className="flex items-center justify-between mb-6">
        <Skeleton variant="title" className="w-48" />
        <Skeleton variant="text" className="w-12 h-8" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <Skeleton variant="text" className="w-24 h-3 mb-2" />
            <Skeleton variant="text" className="w-32 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDataCardSkeleton;

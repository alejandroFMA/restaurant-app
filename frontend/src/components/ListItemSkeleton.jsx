import Skeleton from "./Skeleton";

const ListItemSkeleton = ({ showImage = false }) => {
  return (
    <div className="flex flex-row items-center justify-between p-2 border-b border-gray-200 w-full max-w-2xl">
      {showImage && (
        <Skeleton variant="image" className="w-16 h-16 rounded mr-3" />
      )}
      <div className="flex-1">
        <Skeleton variant="title" className="w-48 mb-2" />
        <Skeleton variant="text" className="w-full" />
      </div>
      <Skeleton variant="text" className="w-12 h-8 ml-3" />
    </div>
  );
};

export default ListItemSkeleton;

const Skeleton = ({ className = "", type = "default" }) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded-md";

  const types = {
    default: `${baseClasses} h-4 w-full`,
    text: `${baseClasses} h-4 w-full`,
    title: `${baseClasses} h-6 w-full`,
    image: `${baseClasses} h-40 w-full`,
    circle: `${baseClasses} h-10 w-10 rounded-full`,
  };
  return <div className={`${types[type] || types.default} ${className}`} />;
};

export default Skeleton;

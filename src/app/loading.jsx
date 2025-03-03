export default function Loading() {
  // Relative sur la div qui entoure le layout + zindex sur le dropdown
  return (
    <div className="absolute  top-0 w-full h-full z-50 inset-0 flex items-center justify-center ">
      <span className="animate-spin w-14 h-14 mb-44 border-4 border-gray-300 border-t-blue-500 rounded-full"></span>
    </div>
  );
}

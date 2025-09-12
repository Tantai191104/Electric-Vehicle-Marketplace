const InputWithIcon: React.FC<{
  type: string;
  placeholder: string;
  icon: React.ReactNode;
}> = ({ type, placeholder, icon }) => (
  <div className="flex items-center border-b border-gray-300 py-4 focus-within:border-yellow-500 transition-all duration-300">
    {icon}
    <input
      type={type}
      placeholder={placeholder}
      className="bg-transparent outline-none flex-1 text-gray-800 placeholder-gray-400 ml-3 text-lg font-medium"
    />
  </div>
);
export default InputWithIcon;

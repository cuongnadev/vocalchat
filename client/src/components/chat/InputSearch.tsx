import { Search } from "lucide-react";

type InputSearchProps = {
  className?: string;
};

export const InputSearch = ({ className }: InputSearchProps) => {
  return (
    <div className={className}>
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search on VocalChat"
          className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00FFFF] transition-all duration-300"
        />
      </div>
    </div>
  );
};

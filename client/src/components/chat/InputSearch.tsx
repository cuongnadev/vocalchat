import { Search } from "lucide-react";
import { Input } from "../ui/input/input";

type InputSearchProps = {
  className?: string;
};

export const InputSearch = ({ className }: InputSearchProps) => {
  return (
    <div className={className}>
      <Input
        placeholder="Search on VocalChat"
        icon={<Search size={18} />}
        iconPosition="left"
        variant="third"
        radius="full"
      />
    </div>
  );
};

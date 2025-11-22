import { Search } from "lucide-react";
import { Input } from "../ui/input/input";

type InputSearchProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
};

export const InputSearch = ({
  className,
  value,
  onChange,
}: InputSearchProps) => {
  return (
    <div className={className}>
      <Input
        placeholder="Search on VocalChat"
        icon={<Search size={18} />}
        iconPosition="left"
        variant="third"
        radius="full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  globalFilter: string;
  setGlobalFilter: (val: string) => void;
}

export default function UserTableHeader({
  globalFilter,
  setGlobalFilter,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
      <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
      <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
        <Input
          placeholder="Tìm kiếm người dùng  ..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full sm:w-64"
        />
        <Button variant="outline" onClick={() => setGlobalFilter("")}>
          Xóa
        </Button>
      </div>
    </div>
  );
}

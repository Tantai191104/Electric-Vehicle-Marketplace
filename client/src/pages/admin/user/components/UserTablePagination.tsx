import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/authType";
import type { Table } from "@tanstack/react-table";

interface Props {
  table: Table<User>;
  pageSize: number;
  setPageSize: (val: number) => void;
}

export default function UserTablePagination({
  table,
  pageSize,
  setPageSize,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          Trước
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!table.getCanNextPage()}
          onClick={() => table.nextPage()}
        >
          Sau
        </Button>
        <span className="text-sm text-gray-600">
          Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Số dòng mỗi trang:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(val) => {
            setPageSize(Number(val));
            table.setPageIndex(0);
          }}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-600">
          Tổng: {table.getCoreRowModel().rows.length} người dùng
        </span>
      </div>
    </div>
  );
}

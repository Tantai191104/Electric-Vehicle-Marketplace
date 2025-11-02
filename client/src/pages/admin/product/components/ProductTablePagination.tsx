import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/productType";
import type { Table } from "@tanstack/react-table";

interface Props {
    table: Table<Product>;
    pageSize: number;
    setPageSize: (val: number) => void;
}

export default function ProductTablePagination({
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
                    Trang {table.getState().pagination.pageIndex + 1} / {Math.max(1, table.getPageCount())}
                    {table.getPageCount() > 0 && (
                        <span className="text-gray-500 ml-1">
                            ({table.getRowModel().rows.length} sản phẩm trên trang này)
                        </span>
                    )}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Số dòng mỗi trang:</span>
                <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => {
                        const newPageSize = Number(val);
                        setPageSize(newPageSize);
                        table.setPageSize(newPageSize);
                        table.setPageIndex(0);
                    }}
                    disabled={false}
                >
                    <SelectTrigger className="w-20" disabled={false}>
                        <SelectValue placeholder={pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                        {[5, 10, 20, 50].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                    Hiển thị {table.getRowModel().rows.length} / {table.getCoreRowModel().rows.length} sản phẩm
                </span>
            </div>
        </div>
    );
}
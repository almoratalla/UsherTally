import React from "react";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps {
    table: Table<any>;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
    table,
}) => {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                >
                    {"<<"}
                </button>
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-2 py-1 border rounded ml-2 disabled:opacity-50"
                >
                    {"<"}
                </button>
                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-2 py-1 border rounded ml-2 disabled:opacity-50"
                >
                    {">"}
                </button>
                <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="px-2 py-1 border rounded ml-2 disabled:opacity-50"
                >
                    {">>"}
                </button>
            </div>
            <span className="ml-4">
                Page{" "}
                <strong>
                    {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </strong>
            </span>
            {/* <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                }}
                className="ml-4 border px-2 py-1 rounded"
            >
                {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                        Show {pageSize}
                    </option>
                ))}
            </select> */}
        </div>
    );
};

export default DataTablePagination;

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";

type TableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData?: React.Dispatch<React.SetStateAction<TData[]>>;
  page?: [
    PaginationState,
    React.Dispatch<React.SetStateAction<PaginationState>>
  ];
  count?: number;
};

export function Table<TData, TValue>({
  columns,
  data,
  setData,
  page,
  count,
}: TableProps<TData, TValue>) {
  const [pagination, setPagination] = page || [{} as PaginationState, () => {}];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    manualPagination: !!count,
    rowCount: count || data?.length || 0,
    state: {
      pagination,
    },
    meta: {
      updateData: (rowIndex: number, columnId: string, value: string) => {
        if (setData) {
          setData((old) =>
            old.map((row, index) => {
              if (index === rowIndex) {
                return {
                  ...old[rowIndex],
                  [columnId]: value,
                };
              }
              return row;
            })
          );
        }
      },
    },
  });
  return (
    <div className="grid gap-2 overflow-x-auto">
      <table className="table table-bordered table-md table-zebra">
        <thead className="bg-base-300 font-bold">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {count && (
        <div className="flex justify-center gap-2">
          <button
            className="btn btn-primary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="rowsPerPage" className="label">
              Rows per page:
            </label>
            <select
              id="rowsPerPage"
              className="select select-auto"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {Array.from(new Set([count, 15, 25, 50, 100, 500]))
                .sort((a, b) => a - b)
                .map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

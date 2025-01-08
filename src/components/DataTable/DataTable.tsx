import { useEffect, useCallback, useState, useRef } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  Row,
  Column,
  SortingState,
  getFilteredRowModel,
  getSortedRowModel,
  getFacetedRowModel,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@components/ui/button";
import ColumnHeader from "./ColumnHeader";
import { Skeleton } from "@components/ui/skeleton";
import InfiniteScrollWrapper from "../InfiniteScroll";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  manualPagination?: boolean;
  className?: string;
  totalRows?: number;
  pageSize?: number;
  currentPage?: number;
  defaultSort?: SortingState;
  onEndReached?: () => void;
  onNearEnd?: () => void;
  onPageChange?: (obj: { page: number; pageSize: number }) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onRowClick?: (row: TData) => void;
  loading?: boolean;
  loadingMore?: boolean;
};

const MIN_TABLE_WIDTH = 900;
export default function DataTable<TData, TValue>({
  columns = [],
  manualPagination = false,
  data = [],
  defaultSort,
  onNearEnd,
  onEndReached,
  className = "",
  totalRows = 0,
  pageSize = 10,
  currentPage = 0,
  onPageChange,
  onSortingChange,
  onRowClick,
  loading = false,
  loadingMore = false,
}: DataTableProps<TData, TValue>) {
  const containerRef = useRef<HTMLTableElement | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [tableData, setTableData] = useState<{
    rows: TData[];
    columns: Column<any>[];
  }>({
    rows: data || [],
    columns: [],
  });

  const table = useReactTable({
    columns: tableData.columns,
    data: tableData.rows,
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
    pageCount: Math.ceil(totalRows / pageSize),
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      const newSort =
        typeof updater === "function" ? updater(sorting) : updater;

      onSortingChange?.(newSort);
      setSorting(newSort);
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: currentPage - 1, pageSize })
          : updater;
      onPageChange?.({
        page: newPagination.pageIndex + 1,
        pageSize: newPagination.pageSize,
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
  });

  const updateColumnWidths = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const table = container.querySelector("table");
    const firstRow = container.querySelector("table tbody tr");

    const header: HTMLDivElement | null = container.querySelector(
      "div[data-table-header]"
    );

    if (header) header.style.width = table?.parentElement?.clientWidth + "px";

    const headerColumns: HTMLDivElement[] = Array.from(
      container.querySelectorAll("div[data-col]")
    ).map((e) => e.parentElement as HTMLDivElement);

    const rowColumns = Array.from(firstRow?.querySelectorAll("td") || []);

    if (rowColumns.length === headerColumns.length)
      rowColumns.forEach((column, i) => {
        const header: HTMLDivElement = headerColumns[i];
        const width = column.clientWidth;
        if (header) {
          header.style.width = width + "px";
        }
      });
  }, []);

  const handleTableScroll = useCallback((event: any) => {
    const container = containerRef.current;
    const header: HTMLDivElement | null = container!.querySelector(
      "div[data-table-header]"
    );
    const target = event.target;

    const scrolled = target.scrollLeft;

    if (header)
      header.scrollTo({
        left: scrolled,
        behavior: "smooth",
      });
  }, []);

  const getColumnsData = useCallback(
    (cols: Array<any>): Column<any>[] => {
      const newCols = cols.map((item) => {
        const obj = {
          ...item,
          header: item.headerRenderer
            ? item.headerRenderer
            : ({ column }: { column: any }) => (
                <ColumnHeader
                  column={column}
                  title={item.header || item.title}
                  allowSort={item.allowSort || item.allowSort === undefined}
                />
              ),
          cell: item.cellRenderer
            ? item.cellRenderer
            : ({ row }: { row: Row<any> }) => {
                const value: any = row.getValue(item.key || item.accessorKey);

                return (
                  <div
                    className={`flex items-center gap-1 ${
                      item.cellClassName || ""
                    }`}
                    style={{
                      minWidth: item.minWidth ? item.minWidth + "px" : "",
                      whiteSpace: item.noWrap ? "no-wrap" : "",
                    }}
                  >
                    {typeof item.maxLength === "number" &&
                    typeof value === "string" &&
                    value.length > item.maxLength
                      ? value.slice(0, item.maxLength) + "..."
                      : (value as React.ReactNode)}
                  </div>
                );
              },
          filterFn: item.allowFilter
            ? (row: Row<TData>, id: string, value: string | any) => {
                return value.includes(row.getValue(id));
              }
            : undefined,
          accessorKey: item.accessorKey || item.key,
          enableSorting: item.allowSort || item.allowSort === undefined,
        };

        return obj;
      });

      return newCols.filter((e) => e);
    },
    [columns, data]
  );

  useEffect(() => {
    const colData = getColumnsData(columns);

    setTableData({
      rows: data,
      columns: colData,
    });

    updateColumnWidths();
    setTimeout(updateColumnWidths, 150);
  }, [columns, data]);

  useEffect(() => {
    if (defaultSort) {
      setSorting(defaultSort);
      onSortingChange?.(defaultSort);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const tableParent = container!.querySelector("table")?.parentElement;

    if (tableParent) tableParent.addEventListener("scroll", handleTableScroll);

    updateColumnWidths();
    setTimeout(() => {
      updateColumnWidths();
    }, 100);
    window.addEventListener("resize", updateColumnWidths);

    return () => {
      window.removeEventListener("resize", updateColumnWidths);

      if (tableParent)
        tableParent.removeEventListener("scroll", handleTableScroll);
    };
  }, []);

  const tableJsx = (
    <Table className={`min-w-[${MIN_TABLE_WIDTH}px]`}>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, i) => (
            <TableRow
              key={row.id}
              data-index={i}
              data-state={row.getIsSelected() && "selected"}
              onClick={() => onRowClick?.(row.original)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onRowClick?.(row.original);
                }
              }}
              tabIndex={0}
              className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:bg-gray-100"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="relative px-2 py-4">
                  {loading ? (
                    <Skeleton className="h-6 w-full" />
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div ref={containerRef} className={`${className} max-w-full relative`}>
      {/* custom header to have sticky head  */}
      <div
        data-table-header="true"
        className="sticky top-0 z-[50] overflow-hidden"
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            style={{
              minWidth: MIN_TABLE_WIDTH + "px",
            }}
            className={`flex w-[${MIN_TABLE_WIDTH}px]`}
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="font-medium text-gray-500 px-2 py-4 bg-[#F9FAFB] relative"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {manualPagination ? (
        tableJsx
      ) : (
        <InfiniteScrollWrapper
          onScrolledEnd={onEndReached}
          stripeHeight={650}
          onNearEnd={onNearEnd}
        >
          {tableJsx}
          {loadingMore ? (
            <p className="text-center font-sm font-medium">Loading...</p>
          ) : (
            ""
          )}
        </InfiniteScrollWrapper>
      )}

      {/* Pagination Controls */}
      {manualPagination && (
        <div className="flex flex-wrap gap-2 items-center justify-between p-4">
          <div className="text-xs sm:text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Select
              defaultValue={table.getState().pagination.pageSize + ""}
              onValueChange={(value) => table.setPageSize(parseInt(value))}
            >
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize + ""}>
                    {pageSize} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2 items-center">
              <Button
                variant={"outline"}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                variant={"outline"}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

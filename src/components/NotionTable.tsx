import React, { useMemo, useState, useEffect, MutableRefObject } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Header,
  PaginationState,
  FilterFn,
  getPaginationRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Save,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddNewRow } from "./AddNewRow";

interface DataTableProps {
  columns: string[];
  csvFileId?: number;
  data: Record<string, string>[];
  onlyPreview?: boolean;
  height?: string;
  width?: string;
  pageSize?: number;
  reorderColumns?: (columnHeaders: string[]) => void;
  updateRowData?: (rowData: Record<string, string>[]) => void;
  passSelectedRowToParent?: MutableRefObject<(() => Record<string, string>[]) | null>;

}

function DraggableHeader({ header, isSelectColumn = false }: { header: Header<any, unknown>, isSelectColumn?: boolean }) {
  const column = header.column;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: column.id });

  const width = header.getSize();

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "#f8f9fa" : undefined,
    width, // Lock the width
    minWidth: width,
    maxWidth: width,
    boxSizing: "border-box",
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-4 py-2 relative bg-muted select-none whitespace-nowrap"
    >
      <div className={`flex items-center justify-between group`}>
        {/* Header Content */}
        <div
          className={`flex-grow flex items-center ${
            column.getCanSort() ? "cursor-pointer" : ""
          }`}
          onClick={column.getCanSort() ? column.getToggleSortingHandler() : undefined}
        >
          {flexRender(column.columnDef.header, header.getContext())}
          {column.getCanSort() && (
            <span className="ml-2">
              {{
                asc: <ArrowUpDown className="h-4 w-4" />,
                desc: <ArrowUpDown className="h-4 w-4" />,
              }[column.getIsSorted() as string] ?? <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
            </span>
          )}
        </div>

        {/* Drag Handle - Only show if not select column */}
        {!isSelectColumn && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="ml-2 cursor-grab text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>Drag headers to reorder</TooltipContent>
          </Tooltip>
        )}
      </div>
    </th>
  );
}

// Define the custom fuzzy filter function outside the component
const fuzzyFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const cellValue = String(row.getValue(columnId) || '').toLowerCase();
  const search = String(filterValue || '').toLowerCase();
  return cellValue.includes(search);
};


export function DataTable({
  columns,
  data,
  onlyPreview = false,
  height = "auto",
  width = "100%",
  pageSize = 10,
  reorderColumns,
  updateRowData,
  passSelectedRowToParent,
  csvFileId
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeCell, setActiveCell] = useState<{ row: number; column: string } | null>(null);
  const [editedData, setEditedData] = useState<Record<string, string>[]>([...data]);
  const [changedRows, setChangedRows] = useState<Set<number>>(new Set());
  const [columnsOrder, setColumnsOrder] = useState(columns);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // --- FIX START: Separated useEffects ---

  // Effect 1: Initialize/Reset editedData ONLY when the parent `data` prop changes
  // This ensures unsaved edits are preserved across filtering.
  useEffect(() => {
    setEditedData([...data]);
    setChangedRows(new Set()); // Reset changed rows when initial data changes
    setRowSelection({}); // Reset row selection when data changes
  }, [data]);

  // Effect 2: Reset pagination to page 0 ONLY when filter criteria change
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [columnFilters, globalFilter]);

  // --- FIX END ---

  const tableColumns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    const baseColumns = columnsOrder.map((column) => ({
      accessorKey: column,
      header: column,
      enableColumnFilter: true,
      enableSorting: true,
      filterFn: fuzzyFilter,
    }));
  
    if (onlyPreview) {
      return baseColumns;
    }
  
    const selectColumn: ColumnDef<Record<string, string>> = {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="w-4 h-4"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
      enableSorting: false,
      enableColumnFilter: false,
    };
  
    return [selectColumn, ...baseColumns];
  }, [columnsOrder, onlyPreview]);  

  const tempTable = useReactTable({
    data: editedData, // Use editedData here as it contains current edits
    columns: tableColumns,
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pageCount = Math.ceil(tempTable.getFilteredRowModel().rows.length / pagination.pageSize);

  const table = useReactTable({
    data: editedData, // Use editedData as the source for the main table as well
    columns: tableColumns,
    state: onlyPreview
      ? {}
      : {
          sorting,
          columnFilters,
          globalFilter,
          columnVisibility,
          pagination,
          rowSelection,
        },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: pageCount,
  });

  useEffect(() => {
    if (passSelectedRowToParent) {
      // TypeScript now understands that `current` is mutable
      passSelectedRowToParent.current = () => {
        return table.getSelectedRowModel().flatRows.map(row => row.original);
      };
    }
  }, [passSelectedRowToParent, table]); 

  const currentPageRows = table.getFilteredRowModel().rows.slice(
    table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize
  );

  const handleCellChange = (originalRowIndex: number, key: string, value: string) => {
    setEditedData((prev) => {
      const updated = [...prev];
      // Ensure the original index is valid and the row exists before updating
      if (originalRowIndex >= 0 && originalRowIndex < updated.length) {
        updated[originalRowIndex] = { ...updated[originalRowIndex], [key]: value };
        setChangedRows((prevSet) => new Set(prevSet).add(originalRowIndex));
      } else {
        console.warn(`Attempted to update row at invalid index: ${originalRowIndex}`);
      }
      return updated;
    });
  };

  const saveChanges = () => {
    const changed = Array.from(changedRows).map((idx) => editedData[idx]);
    console.log("Saving rows:", changed);
    // Here you would typically call an API to save `changed` data
    setChangedRows(new Set());
    setActiveCell(null);
    if(updateRowData) updateRowData(changed);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    currentRowIdxOnPage: number,
    key: string
  ) => {
    // Early return if current column is 'select'
    if (key === "select") return;
  
    // Filter out the 'select' column
    const visibleColumns = table
      .getVisibleFlatColumns()
      .map((col) => col.id)
      .filter((id) => id !== "select");
  
    const colIdx = visibleColumns.indexOf(key);
    const currentPaginatedRows = currentPageRows;
  
    if (e.key === "ArrowRight") {
      if (colIdx < visibleColumns.length - 1) {
        setActiveCell({
          row: currentRowIdxOnPage,
          column: visibleColumns[colIdx + 1],
        });
      } else if (currentRowIdxOnPage < currentPaginatedRows.length - 1) {
        setActiveCell({
          row: currentRowIdxOnPage + 1,
          column: visibleColumns[0],
        });
      } else if (table.getCanNextPage()) {
        table.nextPage();
        setActiveCell({
          row: 0,
          column: visibleColumns[0],
        });
      }
    } else if (e.key === "ArrowLeft") {
      if (colIdx > 0) {
        setActiveCell({
          row: currentRowIdxOnPage,
          column: visibleColumns[colIdx - 1],
        });
      } else if (currentRowIdxOnPage > 0) {
        setActiveCell({
          row: currentRowIdxOnPage - 1,
          column: visibleColumns[visibleColumns.length - 1],
        });
      } else if (table.getCanPreviousPage()) {
        table.previousPage();
        setActiveCell({
          row: table.getState().pagination.pageSize - 1,
          column: visibleColumns[visibleColumns.length - 1],
        });
      }
    } else if (e.key === "ArrowDown") {
      if (currentRowIdxOnPage < currentPaginatedRows.length - 1) {
        setActiveCell({ row: currentRowIdxOnPage + 1, column: key });
      } else if (table.getCanNextPage()) {
        table.nextPage();
        setActiveCell({ row: 0, column: key });
      }
    } else if (e.key === "ArrowUp") {
      if (currentRowIdxOnPage > 0) {
        setActiveCell({ row: currentRowIdxOnPage - 1, column: key });
      } else if (table.getCanPreviousPage()) {
        table.previousPage();
        setActiveCell({
          row: table.getState().pagination.pageSize - 1,
          column: key,
        });
      }
    }
  };
  

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedColumn(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedColumn(null);
    if (active?.id && over?.id && active.id !== over.id) {
      const oldIndex = columnsOrder.indexOf(active.id as string);
      const newIndex = columnsOrder.indexOf(over.id as string);
      const newOrder = arrayMove(columnsOrder, oldIndex, newIndex);
      setColumnsOrder(newOrder);
      if(reorderColumns) reorderColumns(newOrder);
    }
  };

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <TooltipProvider>
      <div className="space-y-4 px-1">
        {!onlyPreview && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(event) => {
                  setGlobalFilter(event.target.value);
                }}
                className="w-64"
              />
              <div className="flex items-center gap-2">
                {selectedCount > 0 && (
                  <span className="text-sm text-muted-foreground border border-muted-foreground rounded-md px-2 py-1">
                    {selectedCount} Rows Selected
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {csvFileId ? (
                <div>
                  <AddNewRow 
                    csvFileId={csvFileId} 
                    columnHeader={columnsOrder} 
                  />
                </div>
              ):""}
              <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
                <Search className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide() && column.id !== "select")
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {changedRows.size > 0 && (
                <Button variant="default" onClick={saveChanges}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              )}
            </div>
          </div>
        )}

        <div
          className="rounded-md border overflow-hidden"
          style={{ maxHeight: height, width }}
        >
          <div className="overflow-x-auto">
            <div
              className="overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
              style={{ maxHeight: height }}
            >
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
              >
                <table className="w-full text-sm text-left border-collapse" >
                  <thead className="bg-muted text-muted-foreground">
                    <SortableContext
                      items={columnsOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            header.column.id === "select" ? (
                              <th
                                key={header.id}
                                className="px-4 py-2 relative bg-muted select-none whitespace-nowrap"
                                style={{ width: header.getSize() }}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ) : (
                              <DraggableHeader 
                                key={header.id} 
                                header={header} 
                                isSelectColumn={header.column.id === "select"}
                              />
                            )
                          ))}
                        </tr>
                      ))}
                      {showFilters && (
                        <tr className="bg-muted-foreground/10">
                          {table.getAllLeafColumns().map((column) => (
                            <th key={column.id} className="px-4 py-1">
                              {column.getCanFilter() && column.getIsVisible() ? (
                                <Input
                                  value={(column.getFilterValue() ?? "") as string}
                                  onChange={(e) => {
                                    column.setFilterValue(e.target.value);
                                  }}
                                  placeholder={`Filter ${column.id}`}
                                  className="w-full"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : null}
                            </th>
                          ))}
                        </tr>
                      )}
                    </SortableContext>
                  </thead>
                  <tbody>
                    {/* Render only the paginated rows */}
                    {currentPageRows.length ? (
                      currentPageRows.map((row, rowIdx) => (
                        <tr
                          key={row.id}
                          className={`border-b ${
                            changedRows.has(row.index) ? "bg-muted-foreground/10" : ""
                          } ${
                            row.getIsSelected() ? "bg-muted-foreground/10" : ""
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => {
                            const cellKey = cell.column.id;
                            const isActive =
                              activeCell?.row === rowIdx && 
                              activeCell?.column === cellKey &&
                              cellKey !== "select"; // Skip active state for select column

                            return (
                              <td
                                key={cell.id}
                                className={`px-4 py-2 align-middle ${
                                    isActive ? "border-2 border-blue-500" : ""
                                  }`}
                                onClick={() => {
                                  if (!onlyPreview && cellKey !== "select") {
                                    setActiveCell({ row: rowIdx, column: cellKey });
                                  }
                                }}
                              >
                                {isActive && !onlyPreview ? (
                                  <input
                                    autoFocus
                                    value={editedData[row.index]?.[cellKey] ?? ""}
                                    onChange={(e) => handleCellChange(row.index, cellKey, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, rowIdx, cellKey)}
                                    onBlur={() => setActiveCell(null)}
                                    className="w-full h-full px-0 py-0 outline-none border-none bg-transparent font-inherit text-sm"
                                    />
                                ) : (
                                  flexRender(cell.column.columnDef.cell, cell.getContext())
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columnsOrder.length + 1} className="text-center px-4 py-2">
                          No results.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </DndContext>
            </div>
          </div>

          {/* Pagination UI */}
          <div className="flex items-center justify-between px-4 py-1 border-t bg-background sticky bottom-0">
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
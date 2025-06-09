/**
 * CsvTableRow Component
 * 
 * A component that displays a CSV file's data in a sheet format with advanced table functionality.
 * Provides features for viewing, exporting, and managing CSV data.
 * 
 * Features:
 * - Expandable sheet view with full data table
 * - Data export functionality
 * - Row selection and management
 * - Column reordering
 * - Pagination
 * - Loading states
 */

import { getCsvRows, reorderCsvColumns, useQuery, updateRowData } from 'wasp/client/operations';
import type { RowToUpdate } from '../models/csvRow';
import type { CsvRow } from 'wasp/entities';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../components/ui/sheet";
import { ChevronLeft } from "lucide-react";
import { DataTable } from "../components/NotionTable";
import { ExportCsv } from "../components/ExportCsv";
import { useState, useRef, useCallback } from "react";
import { Loader } from "../components/Loader";

// Type definitions
interface CsvTableRowProps {
  csvFile: {
    id: number;
    fileName: string;
    columnHeaders: string;
  };
  triggerClassName?: string;
}

export function CsvTableRow({
  csvFile,
  triggerClassName,
}: CsvTableRowProps) {
  // State management
  const [open, setOpen] = useState(false);
  
  // Ref for selected rows data
  const selectedRowRef = useRef<(() => Record<string, string>[]) | null>(null);

  // Fetch CSV rows data when sheet is opened
  const { data: rows, isLoading } = useQuery(getCsvRows, { 
    csvFileId: csvFile.id 
  }, {
    enabled: open // Only fetch when sheet is open for performance
  });

  /**
   * Handles the request for CSV row data based on selection type
   * @param type - "all" or "selected" to determine which rows to return
   * @returns Promise with the requested rows data or null if no data available
   */
  const handleRowRequestData = useCallback(async (type: "all" | "selected"): Promise<Record<string, string>[] | null> => {
    if (!rows) return null;

    if (type === "selected") {
      return selectedRowRef.current?.() || null;
    }

    // Map row data to the expected format
    return rows.map((r) => {
      if (typeof r.rowData === 'object' && r.rowData !== null && !Array.isArray(r.rowData)) {
        return r.rowData as Record<string, string>;
      }
      return {};
    });
  }, [rows]);

  /**
   * Handles column reordering in the CSV file
   * @param columnHeaders - New order of column headers
   */
  const handleReorderColumns = useCallback(async (columnHeaders: string[]) => {
    try {
      await reorderCsvColumns({
        id: csvFile.id,
        columnHeaders: JSON.stringify(columnHeaders)
      });
    } catch (error) {
      console.error("Error reordering columns:", error);
    }
  }, [csvFile.id]);

  /**
   * Handles updates to row data
   * @param rowData - Array of updated row data
   */
  const handleUpdateRowData = useCallback(async (rowData: Record<string, string>[]) => {
    try {
      const rowsToUpdate: RowToUpdate[] = rowData.map(row => {
        const { id, ...rest } = row;
        return {
          id: parseInt(id),
          rowData: rest as Pick<CsvRow, "rowData">,
        };
      });

      await updateRowData({ rowsToUpdate });
    } catch (error) {
      console.error("Error updating row data:", error);
    }
  }, [csvFile.id]);

  /**
   * Transforms raw row data into table format
   * @param rowData - Raw row data from the database
   * @returns Formatted row data with ID
   */
  const transformRowData = useCallback((rowData: any) => {
    if (typeof rowData.rowData === 'object' && rowData.rowData !== null && !Array.isArray(rowData.rowData)) {
      return {
        ...(rowData.rowData as Record<string, string>),
        id: rowData.id.toString(),
      };
    }
    return { id: rowData.id.toString() };
  }, []);

  // Parse column headers once
  const parsedColumnHeaders = csvFile.columnHeaders?.length 
    ? JSON.parse(csvFile.columnHeaders) 
    : [];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Clickable filename to open the sheet */}
      <SheetTrigger asChild>
        <span className={`!text-md cursor-pointer hover:underline ${triggerClassName}`}>
          {csvFile.fileName}
        </span>
      </SheetTrigger>

      {/* Full-screen sheet content */}
      <SheetContent
        side="right"
        className="fixed inset-0 z-50 w-screen h-screen max-w-none bg-background p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header section with navigation and export */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <ChevronLeft
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
              />
              <div>
                <div className="text-md font-bold leading-none">
                  {csvFile.fileName}
                </div>
                <div className="text-[12px] text-foreground">
                  Records: {rows?.length || 0}
                </div>
              </div>
            </div>
            <ExportCsv
              csvFile={{ columnHeader: parsedColumnHeaders }}
              getCsvRows={handleRowRequestData}
            />
          </div>

          {/* Table content area */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <Loader text="Loading Data..." size="lg" />
            ) : (
              <DataTable
                columns={parsedColumnHeaders}
                data={rows?.map(transformRowData) || []}
                height="600px"
                pageSize={20}
                reorderColumns={handleReorderColumns}
                updateRowData={handleUpdateRowData}
                passSelectedRowToParent={selectedRowRef}
                csvFileId={csvFile.id}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

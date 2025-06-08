import { getCsvRows, reorderCsvColumns, useQuery, updateRowData } from 'wasp/client/operations';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '../components/ui/sheet';
import { DataTable } from '../components/NotionTable';
import { ChevronLeft, Download } from 'lucide-react';
import { CsvFile, CsvRow } from 'wasp/entities';
import { MutableRefObject, useCallback, useRef, useState } from 'react';
import { toast } from '../hooks/use-toast';
import { RowToUpdate } from '../models/csvRow';
import { ExportCsv } from '../components/ExportCsv';

type CsvTableRowProps = {
  csvFile: CsvFile;
  triggerText?: string;
  triggerClassName?: string;
};

type GetSelectedRowsFunction = () => Record<string, string>[];

export function CsvTableRow({
  csvFile,
  triggerClassName,
}: CsvTableRowProps) {
  const [open, setOpen] = useState(false);
  const selectedRowRef: MutableRefObject<GetSelectedRowsFunction | null> = useRef(null);
  const { data: rows, isLoading } = useQuery(
    getCsvRows,
    { csvFileId: csvFile.id },
    { enabled: open }
  );

  const handleReorderColumns = useCallback(
    async (updatedColumns: string[]) => {
      try {
        await reorderCsvColumns({
          columnHeaders: JSON.stringify(updatedColumns),
          id: csvFile.id,
        });
        toast({title :'Column order updated successfully'});
      } catch (error) {
        console.error(error);
        toast({title : (error as Error).message ||'Failed to update column order', variant: 'destructive'});
      }
    },
    [csvFile.id] // re-memoize only if file ID changes
  );

  const handleUpdateRowData = useCallback(
    async (rowData: Record<string, string>[]) => {
      try {
        const rowsToUpdate: RowToUpdate[] = rowData.map((row) => {
          const { id, ...rest } = row;
          return {
            id:parseInt(id),
            rowData: rest as Pick<CsvRow, "rowData">,
          };
        });
  
        await updateRowData({ rowsToUpdate });
  
        toast({ title: 'Changes saved successfully' });
      } catch (error) {
        console.error(error);
        toast({
          title: (error as Error).message || 'Failed to update column order',
          variant: 'destructive',
        });
      }
    },
    [csvFile.id]
  );

  const handleRowRequestData = useCallback(async (type: "all" | "selected"): Promise<Record<string, string>[] | null> => {
    if(type === "selected"){
      if (selectedRowRef.current && typeof selectedRowRef.current === 'function') {
        // Call the function exposed by ChildA through the ref
        const data = selectedRowRef.current();
        return data;
      }
    }else if(type === "all"){
      return rows?.map((r) => {
        if (typeof r.rowData === 'object' && r.rowData !== null && !Array.isArray(r.rowData)) {
          return {
            ...(r.rowData as Record<string, string>),
            id: r.rowIndex.toString(),
          };
        }
        return { id: r.rowIndex.toString() };
      }) || [];
    }else{
      return [];
    }

    return null;
  }, [rows]);
  

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <span className={`!text-md cursor-pointer hover:underline ${triggerClassName}`}>
          {csvFile.fileName}
        </span>
      </SheetTrigger>

      {/* Fullscreen SheetContent */}
      <SheetContent
        side="right"
        className="fixed inset-0 z-50 w-screen h-screen max-w-none bg-background p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
              <ChevronLeft
                className="w-6 h-6 cursor-pointer"
                onClick={() => setOpen(false)}
              />
              <div>
                <div className="text-md font-bold leading-none">{csvFile.fileName}</div>
                <div className="text-[12px] text-foreground">
                  Records: {rows?.length || 0}
                </div>
              </div>
            </div>
            <ExportCsv
              csvFile={{ columnHeader: csvFile.columnHeaders?.length ? JSON.parse(csvFile?.columnHeaders) : [] }}
              getCsvRows={handleRowRequestData}
            />
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                Loading...
              </div>
            ) : (
              <DataTable
                columns={
                  csvFile.columnHeaders?.length
                    ? JSON.parse(csvFile?.columnHeaders)
                    : []
                }
                data={
                  rows?.map((r) => {
                    if (typeof r.rowData === 'object' && r.rowData !== null && !Array.isArray(r.rowData)) {
                      return {
                        ...(r.rowData as Record<string, string>),
                        id: r.rowIndex.toString(),
                      };
                    }
                    return { id: r.rowIndex.toString() };
                  }) || []
                }
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

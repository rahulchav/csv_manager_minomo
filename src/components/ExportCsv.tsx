import { Button } from "./ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "../hooks/use-toast";
import Papa from "papaparse";

type GetRowDataFromParentFunction = (type: "all" | "selected") => Promise<Record<string, string>[] | null>;

interface ExportCsvProps {
  csvFile: {
    columnHeader: string[];
  };
  // Change the type of getCsvRows directly to the function type
  getCsvRows: GetRowDataFromParentFunction;
}

export function ExportCsv({ csvFile, getCsvRows }: ExportCsvProps) {
  const handleExport = async (type: "all" | "selected") => {
    const rows = await getCsvRows(type)

    if (!rows ||!rows.length) {
      toast(
        {title : `No ${type === "selected" ? "selected " : ""} rows to export`}
      );
      return;
    }

    // Remove 'id' from each row
    const cleanedRows = rows.map((row) => {
      const { id, ...rest } = row;
      return rest;
    });

    // Generate CSV using Papa Parse
    const csv = Papa.unparse({
      fields: csvFile.columnHeader,
      data: cleanedRows,
    });

    // Create and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "exported_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({title : "File downloaded successfully"});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
      <Button size={"sm"} className="gap-2">
        <Download className="w-2 h-4" />
        Export
    </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("selected")}>
          Selected Records
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("all")}>
          All Records
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Card } from "./ui/card";
import { FileText, X, Upload } from "lucide-react";
import { formatFileSize } from "../lib/utils";

export interface CsvData {
  originalName: string;
  columnHeaders: string[];
  rowCount: number;
  csvRows: Record<string, string>[];
}

interface CsvUploadProps {
  onDataParsed: (data: CsvData) => void;
}

export function CsvUpload({ onDataParsed }: CsvUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileReset = () => {
    setUploadedFile(null);
    onDataParsed({
      originalName: "",
      columnHeaders: [],
      rowCount: 0,
      csvRows: [],
    });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file);
        Papa.parse(file, {
          complete: (results) => {
            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as string[][];
            
            // Convert rows to objects with headers as keys
            const csvRows = rows.filter(row => row.some(cell => cell.trim())).map(row => {
              const rowObject: Record<string, string> = {};
              headers.forEach((header, index) => {
                rowObject[header] = row[index] || "";
              });
              return rowObject;
            });

            onDataParsed({
              originalName: file.name,
              columnHeaders: headers,
              rowCount: csvRows.length,
              csvRows,
            });
          },
          header: false,
          skipEmptyLines: true,
        });
      }
    },
    [onDataParsed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  if (uploadedFile) {
    return (
      <div className="mt-2">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={handleFileReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <label className="text-sm font-medium mb-2 block">Upload CSV File</label>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the CSV file here...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Drag & drop a CSV file here, or click to select
              </p>
              <p className="text-xs text-muted-foreground">Only CSV files are accepted</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
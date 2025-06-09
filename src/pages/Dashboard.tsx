/**
 * Dashboard Component
 * 
 * Main dashboard view for displaying and managing CSV batches.
 * Provides functionality for viewing, importing, and managing CSV files.
 * 
 * Features:
 * - Displays list of CSV batches
 * - Shows batch details (filename, upload date, row count)
 * - Supports batch deletion
 * - Integrates with CSV import functionality
 * - Error handling with toast notifications
 */

import { getCsvFiles, useQuery } from "wasp/client/operations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "../hooks/use-toast";
import { useEffect, useMemo } from "react";
import { ImportCsvDialog } from "../components/ImportCsvDialog";
import { CsvTableRow } from "./CsvTableRow";
import { DeleteCsvFile } from "../components/DeleteCsvFile";
import type { CsvFile } from "wasp/entities";
import { Loader } from "../components/Loader";

export const Dashboard = function() {
  // Fetch CSV files data with Wasp's useQuery hook
  const { data: csvFiles, error, isLoading } = useQuery(getCsvFiles);

  // Error handling effect
  useEffect(() => {
    if(error) {
      toast({
        title: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  }, [error]);

  // Memoize sorted CSV files to prevent unnecessary re-renders
  const sortedCsvFiles = useMemo(() => {
    if (!csvFiles) return [];
    return [...csvFiles].sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [csvFiles]);

  /**
   * Formats the date in the specified locale format
   * @param date - Date to format
   * @returns Formatted date string
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Renders a single batch card
   * @param batch - CSV file data
   * @returns JSX for the batch card
   */
  const renderBatchCard = (batch: CsvFile) => (
    <Card key={batch.id}>
      <CardHeader className="relative">
        <CardTitle className="!capitalize">
          <CsvTableRow csvFile={batch} />
        </CardTitle>
        {/* Delete button positioned absolutely */}
        <div className="flex justify-end absolute right-10 bottom-[-8px]">
          <DeleteCsvFile csvFile={batch} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* File name section */}
          <div>
            <p className="text-xs text-muted-foreground">File Name</p>
            <p className="font-medium text-sm">{batch.originalName}</p>
          </div>
          {/* Upload date section */}
          <div>
            <p className="text-xs text-muted-foreground">Uploaded At</p>
            <p className="font-medium text-sm">
              {formatDate(batch.uploadedAt)}
            </p>
          </div>
          {/* Row count section */}
          <div>
            <p className="text-xs text-muted-foreground">Rows</p>
            <p className="font-medium text-sm">{batch.rowCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Show loading state
  if (isLoading) {
    return <Loader fullPage text="Loading Batches..." size="lg" />;
  }

  return (
    <div className="px-6">
      {/* Header section with title and import button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Batches</h1>
        <ImportCsvDialog />
      </div>

      {/* Batches grid */}
      <div className="grid gap-4">
        {sortedCsvFiles.length > 0 ? (
          sortedCsvFiles.map(renderBatchCard)
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No batches found. Import a CSV file to get started.
          </div>
        )}
      </div>
    </div>
  );
}

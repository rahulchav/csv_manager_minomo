import { getCsvFiles, useQuery } from "wasp/client/operations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { toast } from "../hooks/use-toast";
import { useEffect } from "react";
import { ImportCsvDialog } from "../components/ImportCsvDialog";
import { CsvTableRow } from "./CsvTableRow";
import { DeleteCsvFile } from "../components/DeleteCsvFile";

export const Dashboard = function() {
  const { data: csvFiles, error } = useQuery(getCsvFiles);
  useEffect(()=>{
    if(error){
        toast({
          title: error.message ||  "Something went wrong",
          variant: "destructive",
        })
    }
  },[error])
  return (
    <div className="px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Batches</h1>
        <ImportCsvDialog />
      </div>

      <div className="grid gap-4">
        {csvFiles && csvFiles.length ? csvFiles.map((batch) => (
          <Card key={batch.id}>
            <CardHeader className="relative">
              <CardTitle className="!capitalize"><CsvTableRow csvFile={batch} /></CardTitle>
              <div className="flex justify-end absolute right-10 bottom-[-8px]">
                <DeleteCsvFile csvFile={batch} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">File Name</p>
                  <p className="font-medium text-sm">{batch.originalName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded At</p>
                  <p className="font-medium text-sm">
                    {new Date(batch.uploadedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rows</p>
                  <p className="font-medium text-sm">{batch.rowCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )):""}
      </div>
    </div>
  );
}

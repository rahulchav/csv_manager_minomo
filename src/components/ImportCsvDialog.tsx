import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Check, XIcon } from "lucide-react";
import { Stepper } from "./Stepper";
import { CsvData, CsvUpload } from "./CsvUpload";
import { uploadCsvFile } from "wasp/client/operations";
import { DataTable } from "./NotionTable";

export function ImportCsvDialog() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [batchData, setBatchData] = useState<CsvData & {fileName: string}>({
    originalName: "",
    columnHeaders: [],
    rowCount: 0,
    csvRows: [],
    fileName: "",
  });

  useEffect(() => {
    if(!open){
        handleReset();
    }
  },[open])

  const steps = ["Upload File", "Review", "Complete"];

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setBatchData({
        originalName: "",
        columnHeaders: [],
        rowCount: 0,
        csvRows: [],
        fileName: "",
    });
  };

  const isStepOneValid = batchData.fileName && batchData.originalName && batchData.rowCount > 0;

  const handleDataParsed = (data: CsvData) => {
    // Handle the parsed CSV data
    const updatedData : CsvData & {fileName: string} = {...data, fileName : batchData.fileName}
    setBatchData(updatedData);
  };

  const handleSubmit = async () => {

    try {
        const csvPayload = {
            ...batchData,
            columnHeaders: JSON.stringify(batchData.columnHeaders), // serialize array to string
        };
        const csvRowsPayload = batchData.csvRows.map((row, index) => ({
            rowData: row,       // your original row object
        }));
        await uploadCsvFile({ csvFile: csvPayload, csvRows: csvRowsPayload });
        handleContinue()
    } catch (err: any) {
      window.alert("Error: " + err?.message);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 py-4 px-1" >
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Name</label>
              <Input
                value={batchData.fileName}
                onChange={(e) =>
                  setBatchData({ ...batchData, fileName: e.target.value })
                }
                placeholder="Enter batch name"
              />
            </div>
            <CsvUpload onDataParsed={handleDataParsed} />
          </div>
        );

      case 2:
        return (
          <div>
            <div>
                <div className="text-md font-semibold mb-1">Batch Information</div>
                <Card className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div className="flex">
                        <span className="font-normal text-sm">Batch Name:</span>
                        <span className="font-semibold ml-4 capitalize">{batchData.fileName}</span>
                    </div>
                    <div className="flex">
                        <span className="font-normal text-sm">Records:</span>
                        <span className="font-semibold ml-4">{batchData.rowCount}</span>
                    </div>
                    <div className="flex">
                        <span className="font-normal text-sm">File Name:</span>
                        <span className="font-semibold ml-4">{batchData.originalName}</span>
                    </div>
                    </div>
                </Card>
                </div>
            <div className="mt-4">
                <div className="text-md font-semibold mb-1">Preview</div>
                <DataTable columns={batchData.columnHeaders} data={batchData.csvRows} height="300px" pageSize={20} onlyPreview />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 py-4 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium">Your batch is successfully uploaded</h3>
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Batch Name</span>
                  <span className="font-medium">{batchData.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Records</span>
                  <span className="font-medium">{batchData.rowCount}</span>
                </div>
              </div>
            </Card>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  handleReset();
                }}
              >
                Back to Batches
              </Button>
              <Button
                onClick={() => {
                  handleReset();
                }}
              >
                Import another Batch
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Import</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[70vw] max-sm:max-w-[90vw] min-h-[75vh]" showCloseButton={false}>
        <DialogHeader className="flex flex-row justify-between items-center">
        <DialogTitle>Import Batch</DialogTitle>
        <DialogClose>
            <XIcon size={20} />
        </DialogClose>
        </DialogHeader>
        <Separator />
        <Stepper steps={steps} currentStep={currentStep} />
        <Separator />
        <div style={{width: "100%", overflowX: "auto"}}>
        {renderStepContent()}
        </div>
        {currentStep < 4 && (
          <>
            <Separator />
            <div className={`flex justify-between ${currentStep == 3 ? "pb-4" : ""}`}>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <div className="flex-1"></div>
              {currentStep < 3 && (
                <Button
                  onClick={ currentStep === 2 ? handleSubmit : handleContinue}
                  disabled={currentStep === 1 && !isStepOneValid}
                >
                  {currentStep === 2 ? "Import Batch" : "Continue"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 
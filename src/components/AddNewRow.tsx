import { PlusCircle, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { createCsvRow } from "wasp/client/operations";
import { toast } from "../hooks/use-toast";


interface AddNewRowProps {
  csvFileId: number;
  columnHeader: string[];
}

export function AddNewRow({ csvFileId, columnHeader }: AddNewRowProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleInputChange = (header: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [header]: value,
    }));
  };

  const isFormValid = () => {
    return columnHeader.every((header) => formData[header]?.trim());
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    try {
        await createCsvRow({
            csvFileId,
            rowData: JSON.parse(JSON.stringify(formData))
        })
        toast({title: "Row added successfully", variant: "default"})
    } catch (error) {
        toast({title: "Failed to add row", variant: "destructive"})
        console.log(error)
    }finally{
        setOpen(false);
        setFormData({});
    }
  };

  // This function will be called by the Dialog's internal close mechanisms
  // (e.g., X button, escape key, click outside)
  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);
    // If the dialog is closing (newOpenState is false), reset the form data
    if (!newOpenState) {
      setFormData({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
            <PlusCircle className="h-5 w-5 cursor-pointer" />
            Add New Row
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Row</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
          {columnHeader.map((header) => (
            <div key={header} className="grid gap-1">
              <Label htmlFor={header} className=" text-sm capitalize">
                {header}
              </Label>
              <Input
                id={header}
                placeholder={`Enter ${header}`}
                value={formData[header] || ""}
                onChange={(e) => handleInputChange(header, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleSave} 
            disabled={!isFormValid()}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
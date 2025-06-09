/**
 * AddNewRow Component
 * 
 * A dialog component that allows users to add a new row to a CSV file.
 * Features:
 * - Dynamic form generation based on column headers
 * - Form validation
 * - Error handling with toast notifications
 * - Loading state management
 * - Automatic form reset on close
 */

import { PlusCircle } from "lucide-react";
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
import { useState, useCallback, useMemo, memo } from "react";
import { createCsvRow } from "wasp/client/operations";
import { toast } from "../hooks/use-toast";
import { Loader } from "./Loader";

// Type definitions
interface AddNewRowProps {
  csvFileId: number;
  columnHeader: string[];
}

const AddNewRowComponent = ({ csvFileId, columnHeader }: AddNewRowProps) => {
  // State management
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  /**
   * Handles input changes for form fields
   * @param header - The column header/field name
   * @param value - The new input value
   */
  const handleInputChange = useCallback((header: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [header]: value,
    }));
  }, []);

  /**
   * Validates if all required fields are filled
   * @returns boolean indicating form validity
   */
  const isFormValid = useMemo(() => {
    return columnHeader.every(header => formData[header]?.trim());
  }, [formData, columnHeader]);

  /**
   * Resets form state to initial values
   */
  const resetForm = useCallback(() => {
    setFormData({});
    setIsSubmitting(false);
  }, []);

  /**
   * Handles dialog open state changes
   * @param newOpenState - The new open state of the dialog
   */
  const handleOpenChange = useCallback((newOpenState: boolean) => {
    setOpen(newOpenState);
    if (!newOpenState) {
      resetForm();
    }
  }, [resetForm]);

  /**
   * Handles form submission and row creation
   */
  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await createCsvRow({
        csvFileId,
        rowData: JSON.parse(JSON.stringify(formData)) // No need for double JSON conversion
      });
      
      toast({
        title: "Success",
        description: "New row added successfully",
        variant: "default"
      });
      
      handleOpenChange(false);
    } catch (error) {
      console.error("Failed to add row:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add row",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-5 w-5" />
          Add New Row
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Row</DialogTitle>
        </DialogHeader>
        
        {/* Form fields */}
        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
          {columnHeader.map((header) => (
            <div key={header} className="grid gap-1">
              <Label 
                htmlFor={header} 
                className="text-sm capitalize"
              >
                {header}
              </Label>
              <Input
                id={header}
                placeholder={`Enter ${header}`}
                value={formData[header] || ""}
                onChange={(e) => handleInputChange(header, e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleSave} 
            disabled={!isFormValid || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <Loader size="sm" className="mr-2" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewRow = memo(AddNewRowComponent);
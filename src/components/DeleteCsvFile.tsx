import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import type { CsvFile } from "wasp/entities";
import { deleteCsvFile } from "wasp/client/operations";

interface DeleteCsvFileProps {
  csvFile: CsvFile;
}

export function DeleteCsvFile({ csvFile }: DeleteCsvFileProps) {
  const handleDelete = async () => {
    await deleteCsvFile(csvFile.id);
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
            <div className="cursor-pointer">
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                            <Trash2 size={20} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete Batch</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </DialogTrigger>

      <DialogContent>
      <div className="text-center m-4">
        <p>
            Are you sure you want to delete the batch "<strong className="font-bold">{csvFile.fileName}</strong>" and all its corresponding rows?
        </p>
        </div>
        <DialogFooter className="flex flex-row-reverse justify-start gap-2">
            <div className="w-full flex flex-row justify-center mx-8 gap-8">
                <Button variant="outline">
                    Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
import { HttpError, prisma } from 'wasp/server';
import { type CsvFile, type CsvRow } from "wasp/entities";
import { type GetCsvFiles, type UploadCsvFile, type ReorderCsvColumns, DeleteCsvFile } from "wasp/server/operations";
import { Prisma } from "@prisma/client";

export const getCsvFiles = ((_args, context) => {
    if (!context.user) {
    throw new HttpError(401);
    }

  return context.entities.CsvFile.findMany({
    where: { userId: context.user.id },
    orderBy: { uploadedAt: 'desc' },
  });
}) satisfies GetCsvFiles<void, CsvFile[]>;

type UploadArgs = {
    csvFile: Pick<CsvFile, "fileName" | "originalName" |"columnHeaders" |"rowCount">;
    csvRows: Pick<CsvRow, "rowData">[];
  };

export const uploadCsvFile: UploadCsvFile<UploadArgs, { fileId: number }> = async (
    { csvFile, csvRows },
    context
  ) => {
    if (!context.user) {
      throw new HttpError(401, "Unauthorized");
    }
  
    const createdCsvFile = await context.entities.CsvFile.create({
      data: {
        originalName: csvFile.originalName,
        columnHeaders: csvFile.columnHeaders,
        rowCount: csvFile.rowCount,
        uploadedAt: new Date(),
        user: { connect: { id: context.user.id } },
        fileName : csvFile.fileName,
      },
    });

    await context.entities.CsvRow.createMany({
      data: csvRows.map((row , index) => ({
        csvFileId: createdCsvFile.id,
        rowData: row.rowData as Prisma.InputJsonValue,
        rowIndex: index + 1,
      })),
    });

    return { fileId: createdCsvFile.id };
  };


type OrderColumnArgs =  Pick<CsvFile, "id" | "columnHeaders">;
export const reorderCsvColumns: ReorderCsvColumns<OrderColumnArgs, { fileId: number }> = async (
    { columnHeaders, id },
    context
  ) => {
    if (!context.user) {
      throw new HttpError(401, "Unauthorized");
    }
  
    const createdCsvFile = await context.entities.CsvFile.update(
      {
        where: { id },
        data: {
          columnHeaders: columnHeaders,
        },
    });

    return { fileId: createdCsvFile.id };
  };


export const deleteCsvFile: DeleteCsvFile<CsvFile["id"]> = async (
  id,
  context
) => {
  return context.entities.CsvFile.deleteMany({
    where: {
      id
    },
  });
};

import { HttpError } from 'wasp/server';
import { type CsvRow } from "wasp/entities";
import { type GetCsvRows, type UpdateRowData, type CreateCsvRow } from "wasp/server/operations";
import { Prisma } from "@prisma/client";


type FetchArgs = Pick<CsvRow, "csvFileId">;

export const getCsvRows: GetCsvRows<FetchArgs, CsvRow[]> = async ({ csvFileId }, context) => {
  if (!context.user) throw new HttpError(401);
  const data = await context.entities.CsvRow.findMany({
    where: { csvFileId },
    orderBy: { rowIndex: 'asc' },
  });

  return data;
};

export type RowToUpdate = {id: number , rowData : Pick<CsvRow, "rowData">};

type UpdateRowDataArgs = { rowsToUpdate: RowToUpdate[]};

export const updateRowData: UpdateRowData<
  UpdateRowDataArgs,
  { updatedCount: number }
> = async ({ rowsToUpdate }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  console.log("6364", rowsToUpdate);

  const updatePromises = rowsToUpdate.map((rowData) => {
    console.log("36354", rowData);
    return context.entities.CsvRow.update({
      where: { id: rowData.id },
      data: { rowData: rowData.rowData as Prisma.InputJsonValue },
    });
  });

  const results = await Promise.all(updatePromises);

  return { updatedCount: results.length };
};

type CreateArgs = {csvFileId : number ,rowData : Pick<CsvRow, "rowData">};

export const createCsvRow: CreateCsvRow<CreateArgs, CsvRow> = async (
  { csvFileId, rowData },
  context
) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  // Step 1: Get the row with the greatest rowIndex for the given csvFileId
  const lastRow = await context.entities.CsvRow.findFirst({
    where: { csvFileId },
    orderBy: { rowIndex: 'desc' },
  });

  // Step 2: Determine the new rowIndex (one more than the highest)
  const newRowIndex = lastRow ? lastRow.rowIndex + 1 : 0;

  // Step 3: Create the new CsvRow entry
  const newRow = await context.entities.CsvRow.create({
    data: {
      rowIndex: newRowIndex,
      rowData: rowData as Prisma.InputJsonValue,
      csvFile: { connect: { id: csvFileId } },
    },
  });

  return newRow;
};




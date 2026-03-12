import { and, asc, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "../db/index.js";
import { lists, rows, type ListRecord, type RowRecord } from "../db/schema.js";

export type ListWithRows = ListRecord & { rows: RowRecord[] };

function getRowsForList(listId: string): RowRecord[] {
  return db
    .select()
    .from(rows)
    .where(eq(rows.listId, listId))
    .orderBy(asc(rows.position))
    .all();
}

export function getList(listId: string): ListWithRows | null {
  const list = db.select().from(lists).where(eq(lists.id, listId)).limit(1).get();
  if (!list) {
    return null;
  }

  return {
    ...list,
    rows: getRowsForList(listId),
  };
}

export function createList(name: string): ListWithRows {
  const normalizedName = name.trim();
  const id = nanoid(10);

  db.insert(lists)
    .values({
      id,
      name: normalizedName,
    })
    .run();

  const created = db.select().from(lists).where(eq(lists.id, id)).limit(1).get();

  if (!created) {
    throw new Error("Could not create list");
  }

  return {
    ...created,
    rows: [],
  };
}

export function deleteList(listId: string): boolean {
  const existing = db.select({ id: lists.id }).from(lists).where(eq(lists.id, listId)).limit(1).get();
  if (!existing) {
    return false;
  }

  db.delete(lists).where(eq(lists.id, listId)).run();
  return true;
}

export function listExists(listId: string): boolean {
  const list = db.select({ id: lists.id }).from(lists).where(eq(lists.id, listId)).limit(1).get();
  return Boolean(list);
}

export function addRow(listId: string, text: string): RowRecord | null {
  if (!listExists(listId)) {
    return null;
  }

  const lastRow = db
    .select({ position: rows.position })
    .from(rows)
    .where(eq(rows.listId, listId))
    .orderBy(desc(rows.position))
    .limit(1)
    .get();

  const id = nanoid(12);
  const nextPosition = (lastRow?.position ?? -1) + 1;

  db.insert(rows)
    .values({
      id,
      listId,
      text: text.trim(),
      checked: false,
      position: nextPosition,
    })
    .run();

  const created = db.select().from(rows).where(eq(rows.id, id)).limit(1).get();
  return created ?? null;
}

export function toggleRow(listId: string, rowId: string, checked: boolean): RowRecord | null {
  const row = db
    .select()
    .from(rows)
    .where(and(eq(rows.id, rowId), eq(rows.listId, listId)))
    .limit(1)
    .get();

  if (!row) {
    return null;
  }

  db.update(rows).set({ checked }).where(eq(rows.id, rowId)).run();

  const updated = db.select().from(rows).where(eq(rows.id, rowId)).limit(1).get();
  return updated ?? null;
}

export function deleteRow(listId: string, rowId: string): boolean {
  const existing = db
    .select()
    .from(rows)
    .where(and(eq(rows.id, rowId), eq(rows.listId, listId)))
    .limit(1)
    .get();

  if (!existing) {
    return false;
  }

  db.transaction((tx) => {
    tx.delete(rows).where(eq(rows.id, rowId)).run();

    const remaining = tx
      .select()
      .from(rows)
      .where(eq(rows.listId, listId))
      .orderBy(asc(rows.position))
      .all();

    for (const [index, row] of remaining.entries()) {
      tx.update(rows).set({ position: index }).where(eq(rows.id, row.id)).run();
    }
  });

  return true;
}

export function reorderRows(listId: string, orderedRowIds: string[]): RowRecord[] | null {
  const existingRows = getRowsForList(listId);

  const existingIds = [...existingRows.map((row) => row.id)].sort();
  const incomingIds = [...orderedRowIds].sort();

  if (existingIds.length !== incomingIds.length) {
    return null;
  }

  for (let i = 0; i < existingIds.length; i += 1) {
    if (existingIds[i] !== incomingIds[i]) {
      return null;
    }
  }

  db.transaction((tx) => {
    for (const [index, rowId] of orderedRowIds.entries()) {
      tx
        .update(rows)
        .set({ position: index })
        .where(and(eq(rows.id, rowId), eq(rows.listId, listId)))
        .run();
    }
  });

  return getRowsForList(listId);
}

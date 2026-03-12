import { Router } from "express";
import { z } from "zod";

import {
  addRow,
  createList,
  deleteList,
  deleteRow,
  getList,
  reorderRows,
  toggleRow,
} from "../services/list-service.js";

const router = Router();

const createListSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

const addRowSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

const toggleRowSchema = z.object({
  checked: z.boolean(),
});

const reorderRowsSchema = z.object({
  rowIds: z.array(z.string().min(1)),
});

router.post("/", (req, res) => {
  const parsed = createListSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid list payload", details: parsed.error.flatten() });
  }

  const list = createList(parsed.data.name);
  return res.status(201).json({ list });
});

router.delete("/:listId", (req, res) => {
  const removed = deleteList(req.params.listId);
  if (!removed) {
    return res.status(404).json({ error: "List not found" });
  }

  return res.status(204).send();
});

router.get("/:listId", (req, res) => {
  const list = getList(req.params.listId);
  if (!list) {
    return res.status(404).json({ error: "List not found" });
  }

  return res.json({ list });
});

router.post("/:listId/rows", (req, res) => {
  const parsed = addRowSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid row payload", details: parsed.error.flatten() });
  }

  const row = addRow(req.params.listId, parsed.data.text);
  if (!row) {
    return res.status(404).json({ error: "List not found" });
  }

  return res.status(201).json({ row });
});

router.patch("/:listId/rows/:rowId", (req, res) => {
  const parsed = toggleRowSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid row update payload", details: parsed.error.flatten() });
  }

  const row = toggleRow(req.params.listId, req.params.rowId, parsed.data.checked);
  if (!row) {
    return res.status(404).json({ error: "Row not found" });
  }

  return res.json({ row });
});

router.delete("/:listId/rows/:rowId", (req, res) => {
  const removed = deleteRow(req.params.listId, req.params.rowId);
  if (!removed) {
    return res.status(404).json({ error: "Row not found" });
  }

  return res.status(204).send();
});

router.put("/:listId/rows/reorder", (req, res) => {
  const parsed = reorderRowsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid reorder payload", details: parsed.error.flatten() });
  }

  const reorderedRows = reorderRows(req.params.listId, parsed.data.rowIds);
  if (!reorderedRows) {
    return res.status(400).json({ error: "Row IDs must match current list rows" });
  }

  return res.json({ rows: reorderedRows });
});

export default router;

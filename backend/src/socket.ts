import { Server } from "socket.io";
import { z } from "zod";

import {
  addRow,
  deleteRow,
  getList,
  reorderRows,
  toggleRow,
} from "./services/list-service.js";

const joinSchema = z.object({
  listId: z.string().min(1),
});

const addRowSchema = z.object({
  listId: z.string().min(1),
  text: z.string().trim().min(1).max(500),
});

const toggleSchema = z.object({
  listId: z.string().min(1),
  rowId: z.string().min(1),
  checked: z.boolean(),
});

const deleteSchema = z.object({
  listId: z.string().min(1),
  rowId: z.string().min(1),
});

const reorderSchema = z.object({
  listId: z.string().min(1),
  rowIds: z.array(z.string().min(1)),
});

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    socket.on("joinList", (payload) => {
      const parsed = joinSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("serverError", "Invalid join payload");
        return;
      }

      const list = getList(parsed.data.listId);
      if (!list) {
        socket.emit("serverError", "List not found");
        return;
      }

      socket.join(parsed.data.listId);
      socket.emit("joinedList", { listId: parsed.data.listId });
    });

    socket.on("addRow", (payload) => {
      const parsed = addRowSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("serverError", "Invalid row payload");
        return;
      }

      const row = addRow(parsed.data.listId, parsed.data.text);
      if (!row) {
        socket.emit("serverError", "List not found");
        return;
      }

      io.to(parsed.data.listId).emit("rowAdded", {
        listId: parsed.data.listId,
        row,
      });
    });

    socket.on("toggleRow", (payload) => {
      const parsed = toggleSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("serverError", "Invalid toggle payload");
        return;
      }

      const row = toggleRow(parsed.data.listId, parsed.data.rowId, parsed.data.checked);
      if (!row) {
        socket.emit("serverError", "Row not found");
        return;
      }

      io.to(parsed.data.listId).emit("rowUpdated", {
        listId: parsed.data.listId,
        row,
      });
    });

    socket.on("deleteRow", (payload) => {
      const parsed = deleteSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("serverError", "Invalid delete payload");
        return;
      }

      const removed = deleteRow(parsed.data.listId, parsed.data.rowId);
      if (!removed) {
        socket.emit("serverError", "Row not found");
        return;
      }

      io.to(parsed.data.listId).emit("rowDeleted", {
        listId: parsed.data.listId,
        rowId: parsed.data.rowId,
      });
    });

    socket.on("reorderRows", (payload) => {
      const parsed = reorderSchema.safeParse(payload);
      if (!parsed.success) {
        socket.emit("serverError", "Invalid reorder payload");
        return;
      }

      const reorderedRows = reorderRows(parsed.data.listId, parsed.data.rowIds);
      if (!reorderedRows) {
        socket.emit("serverError", "Row reorder rejected");
        return;
      }

      io.to(parsed.data.listId).emit("rowsReordered", {
        listId: parsed.data.listId,
        rowIds: reorderedRows.map((row) => row.id),
      });
    });
  });
}

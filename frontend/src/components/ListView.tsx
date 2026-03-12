import { FormEvent, useMemo, useState } from "react";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { Row } from "../types";
import { ListRow } from "./ListRow";

type ListViewProps = {
  rows: Row[];
  onAddRow: (text: string) => void;
  onToggleRow: (rowId: string, checked: boolean) => void;
  onDeleteRow: (rowId: string) => void;
  onReorderRows: (rowIds: string[]) => void;
};

export function ListView({ rows, onAddRow, onToggleRow, onDeleteRow, onReorderRows }: ListViewProps) {
  const [draftText, setDraftText] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));
  const orderedRows = useMemo(() => [...rows].sort((a, b) => a.position - b.position), [rows]);

  function handleAddRow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draftText.trim();
    if (!trimmed) {
      return;
    }

    onAddRow(trimmed);
    setDraftText("");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = orderedRows.findIndex((row) => row.id === active.id);
    const newIndex = orderedRows.findIndex((row) => row.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(orderedRows, oldIndex, newIndex);
    onReorderRows(reordered.map((row) => row.id));
  }

  return (
    <section className="space-y-5">
      <form onSubmit={handleAddRow} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={draftText}
          onChange={(event) => setDraftText(event.target.value)}
          placeholder="Add a new row"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700"
        >
          Add Row
        </button>
      </form>

      {orderedRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-500">
          No rows yet. Add one to start collaborating.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedRows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
              {orderedRows.map((row) => (
                <ListRow key={row.id} row={row} onToggle={onToggleRow} onDelete={onDeleteRow} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}

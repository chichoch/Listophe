import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Row } from "../types";

type ListRowProps = {
  row: Row;
  onToggle: (rowId: string, checked: boolean) => void;
  onDelete: (rowId: string) => void;
};

export function ListRow({ row, onToggle, onDelete }: ListRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100"
        aria-label="Drag row"
        {...attributes}
        {...listeners}
      >
        ::
      </button>

      <input
        checked={row.checked}
        onChange={(event) => onToggle(row.id, event.target.checked)}
        type="checkbox"
        className="h-5 w-5 accent-emerald-600"
      />

      <span className={`flex-1 ${row.checked ? "text-slate-400 line-through" : "text-slate-800"}`}>{row.text}</span>

      <button
        type="button"
        onClick={() => onDelete(row.id)}
        className="rounded-lg px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
      >
        Delete
      </button>
    </li>
  );
}

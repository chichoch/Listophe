import { FormEvent, useState } from "react";

type CreateListProps = {
  loading: boolean;
  onCreate: (name: string) => Promise<void>;
};

export function CreateList({ loading, onCreate }: CreateListProps) {
  const [listName, setListName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = listName.trim();
    if (!trimmed) {
      return;
    }

    await onCreate(trimmed);
    setListName("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-300/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur">
      <label className="block text-sm font-semibold text-slate-700" htmlFor="list-name">
        Name your new list
      </label>
      <input
        id="list-name"
        value={listName}
        onChange={(event) => setListName(event.target.value)}
        placeholder="Groceries, sprint TODO, moving checklist..."
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create Shared List"}
      </button>
    </form>
  );
}

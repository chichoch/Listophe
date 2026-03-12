import { useState } from "react";
import { Link } from "react-router-dom";

import { getSavedLists, removeList, type SavedList } from "../lib/savedLists";

export function MyListsPage() {
  const [lists, setLists] = useState<SavedList[]>(getSavedLists);

  function handleRemove(id: string) {
    removeList(id);
    setLists(getSavedLists());
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 py-10">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">My Lists</h1>

      {lists.length === 0 ? (
        <div className="space-y-3 rounded-2xl border border-slate-300/70 bg-white/80 p-8 text-center shadow-lg shadow-slate-200/60 backdrop-blur">
          <p className="text-slate-600">You haven't saved any lists yet.</p>
          <Link
            to="/"
            className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-500"
          >
            Create a new list
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex items-center justify-between rounded-xl border border-slate-300/70 bg-white/80 px-5 py-3.5 shadow-sm backdrop-blur"
            >
              <Link
                to={`/lists/${list.id}`}
                className="min-w-0 flex-1 truncate font-medium text-slate-900 hover:text-emerald-700"
              >
                {list.name}
              </Link>
              <button
                type="button"
                onClick={() => handleRemove(list.id)}
                className="ml-3 shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

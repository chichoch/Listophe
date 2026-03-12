import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { CreateList } from "../components/CreateList";
import { createList } from "../lib/api";
import { saveList } from "../lib/savedLists";

export function HomePage() {
  const navigate = useNavigate();

  const createListMutation = useMutation({
    mutationFn: (name: string) => createList(name),
    onSuccess: (list) => {
      saveList(list.id, list.name, true);
      navigate(`/lists/${list.id}`);
    },
  });

  return (
    <section className="mx-auto max-w-2xl space-y-5 py-10">
      <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Realtime collaboration</p>
      <h1 className="text-center text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Build a shared list in seconds</h1>
      <p className="text-center text-slate-600">
        Create a list, share the URL, and see updates from everyone in real-time.
      </p>

      <CreateList
        loading={createListMutation.isPending}
        onCreate={async (name) => {
          await createListMutation.mutateAsync(name);
        }}
      />

      {createListMutation.isError ? (
        <p className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700">Could not create list. Please try again.</p>
      ) : null}
    </section>
  );
}

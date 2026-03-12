import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { ListView } from "../components/ListView";
import { useSocket } from "../hooks/useSocket";
import { fetchList } from "../lib/api";

export function ListPage() {
  const { listId } = useParams<{ listId: string }>();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const refreshList = useCallback(() => {
    if (!listId) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["list", listId] });
  }, [listId, queryClient]);

  const socket = useSocket({
    listId: listId ?? "",
    onServerMutation: refreshList,
  });

  const listQuery = useQuery({
    queryKey: ["list", listId],
    queryFn: () => fetchList(listId ?? ""),
    enabled: Boolean(listId),
  });

  if (!listId) {
    return <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">Missing list ID.</p>;
  }

  if (listQuery.isPending) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">Loading list…</p>;
  }

  if (listQuery.isError || !listQuery.data) {
    return (
      <div className="space-y-3 rounded-xl border border-rose-300 bg-rose-50 p-5 text-rose-700">
        <p>Could not load that list.</p>
        <Link to="/" className="inline-flex rounded-lg bg-rose-700 px-4 py-2 font-medium text-white">
          Create a new list
        </Link>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/lists/${listId}`;

  return (
    <section className="space-y-6 py-8">
      <header className="space-y-2">
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600">
          ← Create another list
        </Link>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">{listQuery.data.name}</h1>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Share URL: <span className="font-mono text-slate-800">{shareUrl}</span></span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-md bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs uppercase tracking-wider text-slate-500">Socket {socket.connected ? "connected" : "connecting"}</p>
      </header>

      <ListView
        rows={listQuery.data.rows}
        onAddRow={socket.addRow}
        onToggleRow={socket.toggleRow}
        onDeleteRow={socket.deleteRow}
        onReorderRows={socket.reorderRows}
      />
    </section>
  );
}

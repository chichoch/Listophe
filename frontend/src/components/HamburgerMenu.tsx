import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { isListSaved, removeList, saveList } from "../lib/savedLists";
import type { List } from "../types";

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const params = useParams<{ listId: string }>();
  const queryClient = useQueryClient();

  const listId = location.pathname.startsWith("/lists/") ? params.listId : undefined;
  const [saved, setSaved] = useState(() => (listId ? isListSaved(listId) : false));
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    if (!listId) return;
    const url = `${window.location.origin}/lists/${listId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }, [listId]);

  // Sync saved state when navigating to a different list
  useEffect(() => {
    setSaved(listId ? isListSaved(listId) : false);
  }, [listId]);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleToggleSave() {
    if (!listId) return;

    if (saved) {
      removeList(listId);
      setSaved(false);
    } else {
      const list = queryClient.getQueryData<List>(["list", listId]);
      saveList(listId, list?.name ?? "Untitled");
      setSaved(true);
    }
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-200/60"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link
            to="/"
            className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Create new list
          </Link>
          <Link
            to="/my-lists"
            className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            My Lists
          </Link>
          {listId && (
            <>
              <button
                type="button"
                onClick={handleShare}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {copied ? "Copied!" : "Share list"}
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
              >
                {saved ? "Remove from My Lists" : "Save to My Lists"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

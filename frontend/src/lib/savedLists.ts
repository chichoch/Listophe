export type SavedList = {
  id: string;
  name: string;
  savedAt: string;
};

const STORAGE_KEY = "listophe:saved-lists";

function readAll(): SavedList[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedList[]) : [];
  } catch {
    return [];
  }
}

function writeAll(lists: SavedList[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function getSavedLists(): SavedList[] {
  return readAll().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

export function saveList(id: string, name: string): void {
  const lists = readAll();
  if (lists.some((l) => l.id === id)) return;
  lists.push({ id, name, savedAt: new Date().toISOString() });
  writeAll(lists);
}

export function removeList(id: string): void {
  writeAll(readAll().filter((l) => l.id !== id));
}

export function isListSaved(id: string): boolean {
  return readAll().some((l) => l.id === id);
}

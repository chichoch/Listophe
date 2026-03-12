import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

type UseSocketParams = {
  listId: string;
  onServerMutation: () => void;
};

type ListSocketApi = {
  connected: boolean;
  addRow: (text: string) => void;
  toggleRow: (rowId: string, checked: boolean) => void;
  deleteRow: (rowId: string) => void;
  reorderRows: (rowIds: string[]) => void;
};

let socketInstance: Socket | null = null;

function getSocket() {
  if (!socketInstance) {
    const url = import.meta.env.VITE_API_URL;
    socketInstance = io(url, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }

  return socketInstance;
}

export function useSocket({ listId, onServerMutation }: UseSocketParams): ListSocketApi {
  const socket = useMemo(() => getSocket(), []);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    if (!listId) {
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinList", { listId });

    const onConnect = () => {
      setConnected(true);
      socket.emit("joinList", { listId });
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const refresh = () => {
      onServerMutation();
    };

    const onError = (message: string) => {
      console.error(message);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("rowAdded", refresh);
    socket.on("rowUpdated", refresh);
    socket.on("rowDeleted", refresh);
    socket.on("rowsReordered", refresh);
    socket.on("serverError", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("rowAdded", refresh);
      socket.off("rowUpdated", refresh);
      socket.off("rowDeleted", refresh);
      socket.off("rowsReordered", refresh);
      socket.off("serverError", onError);
    };
  }, [listId, onServerMutation, socket]);

  const addRow = useCallback(
    (text: string) => {
      if (!listId) {
        return;
      }
      socket.emit("addRow", { listId, text });
    },
    [listId, socket],
  );

  const toggleRow = useCallback(
    (rowId: string, checked: boolean) => {
      if (!listId) {
        return;
      }
      socket.emit("toggleRow", { listId, rowId, checked });
    },
    [listId, socket],
  );

  const deleteRow = useCallback(
    (rowId: string) => {
      if (!listId) {
        return;
      }
      socket.emit("deleteRow", { listId, rowId });
    },
    [listId, socket],
  );

  const reorderRows = useCallback(
    (rowIds: string[]) => {
      if (!listId) {
        return;
      }
      socket.emit("reorderRows", { listId, rowIds });
    },
    [listId, socket],
  );

  return {
    connected,
    addRow,
    toggleRow,
    deleteRow,
    reorderRows,
  };
}

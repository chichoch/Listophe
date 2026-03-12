export type Row = {
  id: string;
  listId: string;
  text: string;
  checked: boolean;
  position: number;
  createdAt: string;
};

export type List = {
  id: string;
  name: string;
  createdAt: string;
  rows: Row[];
};

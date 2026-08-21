export type QueueRow = {
  id: string;
  cells: string[];
};

export type QueueResult = {
  rows: QueueRow[];
  total: number;
  error?: string;
};

export type QueueQuery = {
  keyword?: string;
  status?: string;
  custType?: string;
  direction?: string;
  fromReport?: boolean;
};

export type QueueSearchParams = {
  keyword?: string | string[];
  status?: string | string[];
  direction?: string | string[];
};

import { EmptyState } from "@/components/shared/empty-state";

import { listUsers } from "../services/user-service";

export async function UserList() {
  const users = await listUsers();

  if (users.length === 0) {
    return (
      <EmptyState
        title="No users yet"
        description="Users will appear here once your directory is connected."
      />
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900">{user.name}</p>
            <p className="text-sm text-zinc-500">{user.email}</p>
          </div>
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            {user.role}
          </span>
        </li>
      ))}
    </ul>
  );
}

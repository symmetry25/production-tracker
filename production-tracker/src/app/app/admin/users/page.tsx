import { getAdminUsers } from "@/lib/global-pages-data";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">人员与权限</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#aaa599]">管理用户、角色、部门和每周人天容量，供资源规划和任务分配使用。</p>
      </div>

      <section className="border border-[#34322b] bg-[#181713]">
        <div className="grid grid-cols-[1fr_1fr_130px_160px_120px] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Department</span>
          <span>Capacity</span>
        </div>
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-[1fr_1fr_130px_160px_120px] border-b border-[#2a2a28] px-4 py-3 text-sm">
            <span className="font-medium text-[#f4f1e8]">{user.name}</span>
            <span className="text-[#aaa599]">{user.email}</span>
            <span className="text-[#e8c678]">{user.role}</span>
            <span className="text-[#c9c3b5]">{user.department ?? "--"}</span>
            <span className="font-mono text-[#aaa599]">{user.capacity}d / week</span>
          </div>
        ))}
      </section>
    </>
  );
}

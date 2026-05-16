import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, UserCheck, UserX, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { RoleBadge } from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import SearchBar, { FilterSelect } from '../components/ui/SearchBar';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../utils/export';
import PageTransition from '../components/PageTransition';

const ROLES = ['admin', 'staff', 'customer', 'supplier'];
const LIMIT = 20;

export default function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', phone: '', address: '', businessName: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      let filtered = res.data;
      if (search) filtered = filtered.filter((u: any) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
      );
      if (roleFilter) filtered = filtered.filter((u: any) => u.role === roleFilter);
      setUsers(filtered.slice((page - 1) * LIMIT, page * LIMIT));
      setTotal(filtered.length);
      setPages(Math.ceil(filtered.length / LIMIT));
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('User created!');
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', role: 'staff', phone: '', address: '', businessName: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const toggleActive = async (u: any) => {
    await api.put(`/users/${u.id}`, { ...u, isActive: !u.isActive });
    toast.success(u.isActive ? 'User deactivated' : 'User activated');
    fetchData();
  };

  const inp = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const roleCounts = ROLES.reduce((acc: any, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {});

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={t('nav.users')}
        subtitle={`${total} users total`}
        actions={<ActionButton onClick={() => setShowAdd(true)} icon={<Plus size={15} />} label="Add User" />}
      />

      {/* Role summary chips */}
      <div className="flex gap-3 flex-wrap">
        {ROLES.map(r => (
          <button key={r} onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${roleFilter === r ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {r} ({total})
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or phone..." className="flex-1 max-w-sm" />
        <FilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLES.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))} placeholder="All Roles" />
        <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={16} /></button>
      </div>

      {loading ? <TableSkeleton rows={8} cols={6} /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'}
                      className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                      {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
          <div className="px-3 border-t border-gray-100">
            <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
          </div>
        </div>
      )}

      {showAdd && (
        <Modal title="Add New User" onClose={() => setShowAdd(false)}>
          <form onSubmit={submitAdd} className="space-y-4">
            <FormField label="Role" required>
              <select value={form.role} onChange={e => inp('role', e.target.value)} className={selectCls}>
                {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Full Name" required>
                <input type="text" value={form.name} onChange={e => inp('name', e.target.value)} required className={inputCls} />
              </FormField>
              <FormField label="Phone">
                <input type="text" value={form.phone} onChange={e => inp('phone', e.target.value)} placeholder="+92-300-..." className={inputCls} />
              </FormField>
            </div>
            <FormField label="Email" required>
              <input type="email" value={form.email} onChange={e => inp('email', e.target.value)} required className={inputCls} />
            </FormField>
            <FormField label="Password" required>
              <input type="password" value={form.password} onChange={e => inp('password', e.target.value)} required minLength={6} className={inputCls} placeholder="Minimum 6 characters" />
            </FormField>
            {(form.role === 'customer' || form.role === 'supplier') && (
              <FormField label="Business Name">
                <input type="text" value={form.businessName} onChange={e => inp('businessName', e.target.value)} className={inputCls} placeholder="Company / Farm name" />
              </FormField>
            )}
            <FormField label="Address">
              <input type="text" value={form.address} onChange={e => inp('address', e.target.value)} className={inputCls} placeholder="City, Province" />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Create User</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}

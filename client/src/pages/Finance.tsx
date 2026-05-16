import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, AlertCircle, Download, RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import SearchBar, { FilterSelect } from '../components/ui/SearchBar';
import PageHeader, { ActionButton, FormField, inputCls, selectCls } from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { TableSkeleton } from '../components/ui/Skeleton';
import { formatPKR, formatDate, exportToCSV } from '../utils/export';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import PageTransition from '../components/PageTransition';

const CATEGORIES = ['electricity', 'maintenance', 'labour', 'transport', 'other'];
const PIE_COLORS = ['#16a34a', '#2563eb', '#dc2626', '#f59e0b', '#7c3aed'];
const LIMIT = 15;

export default function Finance() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any>({});
  const [expenses, setExpenses] = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'electricity', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const expParams = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (search) expParams.set('q', search);
      if (catFilter) expParams.set('category', catFilter);
      if (dateFrom) expParams.set('dateFrom', dateFrom);
      if (dateTo) expParams.set('dateTo', dateTo);

      const sumParams = new URLSearchParams();
      if (dateFrom) sumParams.set('dateFrom', dateFrom);
      if (dateTo) sumParams.set('dateTo', dateTo);

      const [s, e, m] = await Promise.all([
        api.get(`/finance/summary?${sumParams}`),
        api.get(`/finance/expenses?${expParams}`),
        api.get('/finance/monthly?months=6')
      ]);
      setSummary(s.data);
      setExpenses(e.data.expenses || []);
      setByCategory(e.data.byCategory || []);
      setTotal(e.data.total || 0);
      setPages(e.data.pages || 1);
      setMonthly(m.data);
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter, dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, catFilter, dateFrom, dateTo]);

  const addExpense = async (ev: React.FormEvent) => {
    ev.preventDefault();
    try {
      await api.post('/finance/expenses', form);
      toast.success('Expense recorded!');
      setShowAdd(false);
      setForm({ category: 'electricity', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/finance/expenses/${id}`);
    toast.success('Deleted');
    fetchData();
  };

  const handleExport = () => {
    exportToCSV(expenses.map(e => ({
      Date: formatDate(e.date),
      Category: e.category,
      Description: e.description || '',
      Amount: e.amount
    })), 'expenses');
  };

  const pieData = byCategory.map((c: any, i: number) => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c._sum.amount || 0,
    color: PIE_COLORS[i % PIE_COLORS.length]
  }));

  return (
    <PageTransition>
    <div className="space-y-5">
      <PageHeader
        title={t('finance.title')}
        subtitle="Financial overview and expense tracking"
        actions={
          <>
            <ActionButton onClick={handleExport} icon={<Download size={15} />} label="Export CSV" variant="secondary" />
            <ActionButton onClick={() => setShowAdd(true)} icon={<Plus size={15} />} label={t('finance.addExpense')} />
          </>
        }
      />

      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter Period:</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <span className="text-gray-400">to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear dates</button>
        )}
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-400">Showing {dateFrom || dateTo ? 'filtered' : 'all-time'} data</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp size={20} />} label={dateFrom || dateTo ? 'Period Revenue' : 'Total Revenue'}
          value={formatPKR(summary.rangeRevenue ?? summary.totalRevenue ?? 0)}
          sub={dateFrom || dateTo ? undefined : `This month: ${formatPKR(summary.monthRevenue || 0)}`}
          iconBg="bg-green-100" iconColor="text-green-600" valueColor="text-green-700"
        />
        <StatCard
          icon={<TrendingDown size={20} />} label={dateFrom || dateTo ? 'Period Expenses' : 'Total Expenses'}
          value={formatPKR(summary.rangeExpenses ?? summary.totalExpenses ?? 0)}
          sub={dateFrom || dateTo ? undefined : `This month: ${formatPKR(summary.monthExpenses || 0)}`}
          iconBg="bg-red-100" iconColor="text-red-500" valueColor="text-red-600"
        />
        <StatCard
          icon={<DollarSign size={20} />} label="Net Profit"
          value={formatPKR(summary.totalProfit || 0)}
          iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-700"
        />
        <StatCard
          icon={<AlertCircle size={20} />} label="Outstanding (Receivable)"
          value={formatPKR(summary.outstanding || 0)}
          iconBg="bg-orange-100" iconColor="text-orange-500" valueColor="text-orange-600"
          alert={(summary.outstanding || 0) > 100000}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 6-month chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">6-Month Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => formatPKR(Number(v))} />
              <Legend />
              <Area dataKey="revenue" stroke="#16a34a" fill="url(#revG)" name="Revenue" strokeWidth={2} />
              <Bar dataKey="expenses" fill="#fca5a5" name="Expenses" radius={[3, 3, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense by category pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Expenses by Category</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatPKR(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d: any) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-800">{formatPKR(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-center text-gray-400 text-sm py-12">No expense data</p>}
        </div>
      </div>

      {/* Expenses table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search description..." className="flex-1 max-w-sm" />
          <FilterSelect value={catFilter} onChange={setCatFilter} options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} placeholder="All Categories" />
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><RefreshCw size={16} /></button>
        </div>

        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{t('finance.expenses')}</h2>
              <span className="text-xs text-gray-400">{total} entries</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Date', 'Category', 'Description', 'Amount', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 text-xs">{formatDate(e.date)}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">{t(`finance.${e.category}`)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{e.description || '—'}</td>
                    <td className="px-5 py-3.5 font-semibold text-red-600">{formatPKR(e.amount)}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => deleteExpense(e.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">No expenses found</td></tr>}
              </tbody>
            </table>
            <div className="px-3 border-t border-gray-100">
              <Pagination page={page} pages={pages} total={total} limit={LIMIT} onChange={setPage} />
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal title={t('finance.addExpense')} onClose={() => setShowAdd(false)}>
          <form onSubmit={addExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category" required>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={selectCls}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{t(`finance.${c}`)}</option>)}
                </select>
              </FormField>
              <FormField label="Amount (PKR)" required>
                <input type="number" min="0.01" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required className={inputCls} placeholder="0" />
              </FormField>
            </div>
            <FormField label="Description">
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Optional details..." />
            </FormField>
            <FormField label="Date">
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl text-sm font-semibold">Save Expense</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
    </PageTransition>
  );
}

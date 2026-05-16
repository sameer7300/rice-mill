import { useEffect, useState } from 'react';
import api from '../api';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { StatsSkeleton } from '../components/ui/Skeleton';
import { formatPKR } from '../utils/export';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell
} from 'recharts';
import PageTransition from '../components/PageTransition';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#16a34a', confirmed: '#2563eb', processing: '#7c3aed',
  shipped: '#d97706', pending: '#f59e0b', cancelled: '#dc2626'
};

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="h-12 bg-gray-200 rounded-2xl animate-pulse w-64" />
      <StatsSkeleton />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
  if (!data) return <p className="text-gray-500">Failed to load analytics. Admin access required.</p>;

  const { kpis, topCustomers, topVarieties, ordersByStatus, weeklyOrders, millYieldTrend } = data;

  return (
    <PageTransition>
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Business intelligence & performance metrics" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp size={20} />} label="This Month Revenue"
          value={formatPKR(kpis.thisMonthRevenue)}
          trend={kpis.revenueGrowth}
          sub={`vs PKR ${(kpis.lastMonthRevenue / 1000).toFixed(0)}K last month`}
          iconBg="bg-green-100" iconColor="text-green-600" valueColor="text-green-700"
        />
        <StatCard
          icon={<ShoppingCart size={20} />} label="This Month Orders"
          value={kpis.thisMonthOrders}
          trend={kpis.orderGrowth}
          sub={`${kpis.lastMonthOrders} last month`}
          iconBg="bg-blue-100" iconColor="text-blue-600" valueColor="text-blue-700"
        />
        <StatCard
          icon={<TrendingDown size={20} />} label="Collection Rate (30d)"
          value={`${kpis.collectionRate}%`}
          sub={kpis.collectionRate >= 90 ? 'Excellent' : kpis.collectionRate >= 70 ? 'Good' : 'Needs attention'}
          iconBg={kpis.collectionRate >= 90 ? 'bg-green-100' : kpis.collectionRate >= 70 ? 'bg-yellow-100' : 'bg-red-100'}
          iconColor={kpis.collectionRate >= 90 ? 'text-green-600' : kpis.collectionRate >= 70 ? 'text-yellow-600' : 'text-red-500'}
          valueColor={kpis.collectionRate >= 90 ? 'text-green-700' : kpis.collectionRate >= 70 ? 'text-yellow-700' : 'text-red-600'}
        />
        <StatCard
          icon={<BarChart3 size={20} />} label="Revenue Growth"
          value={`${kpis.revenueGrowth > 0 ? '+' : ''}${kpis.revenueGrowth}%`}
          sub="vs last month"
          iconBg={kpis.revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}
          iconColor={kpis.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-500'}
          valueColor={kpis.revenueGrowth >= 0 ? 'text-green-700' : 'text-red-600'}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 14-day order trend */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingCart size={16} className="text-blue-500" /> 14-Day Orders & Revenue
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyOrders}>
              <defs>
                <linearGradient id="ordG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip />
              <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#2563eb" fill="url(#ordG)" name="Orders" strokeWidth={2} />
              <Bar yAxisId="right" dataKey="revenue" fill="#bbf7d0" name="Revenue (PKR)" radius={[2, 2, 0, 0]} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-purple-500" /> Orders by Status
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersByStatus} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={80} className="capitalize" />
              <Tooltip formatter={(v: any, n: string) => [n === 'count' ? v + ' orders' : formatPKR(v), n === 'count' ? 'Count' : 'Revenue']} />
              <Bar dataKey="count" name="count" radius={[0, 4, 4, 0]}>
                {ordersByStatus.map((entry: any, i: number) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top customers */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-green-500" /> Top Customers by Revenue
          </h2>
          <div className="space-y-3">
            {topCustomers.slice(0, 6).map((c: any, i: number) => {
              const pct = topCustomers[0]?.revenue ? (c.revenue / topCustomers[0].revenue) * 100 : 0;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>{i + 1}</span>
                      <span className="font-medium text-gray-800 truncate max-w-32">{c.name}</span>
                      <span className="text-gray-400 text-xs">{c.orders} orders</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{formatPKR(c.revenue)}</span>
                      {c.revenue > c.paid && <span className="text-xs text-red-400 ml-2">-{formatPKR(c.revenue - c.paid)} due</span>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top varieties */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={16} className="text-yellow-500" /> Top Varieties Sold
          </h2>
          <div className="space-y-3">
            {topVarieties.slice(0, 6).map((v: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-800">{v.variety}</p>
                  <p className="text-xs text-gray-400">{v.totalKg?.toLocaleString()} kg sold</p>
                </div>
                <span className="font-semibold text-green-700">{formatPKR(v.revenue)}</span>
              </div>
            ))}
            {topVarieties.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No sales data yet</p>}
          </div>
        </div>
      </div>

      {/* Mill yield trend */}
      {millYieldTrend?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500" /> Mill Yield Trend (Last 10 Batches)
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={millYieldTrend}>
              <defs>
                <linearGradient id="yieldG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="batch" tick={{ fontSize: 10 }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v: any) => `${v}%`} />
              <Area type="monotone" dataKey="yield" stroke="#6366f1" fill="url(#yieldG)" name="Yield %" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
              {/* 65% target line */}
              <Area type="monotone" dataKey={() => 65} stroke="#16a34a" fill="none" strokeDasharray="4 4" name="Target (65%)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2 text-center">Target yield is 65% — green dashed line</p>
        </div>
      )}
    </div>
    </PageTransition>
  );
}

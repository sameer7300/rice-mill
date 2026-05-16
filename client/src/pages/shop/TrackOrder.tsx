import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import { Package, Search, CheckCircle2, Truck, Clock, XCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import PageTransition from '../../components/PageTransition';

const formatPKR = (n: number) => `PKR ${(n || 0).toLocaleString()}`;

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_INFO: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending:    { label: 'Order Placed', icon: <ShoppingBag size={16} />, color: 'bg-yellow-500' },
  confirmed:  { label: 'Confirmed', icon: <CheckCircle2 size={16} />, color: 'bg-blue-500' },
  processing: { label: 'Processing', icon: <Clock size={16} />, color: 'bg-indigo-500' },
  shipped:    { label: 'Shipped', icon: <Truck size={16} />, color: 'bg-purple-500' },
  delivered:  { label: 'Delivered', icon: <CheckCircle2 size={16} />, color: 'bg-green-500' },
  cancelled:  { label: 'Cancelled', icon: <XCircle size={16} />, color: 'bg-red-500' }
};

export default function TrackOrder() {
  const [params] = useSearchParams();
  const [orderNum, setOrderNum] = useState(params.get('order') || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('order')) track(params.get('order')!);
  }, []);

  const track = async (num?: string) => {
    const n = (num || orderNum).trim().toUpperCase();
    if (!n) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await api.get(`/shop/track/${n}`);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const currentIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <PageTransition>
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-green-700" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
        <p className="text-gray-500 mt-1">Enter your order number to see the status</p>
      </div>

      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={orderNum}
          onChange={e => setOrderNum(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && track()}
          placeholder="e.g. ORD-202505-12345"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
        />
        <button onClick={() => track()} disabled={loading}
          className="px-5 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 flex items-center gap-2">
          <Search size={16} /> {loading ? '...' : 'Track'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center">{error}</div>
      )}

      {order && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono font-bold text-gray-900">{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">{order.customerName} · {order.deliveryAddress}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white ${STATUS_INFO[order.status]?.color || 'bg-gray-400'}`}>
                {STATUS_INFO[order.status]?.label || order.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Total</p>
                <p className="font-bold text-green-700">{formatPKR(order.totalAmount)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">Payment</p>
                <p className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'partial' ? 'text-yellow-600' : 'text-red-500'}`}>
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="font-semibold text-gray-800 mb-5">Order Progress</p>
              <div className="relative">
                {/* Progress line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200">
                  <div className="bg-green-500 w-full transition-all duration-500"
                    style={{ height: `${currentIdx >= 0 ? (currentIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }} />
                </div>
                <div className="space-y-5 relative">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentIdx;
                    const current = i === currentIdx;
                    const info = STATUS_INFO[step];
                    return (
                      <div key={step} className="flex items-center gap-4 pl-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${done ? info.color + ' text-white' : 'bg-gray-100 text-gray-400'} ${current ? 'ring-4 ring-offset-2 ring-green-200' : ''}`}>
                          {info.icon}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{info.label}</p>
                          {current && <p className="text-xs text-green-600 font-medium">Current status</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="font-semibold text-gray-800 mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.variety} Grade {item.grade} · {item.quantityKg}kg</span>
                  <span className="font-medium">{formatPKR(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <Link to="/" className="block text-center text-sm text-green-600 hover:text-green-800 font-medium py-2">← Continue Shopping</Link>
        </motion.div>
      )}
    </div>
    </PageTransition>
  );
}

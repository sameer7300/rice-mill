import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import toast from 'react-hot-toast';
import { Wheat, ShoppingCart, Star, Check, X, ArrowLeft } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

const makeAttrs = (fmt: (n: number) => string) => [
  { key: 'variety',     label: 'Variety' },
  { key: 'grade',       label: 'Grade' },
  { key: 'pricePerKg',  label: 'Price/kg',    format: (v: any) => fmt(Number(v)) },
  { key: 'minOrderKg',  label: 'Min Order',   format: (v: any) => `${v} kg` },
  { key: 'ageMonths',   label: 'Age',         format: (v: any) => v ? `${v} months` : '—' },
  { key: 'isOrganic',   label: 'Organic',     format: (v: any) => v ? <Check size={16} className="text-green-600" /> : <X size={16} className="text-red-400" /> },
  { key: 'isAvailable', label: 'In Stock',    format: (v: any) => v ? <Check size={16} className="text-green-600" /> : <X size={16} className="text-red-400" /> },
  { key: 'description', label: 'Description', format: (v: any) => v ? <span className="text-xs text-gray-600 line-clamp-3">{v}</span> : '—' },
];

export default function ComparePage() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const { addItem } = useCart();
  const { format } = useCurrency();
  const ATTRS = makeAttrs(format);

  useEffect(() => {
    const ids = (params.get('ids') || '').split(',').filter(Boolean).slice(0, 4);
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map(id => api.get(`/shop/products/${id}`).then(r => r.data).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [params]);

  const addToCart = (p: any) => {
    addItem({ productId: p.id, name: p.name, variety: p.variety, grade: p.grade, pricePerKg: p.pricePerKg, quantityKg: p.minOrderKg || 10, minOrderKg: p.minOrderKg || 10, imageUrl: p.imageUrl });
    toast.success(`${p.name} added to cart!`);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  if (products.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <Wheat size={48} className="mx-auto mb-4 text-gray-300" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">No Products to Compare</h1>
      <p className="text-gray-500 mb-6">Select products from the store to compare them side by side.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
        <ArrowLeft size={16} /> Browse Products
      </Link>
    </div>
  );

  return (
    <PageTransition>
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={16} /> Back to Store</Link>
        <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
        <span className="text-sm text-gray-400">{products.length} product{products.length > 1 ? 's' : ''} selected</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Product images / headers */}
          <thead>
            <tr>
              <th className="text-left py-4 pr-6 w-36 text-sm font-semibold text-gray-500 uppercase tracking-wide">Feature</th>
              {products.map(p => (
                <th key={p.id} className="py-4 px-4 min-w-[200px]">
                  <div className="flex flex-col items-center gap-3">
                    <Link to={`/products/${p.id}`} className="block w-full h-40 rounded-2xl overflow-hidden bg-green-50 border border-gray-100">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center"><Wheat size={32} className="text-green-300" /></div>
                      }
                    </Link>
                    <div className="text-center">
                      <Link to={`/products/${p.id}`} className="font-bold text-gray-900 hover:text-green-700 block text-sm leading-tight">{p.name}</Link>
                      {p.rating && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-500">{p.rating.toFixed(1)} ({p.reviewCount || 0})</span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors">
                      <ShoppingCart size={13} /> Add to Cart
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Attribute rows */}
          <tbody>
            {ATTRS.map((attr, idx) => {
              const vals = products.map(p => attr.format ? attr.format(p[attr.key]) : (p[attr.key] ?? '—'));
              const allSame = vals.every(v => JSON.stringify(v) === JSON.stringify(vals[0]));
              return (
                <tr key={attr.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3.5 pr-6 text-sm font-semibold text-gray-500 rounded-l-xl pl-4">{attr.label}</td>
                  {products.map((p, pi) => {
                    const val = attr.format ? attr.format(p[attr.key]) : (p[attr.key] ?? '—');
                    const isBest = attr.key === 'pricePerKg' && products.length > 1
                      && p.pricePerKg === Math.min(...products.map(x => x.pricePerKg));
                    return (
                      <td key={p.id} className={`py-3.5 px-4 text-center text-sm ${pi === products.length - 1 ? 'rounded-r-xl' : ''}`}>
                        <span className={isBest ? 'text-green-700 font-bold' : allSame ? 'text-gray-500' : 'text-gray-900 font-medium'}>
                          {val}
                        </span>
                        {isBest && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Best</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        Add more products from the{' '}
        <Link to="/" className="text-green-600 hover:underline">store</Link>{' '}
        using the compare checkboxes (up to 4 products).
      </div>
    </div>
    </PageTransition>
  );
}

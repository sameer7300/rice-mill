import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight, Mail } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';

function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      toast.success(data.message || 'Subscribed!');
      setEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error subscribing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-green-700 text-white rounded-2xl p-6">
      <Mail size={24} className="mb-3 text-green-200" />
      <h3 className="font-bold text-lg mb-1">Rice Price Updates</h3>
      <p className="text-green-200 text-sm mb-4">Get weekly price updates and new variety alerts.</p>
      <form onSubmit={subscribe} className="space-y-2">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          placeholder="your@email.com"
          className="w-full bg-white/20 text-white placeholder-green-200 border border-white/30 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
        <button type="submit" disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog').then(r => setPosts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16 px-4 text-center">
        <BookOpen size={36} className="mx-auto mb-4 opacity-80" />
        <h1 className="text-4xl font-extrabold mb-2">Blog</h1>
        <p className="text-green-200">Rice industry insights, farming news, and product updates.</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Posts */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-44 bg-gray-200" />
                  <div className="p-5 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-600">No posts yet</p>
              <p className="text-sm mt-1">Check back soon for articles and updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all block">
                  <div className="h-44 bg-green-50 overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen size={36} className="text-green-300" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <Calendar size={12} /> {formatDate(post.publishedAt || post.createdAt)}
                    </p>
                    <h2 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">Read more <ChevronRight size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <NewsletterBox />
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"><ChevronRight size={14} /> Shop Rice</Link>
              <Link to="/about" className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"><ChevronRight size={14} /> About Us</Link>
              <Link to="/contact" className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"><ChevronRight size={14} /> Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

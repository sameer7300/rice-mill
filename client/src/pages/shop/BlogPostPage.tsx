import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Calendar, ChevronLeft, Mail } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/PageTransition';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.get(`/blog/${slug}`).then(r => setPost(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      const { data } = await api.post('/newsletter/subscribe', { email });
      toast.success(data.message || 'Subscribed!');
      setEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error subscribing');
    } finally {
      setSubscribing(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  if (!post) return (
    <div className="text-center py-24 text-gray-400">
      <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium text-gray-600">Post not found</p>
      <Link to="/blog" className="text-green-600 hover:underline text-sm mt-2 block">← Back to Blog</Link>
    </div>
  );

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50">
      {/* Cover image */}
      {post.coverImage && (
        <div className="w-full h-72 md:h-96 overflow-hidden bg-green-50">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <Link to="/blog" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-700 mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Blog
        </Link>

        {/* Header */}
        <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
          <Calendar size={13} /> {formatDate(post.publishedAt || post.createdAt)}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-gray-500 mb-8 border-l-4 border-green-500 pl-4">{post.excerpt}</p>}

        {/* Content */}
        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-14 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-2xl p-8">
          <Mail size={28} className="mb-3 text-green-200" />
          <h3 className="text-xl font-bold mb-1">Get Rice Price Updates</h3>
          <p className="text-green-200 text-sm mb-5">Subscribe to our newsletter for weekly market insights and new product alerts.</p>
          <form onSubmit={subscribe} className="flex gap-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="your@email.com"
              className="flex-1 bg-white/20 text-white placeholder-green-200 border border-white/30 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
            <button type="submit" disabled={subscribing}
              className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 whitespace-nowrap">
              {subscribing ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

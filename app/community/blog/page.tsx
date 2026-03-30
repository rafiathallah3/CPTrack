import { createClient } from "@/utils/supabase/server";
import { createBlogPost } from "../../actions/community";
import Link from "next/link";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("blog_posts").select(`
    id, title, content, created_at,
    users(username)
  `).order("created_at", { ascending: false });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Developer Blog
      </h1>
      
      <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-2xl mb-12 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Write a Story</h2>
        <form action={createBlogPost} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Title</label>
            <input 
              name="title" 
              placeholder="What's on your mind?" 
              required 
              className="w-full p-4 bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Content</label>
            <textarea 
              name="content" 
              placeholder="Tell your story..." 
              rows={6} 
              required 
              className="w-full p-4 bg-gray-800/80 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            />
          </div>
          <button type="submit" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-bold shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5 transition-all w-fit">
            Publish Post
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts?.map((post: any) => (
          <article key={post.id} className="group bg-gray-900/40 border border-gray-800 p-8 rounded-2xl hover:border-gray-700 transition-all hover:shadow-2xl hover:shadow-blue-900/10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
            </div>
            <p className="text-gray-400 line-clamp-3 mb-6 leading-relaxed">
              {post.content}
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {post.users?.username?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200">{post.users?.username || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <Link href={`/community/blog/${post.id}`} className="text-sm font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 group/link">
                Read More 
                <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </article>
        ))}
        {posts?.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-xl text-gray-500">No blog posts found. Start the conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { getPostBySlug } from "../data/blogPosts";
import NotFound from "./NotFound";

function renderContent(content) {
  return content.map((block, i) => {
    if (block.type === "p") {
      return <p key={i} className="mb-4 text-primary/90 leading-relaxed">{block.text}</p>;
    }
    if (block.type === "h2") {
      return <h2 key={i} className="mt-8 mb-3 font-serif text-2xl font-semibold text-primary">{block.text}</h2>;
    }
    return null;
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <NotFound />;

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title={post.title}
        description={post.description}
        url={`/blog/${post.slug}`}
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary/70 hover:text-accent mb-6 transition-colors"
          >
            ← Blog
          </Link>

          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-primary mb-2">
              {post.title}
            </h1>
            <p className="text-sm text-primary/60 mb-8">
              {new Date(post.date).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {post.author && <span> · {post.author}</span>}
            </p>

            <div className="prose prose-invert max-w-none text-primary/90">
              {renderContent(post.content)}
            </div>

            <div className="mt-10 pt-8 border-t border-primary/10 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-accent text-primary font-medium hover:bg-accent/90 transition-colors"
              >
                Shop collection
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-primary/30 text-primary font-medium hover:border-accent hover:text-accent transition-colors"
              >
                All posts
              </Link>
            </div>
          </motion.article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

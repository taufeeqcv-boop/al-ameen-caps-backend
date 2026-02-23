import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import { BLOG_POSTS } from "../data/blogPosts";

export default function Blog() {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Blog – Islamic Headwear, Kufi & Cape Town"
        description="Articles on kufi, Taj, fez, and Islamic headwear in Cape Town and South Africa. Guides, Eid headwear, and tradition."
        url="/blog"
      />
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-semibold text-primary text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Blog
          </motion.h1>
          <motion.p
            className="text-accent font-serif text-xl text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Islamic headwear, Cape Town & South Africa
          </motion.p>

          <ul className="space-y-8">
            {BLOG_POSTS.map((post, i) => (
              <motion.li
                key={post.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
              >
                <article className="border-b border-primary/10 pb-8">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="block group"
                  >
                    <h2 className="font-serif text-2xl font-semibold text-primary group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-1 text-sm text-primary/60">
                      {new Date(post.date).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {post.category && (
                        <span className="ml-2 text-accent">· {post.category}</span>
                      )}
                    </p>
                    <p className="mt-2 text-primary/80 leading-relaxed">
                      {post.description}
                    </p>
                    <span className="mt-2 inline-block text-accent font-medium group-hover:underline">
                      Read more →
                    </span>
                  </Link>
                </article>
              </motion.li>
            ))}
          </ul>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-secondary font-medium hover:bg-primary/90 transition-colors"
            >
              Shop the collection
            </Link>
            <Link
              to="/guides"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-primary/30 text-primary font-medium hover:border-accent hover:text-accent transition-colors"
            >
              Guides
            </Link>
          </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

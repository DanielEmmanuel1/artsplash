'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Palette, Upload, DollarSign, Sparkles } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Upload size={40} />,
      title: 'Upload',
      description: 'Upload your unique artwork in PNG or JPEG format',
    },
    {
      icon: <Palette size={40} />,
      title: 'Mint',
      description: 'Convert your art into NFTs on the Avalanche blockchain',
    },
    {
      icon: <DollarSign size={40} />,
      title: 'Sell',
      description: 'List your NFTs for sale and earn from your creativity',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-smokeWhite dark:bg-gray/10 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Sparkles className="inline-block text-lightBlue mb-4" size={48} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold text-blue dark:text-lightBlue mb-6"
          >
            Welcome to{' '}
            <span className="font-cursive bg-linear-to-r from-lightBlue to-blue bg-clip-text text-transparent">
              Artistic Splash
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xl md:text-2xl text-metallicBlack/80 dark:text-smokeWhite/90 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Transform your creative vision into NFTs. Mint, collect, and trade
            unique digital art on the Avalanche blockchain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/mint">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-lightBlue text-white px-8 py-4 rounded-lg hover:bg-blue transition-colors duration-200 font-semibold text-lg shadow-lg"
              >
                Start Creating
              </motion.button>
            </Link>

            <Link href="/explore">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-silver text-black px-8 py-4 rounded-lg hover:bg-gray hover:text-white transition-colors duration-200 font-semibold text-lg shadow-lg"
              >
                Explore NFTs
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray/10">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-blue dark:text-lightBlue mb-16"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="bg-smokeWhite dark:bg-metallicBlack/80 rounded-xl p-8 text-center shadow-md hover:shadow-xl transition-shadow border border-transparent dark:border-gray/30"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-block text-lightBlue mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-blue dark:text-lightBlue mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray dark:text-smokeWhite">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-lightBlue dark:bg-blue">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the Artistic Splash community and start creating your NFT
            collection today
          </p>
          <Link href="/mint">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-lightBlue px-8 py-4 rounded-lg hover:bg-smokeWhite transition-colors duration-200 font-bold text-lg shadow-xl"
            >
              Mint Your First NFT
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

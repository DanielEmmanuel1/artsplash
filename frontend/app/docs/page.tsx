'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Book, Palette, Sparkles, Zap, Shield, Code, Rocket, TestTube, ShoppingCart, CheckCircle2, AlertCircle, Info, Wand2, Layers, Globe, Box, TrendingUp, Wallet, Store, FileCode, Menu, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Types for docs structure
type StepItem = { number: string; title: string; icon: ReactNode; content: string };
type SpecItem = { label: string; value: string; icon: ReactNode };
type ActionItem = { title: string; icon: ReactNode; content: string };
type CodeStep = { title: string; code: string };
type ConfigItem = { label: string; value: string };
type Category = { title: string; icon: ReactNode; items: string[] };
type Command = { label: string; code: string };

type HeroSection = { type: 'hero'; content: string };
type FeatureSection = { type: 'feature'; icon: ReactNode; title: string; content: string };
type InfoSection = { type: 'info'; icon: ReactNode; content: string };
type ClosingSection = { type: 'closing'; content: string };
type StepsSection = { type: 'steps'; steps: StepItem[] };
type WorkflowSection = { type: 'workflow'; title: string; steps: string[] };
type SpecsSection = { type: 'specs'; title: string; items: SpecItem[] };
type ActionsSection = { type: 'actions'; title: string; items: ActionItem[] };
type ContractSection = { type: 'contract'; name: string; description: string; features: string[]; functions: string[] };
type SecuritySection = { type: 'security'; title: string; items: string[] };
type PrerequisitesSection = { type: 'prerequisites'; title: string; items: string[] };
type CodeStepsSection = { type: 'code-steps'; title: string; steps: CodeStep[] };
type ConfigSection = { type: 'config'; title: string; items: ConfigItem[] };
type TestCategoriesSection = { type: 'test-categories'; categories: Category[] };
type CommandsSection = { type: 'commands'; title: string; commands: Command[] };

type Section =
  | HeroSection
  | FeatureSection
  | InfoSection
  | ClosingSection
  | StepsSection
  | WorkflowSection
  | SpecsSection
  | ActionsSection
  | ContractSection
  | SecuritySection
  | PrerequisitesSection
  | CodeStepsSection
  | ConfigSection
  | TestCategoriesSection
  | CommandsSection;

type DocEntry = {
  title: string;
  icon: ReactNode;
  gradient: string;
  sections: Section[];
};

type DocsSectionNav = { id: string; title: string; icon: ReactNode; items: Array<{ id: string; title: string }> };

const docsSections: DocsSectionNav[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Rocket size={16} />,
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quick-start', title: 'Quick Start' }
    ]
  },
  {
    id: 'features',
    title: 'Features',
    icon: <Sparkles size={16} />,
    items: [
      { id: 'nft-minting', title: 'NFT Minting' },
      { id: 'marketplace', title: 'Marketplace' }
    ]
  },
  {
    id: 'developer',
    title: 'Developer',
    icon: <Code size={16} />,
    items: [
      { id: 'smart-contracts', title: 'Smart Contracts' },
      { id: 'deployment', title: 'Deployment' },
      { id: 'testing', title: 'Testing' }
    ]
  }
];

const docContent: Record<string, DocEntry> = {
  introduction: {
    title: 'Introduction',
    icon: <Wand2 size={48} />,
    gradient: 'from-lightBlue to-blue',
    sections: [
      {
        type: 'hero',
        content: 'Artistic Splash is a decentralized platform built on Avalanche that empowers artists and animators to transform their digital creations into verifiable NFT assets. Rather than focusing on marketplace mechanics, Artistic Splash emphasizes the creative process itself — turning your art into something ownable, traceable, and permanent on the blockchain.'
      },
      {
        type: 'feature',
        icon: <Layers size={24} />,
        title: 'Digital Creation to NFT',
        content: 'Upload your work — whether it\'s a still image, digital painting, or animation — and instantly mint it into a one-of-one NFT. Each piece you create is recorded as an ERC-721 token, stored securely with its metadata on IPFS and validated on Avalanche for transparency and authenticity.'
      },
      {
        type: 'feature',
        icon: <Globe size={24} />,
        title: 'Decentralized Ownership',
        content: 'Once minted, your creation becomes a tokenized asset that lives independently of centralized platforms. You can showcase it, trade it, or simply hold it as proof of authorship. Every minting and transfer is handled on-chain, ensuring that ownership remains visible, secure, and permanent.'
      },
      {
        type: 'info',
        icon: <Info size={20} />,
        content: 'At this stage, Artistic Splash focuses on individual, single-edition artworks (1/1 NFTs) to give creators complete control over every unique piece. In future updates, artists will be able to expand into full collections — entire themed sets of art minted directly on-chain and curated under their creative identity.'
      },
      {
        type: 'closing',
        content: 'Artistic Splash is designed for creators who want more than just exposure. It\'s for those who want to preserve their art, authenticate it on the blockchain, and redefine what ownership means in the digital world.'
      }
    ]
  },
  'quick-start': {
    title: 'Quick Start',
    icon: <Zap size={48} />,
    gradient: 'from-lightBlue to-blue',
    sections: [
      {
        type: 'steps',
        steps: [
          {
            number: '01',
            title: 'Connect Wallet',
            icon: <Wallet size={24} />,
            content: 'Begin by connecting your wallet and switching to Avalanche Fuji Testnet if prompted. If you need gas, request a small amount of AVAX from the faucet.'
          },
          {
            number: '02',
            title: 'Mint Your Art',
            icon: <Wand2 size={24} />,
            content: 'Open Mint to upload your image, write a short description, and confirm the mint transaction.'
          },
          {
            number: '03',
            title: 'List for Sale',
            icon: <Store size={24} />,
            content: 'Go to your Dashboard to list the NFT for sale; you can delist and adjust your price anytime.'
          }
        ]
      }
    ]
  },
  'nft-minting': {
    title: 'NFT Minting',
    icon: <Wand2 size={48} />,
    gradient: 'from-lightBlue to-blue',
    sections: [
      {
        type: 'hero',
        content: 'Minting turns your artwork into a unique ERC-721 token. Images and metadata live on IPFS; the token lives on Avalanche.'
      },
      {
        type: 'workflow',
        title: 'Workflow',
        steps: [
          'Upload an image (PNG/JPEG)',
          'Add a name and description',
          'Confirm the mint transaction in your wallet',
          'View real-time status for IPFS upload, metadata creation, and on-chain mint'
        ]
      },
      {
        type: 'specs',
        title: 'Technical Specifications',
        items: [
          { label: 'Storage', value: 'IPFS (via Pinata)', icon: <Box size={20} /> },
          { label: 'Standard', value: 'ERC-721', icon: <FileCode size={20} /> },
          { label: 'Cost', value: 'Gas only (subject to network conditions)', icon: <Zap size={20} /> }
        ]
      }
    ]
  },
  'marketplace': {
    title: 'Marketplace',
    icon: <Store size={48} />,
    gradient: 'from-lightBlue to-blue',
    sections: [
      {
        type: 'hero',
        content: 'When you list an NFT, the marketplace holds it in escrow. Buyers purchase with AVAX; the NFT transfers to the buyer and proceeds are distributed (including royalty and platform fee). You can delist anytime to receive the NFT back.'
      },
      {
        type: 'actions',
        title: 'Marketplace Actions',
        items: [
          {
            title: 'List',
            icon: <TrendingUp size={24} />,
            content: 'Choose an NFT in Dashboard, set a price, confirm. The NFT moves to escrow until sold or delisted.'
          },
          {
            title: 'Buy',
            icon: <ShoppingCart size={24} />,
            content: 'Open Explore, pick a listing, confirm the purchase in your wallet.'
          },
          {
            title: 'Delist',
            icon: <AlertCircle size={24} />,
            content: 'Cancel a listing to return the NFT from escrow to your wallet.'
          }
        ]
      }
    ]
  },
  'smart-contracts': {
    title: 'Smart Contracts',
    icon: <FileCode size={48} />,
    gradient: 'from-lightBlue to-blue',
    sections: [
      {
        type: 'hero',
        content: 'Production-ready Solidity contracts with security best practices.'
      },
      {
        type: 'contract',
        name: 'ArtisticSplashNFT.sol',
        description: 'ERC-721 NFT Contract with Advanced Features',
        features: [
          'ERC-721 Compliance: Standard NFT functionality',
          'ERC-2981 Royalties: Automatic royalty distribution',
          'Access Control: Role-based permissions',
          'Time-Based Limits: Fair minting restrictions',
          'Batch Operations: Efficient bulk minting'
        ],
        functions: [
          'publicMint(): Public minting with limits',
          'safeMint(): Admin-only unlimited minting',
          'batchMint(): Multiple NFT creation',
          'setDefaultRoyalty(): Configure royalty rates',
          'configurePublicMint(): Set minting parameters'
        ]
      },
      {
        type: 'contract',
        name: 'ArtisticSplashMarketplace.sol',
        description: 'Decentralized Marketplace Contract',
        features: [
          'Secure Trading: ReentrancyGuard protection',
          'Fee Management: Configurable platform fees',
          'Royalty Support: Automatic creator payments',
          'Escrow System: Safe transaction handling'
        ],
        functions: [
          'listItem(): Create marketplace listing',
          'buyItem(): Purchase with automatic transfers',
          'cancelListing(): Remove listings',
          'withdrawProceeds(): Collect earnings'
        ]
      },
      {
        type: 'security',
        title: 'Security Features',
        items: [
          'OpenZeppelin Integration',
          'AccessControl: Role-based permissions',
          'ReentrancyGuard: Attack prevention',
          'ERC2981: Standard royalty support',
          'Input Validation: Comprehensive checks',
          'Error Handling: Clear error messages',
          'Event Logging: Complete audit trail',
          'Gas Optimization: Efficient operations'
        ]
      }
    ]
  },
  deployment: {
    title: 'Deployment',
    icon: <Rocket size={48} />,
    gradient: 'from-lightBlue to-blue',
    sections: [
      {
        type: 'hero',
        content: 'Deploy smart contracts to Avalanche networks.'
      },
      {
        type: 'prerequisites',
        title: 'Prerequisites',
        items: [
          'Node.js 18+',
          'Hardhat development environment',
          'Avalanche wallet with test AVAX',
          'Environment variables configured'
        ]
      },
      {
        type: 'code-steps',
        title: 'Deployment Process',
        steps: [
          { title: 'Compile Contracts', code: 'npm run compile' },
          { title: 'Deploy to Fuji Testnet', code: 'npm run deploy:fuji' },
          { title: 'Update Frontend', code: 'NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...\nNEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=0x...' },
          { title: 'Restart Frontend', code: 'cd frontend\nnpm run dev' }
        ]
      },
      {
        type: 'config',
        title: 'Network Configuration',
        items: [
          { label: 'Fuji Testnet', value: 'Chain ID 43113' },
          { label: 'Mainnet', value: 'Chain ID 43114' },
          { label: 'RPC Endpoints', value: 'Avalanche public RPCs' },
          { label: 'Block Explorer', value: 'Snowtrace integration' }
        ]
      }
    ]
  },
  testing: {
    title: 'Testing',
    icon: <TestTube size={48} />,
    gradient: 'from-lightBlue to-blue',
    sections: [
      {
        type: 'hero',
        content: 'Comprehensive testing strategies for the NFT marketplace.'
      },
      {
        type: 'test-categories',
        categories: [
          {
            title: 'Unit Tests',
            icon: <Code size={24} />,
            items: [
              'Contract Functions: Individual function testing',
              'Access Control: Role-based permission testing',
              'Edge Cases: Boundary condition testing',
              'Error Handling: Failure scenario testing'
            ]
          },
          {
            title: 'Integration Tests',
            icon: <Layers size={24} />,
            items: [
              'End-to-End: Complete user workflows',
              'Wallet Integration: Multi-wallet compatibility',
              'IPFS Integration: Storage and retrieval testing',
              'Marketplace: Trading functionality testing'
            ]
          },
          {
            title: 'Security Tests',
            icon: <Shield size={24} />,
            items: [
              'Reentrancy: Attack vector testing',
              'Access Control: Permission bypass testing',
              'Input Validation: Malicious input testing',
              'Gas Optimization: DoS prevention testing'
            ]
          }
        ]
      },
      {
        type: 'commands',
        title: 'Running Tests',
        commands: [
          { label: 'Contract Tests', code: 'npm run test' },
          { label: 'Frontend Tests', code: 'cd frontend\nnpm run test' },
          { label: 'E2E Tests', code: 'npm run test:e2e' }
        ]
      }
    ]
  }
};

const renderSection = (section: Section): ReactNode => {
  switch (section.type) {
    case 'hero':
      return (
        <div className="mb-8">
          <p className="text-xl text-gray dark:text-smokeWhite leading-relaxed">
            {section.content}
          </p>
        </div>
      );
    
    case 'feature':
      return (
        <div className="mb-6 p-6 bg-white dark:bg-gray/10 rounded-xl border border-gray/20 dark:border-gray/30">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-lightBlue/10 rounded-lg text-lightBlue shrink-0">
              {section.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-metallicBlack dark:text-white mb-2">
                {section.title}
              </h3>
              <p className="text-gray dark:text-smokeWhite leading-relaxed">
                {section.content}
              </p>
            </div>
          </div>
        </div>
      );
    
    case 'info':
      return (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-lightBlue shrink-0 mt-0.5">
              {section.icon}
            </div>
            <p className="text-blue-900 dark:text-blue-200 text-sm leading-relaxed">
              {section.content}
            </p>
          </div>
        </div>
      );
    
    case 'closing':
      return (
        <div className="mt-8 p-6 bg-linear-to-r from-lightBlue/10 to-blue/10 rounded-xl border border-lightBlue/20">
          <p className="text-lg text-metallicBlack dark:text-white leading-relaxed">
            {section.content}
          </p>
        </div>
      );
    
    case 'steps':
      return (
        <div className="space-y-6">
          {section.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-20 pb-8 border-l-2 border-lightBlue/30 last:border-l-0 last:pb-0"
            >
              <div className="absolute left-0 top-0 -translate-x-1/2 w-12 h-12 bg-linear-to-br from-lightBlue to-blue rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                {step.number}
              </div>
              <div className="bg-white dark:bg-gray/10 rounded-xl p-6 border border-gray/20 dark:border-gray/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-lightBlue">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-metallicBlack dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray dark:text-smokeWhite leading-relaxed">
                  {step.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      );
    
    case 'workflow':
      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white mb-4">
            {section.title}
          </h3>
          <div className="space-y-3">
            {section.steps.map((step, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-4 bg-white dark:bg-gray/10 rounded-lg border border-gray/20 dark:border-gray/30">
                <div className="w-8 h-8 bg-lightBlue rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {idx + 1}
                </div>
                <p className="text-gray dark:text-smokeWhite">{step}</p>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'specs':
      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white mb-4">
            {section.title}
          </h3>
          <div className="grid gap-4">
            {section.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-linear-to-r from-white to-gray-50 dark:from-gray/10 dark:to-gray/5 rounded-lg border border-gray/20 dark:border-gray/30">
                <div className="flex items-center space-x-3">
                  <div className="text-lightBlue">
                    {item.icon}
                  </div>
                  <span className="font-medium text-metallicBlack dark:text-white">
                    {item.label}
                  </span>
                </div>
                <span className="text-gray dark:text-smokeWhite">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'actions':
      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white mb-4">
            {section.title}
          </h3>
          <div className="grid gap-4">
            {section.items.map((item, idx) => (
              <div key={idx} className="p-6 bg-white dark:bg-gray/10 rounded-xl border border-gray/20 dark:border-gray/30 hover:border-lightBlue/50 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-lightBlue">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-metallicBlack dark:text-white">
                    {item.title}
                  </h4>
                </div>
                <p className="text-gray dark:text-smokeWhite leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'contract':
      return (
        <div className="mb-8 p-6 bg-white dark:bg-gray/10 rounded-xl border border-gray/20 dark:border-gray/30">
          <div className="mb-4">
            <h3 className="text-2xl font-mono font-bold text-lightBlue mb-2">
              {section.name}
            </h3>
            <p className="text-gray dark:text-smokeWhite italic">
              {section.description}
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-metallicBlack dark:text-white mb-3">
              Key Features
            </h4>
            <div className="space-y-2">
              {section.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 size={18} className="text-lightBlue shrink-0 mt-0.5" />
                  <span className="text-gray dark:text-smokeWhite text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-metallicBlack dark:text-white mb-3">
              Functions
            </h4>
            <div className="space-y-2">
              {section.functions.map((func: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-2 font-mono text-sm">
                  <Code size={16} className="text-lightBlue shrink-0 mt-1" />
                  <span className="text-gray dark:text-smokeWhite">{func}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    
    case 'security':
      return (
        <div className="mb-8 p-6 bg-linear-to-br from-lightBlue/10 to-blue/10 rounded-xl border border-lightBlue/20 dark:border-blue/20">
          <div className="flex items-center space-x-3 mb-4">
            <Shield size={32} className="text-lightBlue" />
            <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white">
              {section.title}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {section.items.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <CheckCircle2 size={16} className="text-lightBlue shrink-0" />
                <span className="text-sm text-gray dark:text-smokeWhite">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'prerequisites':
      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white mb-4">
            {section.title}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {section.items.map((item: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-3 p-4 bg-white dark:bg-gray/10 rounded-lg border border-gray/20 dark:border-gray/30">
                <CheckCircle2 size={20} className="text-lightBlue shrink-0" />
                <span className="text-gray dark:text-smokeWhite">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'code-steps':
      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white mb-4">
            {section.title}
          </h3>
          <div className="space-y-4">
            {section.steps.map((step: CodeStep, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-lightBlue rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {idx + 1}
                  </div>
                  <h4 className="font-semibold text-metallicBlack dark:text-white">
                    {step.title}
                  </h4>
                </div>
                <div className="ml-8 p-4 bg-metallicBlack dark:bg-gray/20 rounded-lg border border-gray/30">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                    {step.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'config':
      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white mb-4">
            {section.title}
          </h3>
          <div className="space-y-3">
            {section.items.map((item: ConfigItem, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-gray/10 rounded-lg border border-gray/20 dark:border-gray/30">
                <span className="font-medium text-metallicBlack dark:text-white">
                  {item.label}
                </span>
                <span className="text-gray dark:text-smokeWhite font-mono text-sm">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'test-categories':
      return (
        <div className="mb-8 grid gap-6">
            {section.categories.map((category: Category, idx) => (
            <div key={idx} className="p-6 bg-white dark:bg-gray/10 rounded-xl border border-gray/20 dark:border-gray/30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-lightBlue">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-metallicBlack dark:text-white">
                  {category.title}
                </h3>
              </div>
              <div className="space-y-2">
                {category.items.map((item: string, itemIdx: number) => (
                  <div key={itemIdx} className="flex items-start space-x-2">
                <CheckCircle2 size={16} className="text-lightBlue shrink-0 mt-0.5" />
                    <span className="text-sm text-gray dark:text-smokeWhite">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    
    case 'commands':
      return (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-metallicBlack dark:text-white mb-4">
            {section.title}
          </h3>
          <div className="space-y-3">
            {section.commands.map((cmd: Command, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="font-medium text-metallicBlack dark:text-white">
                  {cmd.label}
                </h4>
                <div className="p-4 bg-metallicBlack dark:bg-gray/20 rounded-lg border border-gray/30">
                  <pre className="text-sm text-green-400 font-mono">
                    {cmd.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    default:
      return null;
  }
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [expandedSections, setExpandedSections] = useState(['getting-started']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const currentContent = docContent[activeSection as keyof typeof docContent];

  return (
    <div className="min-h-screen bg-smokeWhite dark:bg-metallicBlack">
      {/* Header */}
      <div className="bg-white dark:bg-gray/20 border-b border-gray/20 dark:border-gray/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-linear-to-br from-lightBlue to-blue rounded-lg flex items-center justify-center shadow-lg">
                <Palette className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-semibold bg-linear-to-r from-lightBlue to-blue bg-clip-text text-transparent">
                Artistic Splash Documentation
              </h1>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href="/mint" 
                className="text-gray dark:text-smokeWhite hover:text-lightBlue transition-colors font-medium"
              >
                Mint
              </a>
              <a 
                href="/explore" 
                className="text-gray dark:text-smokeWhite hover:text-lightBlue transition-colors font-medium"
              >
                Explore
              </a>
              <a 
                href="/dashboard" 
                className="text-gray dark:text-smokeWhite hover:text-lightBlue transition-colors font-medium"
              >
                Dashboard
              </a>
              <ThemeToggle />
            </div>
            {/* Mobile Hamburger */}
            <button
              aria-label="Open menu"
              className="md:hidden p-2 rounded-lg border border-gray/20 dark:border-gray/30 hover:bg-smokeWhite dark:hover:bg-gray/30"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="text-metallicBlack dark:text-white" size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-In Menu */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed right-0 top-0 bottom-0 w-80 max-w-[85%] bg-white dark:bg-metallicBlack border-l border-gray/20 dark:border-gray/30 z-50 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-semibold text-metallicBlack dark:text-white">Menu</span>
              <button
                aria-label="Close menu"
                className="p-2 rounded-lg hover:bg-smokeWhite dark:hover:bg-gray/30"
                onClick={() => setMobileOpen(false)}
              >
                <X className="text-metallicBlack dark:text-white" size={22} />
              </button>
            </div>
            <nav className="space-y-4 mb-6">
              <a href="/mint" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-metallicBlack dark:text-white hover:bg-smokeWhite dark:hover:bg-gray/30">Mint</a>
              <a href="/explore" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-metallicBlack dark:text-white hover:bg-smokeWhite dark:hover:bg-gray/30">Explore</a>
              <a href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-base font-medium text-metallicBlack dark:text-white hover:bg-smokeWhite dark:hover:bg-gray/30">Dashboard</a>
            </nav>
            <div className="mt-auto">
              <ThemeToggle />
            </div>
          </motion.div>
        </>
      )}

      <div className="w-full flex">
        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray/20 border-r border-gray/20 dark:border-gray/30 min-h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="p-2 bg-linear-to-br from-lightBlue to-blue rounded-lg">
                <Book className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-semibold text-metallicBlack dark:text-white">
                Documentation
              </h1>
            </div>
            
            <nav className="space-y-2">
              {docsSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-smokeWhite dark:hover:bg-gray/30 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="text-lightBlue group-hover:scale-110 transition-transform">
                        {section.icon}
                      </div>
                      <span className="text-metallicBlack dark:text-white font-medium">
                        {section.title}
                      </span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className={`text-gray dark:text-smokeWhite transition-transform ${
                        expandedSections.includes(section.id) ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 space-y-1 mt-1"
                    >
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full p-2 text-left rounded-lg transition-all ${
                            activeSection === item.id
                              ? 'bg-linear-to-r from-lightBlue/20 to-blue/20 text-lightBlue border-l-2 border-lightBlue'
                              : 'text-gray dark:text-smokeWhite hover:bg-smokeWhite dark:hover:bg-gray/30 hover:translate-x-1'
                          }`}
                        >
                          <span className="text-sm">{item.title}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Page Header */}
              <div className="mb-12">
                <div className="flex items-center space-x-4 mb-4">
              <div className={`p-4 bg-linear-to-br ${currentContent.gradient} rounded-2xl text-white shadow-lg`}>
                    {currentContent.icon}
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold text-metallicBlack dark:text-white mb-2">
                      {currentContent.title}
                    </h1>
                    {/* underline removed per palette guidelines */}
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-">
                {currentContent.sections?.map((section: Section, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {renderSection(section)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
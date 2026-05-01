import { Search, Bell, User, Wallet } from 'lucide-react';

type NavbarProps = {
  backendOk?: boolean;
  connected?: boolean;
  username?: string;
  onWalletClick?: () => void;
  onBridgeClick?: () => void;
};

export function Navbar({ connected, username, onWalletClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <img
                src="/src/imports/prism-2.png"
                alt="PRISM Logo"
                className="h-10 w-auto"
              />
              <span className="text-2xl font-display text-gray-900">
                PRISM
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#discover" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Discover
              </a>
              <a href="#dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Dashboard
              </a>
              <a href="#ai" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                AI
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Pricing
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            <button 
              onClick={onWalletClick}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              {connected ? username ?? 'Wallet' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

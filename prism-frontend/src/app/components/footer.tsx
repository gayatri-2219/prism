import { Twitter, Github, MessageCircle, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t-2 border-gray-200 py-12 px-6 mt-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/src/imports/prism-2.png"
                alt="PRISM Logo"
                className="h-10 w-auto"
              />
              <span className="text-xl font-display text-gray-900">
                PRISM
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              AI-powered DeFi intelligence layer built on Initia Chain 🚀
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Discover</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Dashboard</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">AI Assistant</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Documentation 📚</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">API Reference</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Tutorials</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Blog ✍️</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Community</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Discord 💬</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Twitter 🐦</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">GitHub</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors font-medium">Support 💁</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t-2 border-gray-200">
          <p className="text-sm text-gray-500 mb-4 md:mb-0 font-medium">
            © 2026 PRISM. All rights reserved. Made with ❤️
          </p>

          <div className="flex items-center gap-3">
            <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 rounded-xl flex items-center justify-center transition-all shadow-sm">
              <Twitter className="w-5 h-5 text-blue-600" />
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 rounded-xl flex items-center justify-center transition-all shadow-sm">
              <Github className="w-5 h-5 text-purple-600" />
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300 rounded-xl flex items-center justify-center transition-all shadow-sm">
              <MessageCircle className="w-5 h-5 text-pink-600" />
            </a>
            <a href="#" className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-cyan-200 hover:from-cyan-200 hover:to-cyan-300 rounded-xl flex items-center justify-center transition-all shadow-sm">
              <Mail className="w-5 h-5 text-cyan-600" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

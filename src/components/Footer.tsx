import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { path: '/', label: 'Home', punjabi: 'ਘਰ' },
    { path: '/lessons', label: 'Lessons', punjabi: 'ਪਾਠ' },
    { path: '/dashboard', label: 'Dashboard', punjabi: 'ਡੈਸ਼ਬੋਰਡ' },
    { path: '/games', label: 'Games', punjabi: 'ਖੇਡਾਂ' },
  ]

  const supportLinks = [
    { href: '#', label: 'Help Center', punjabi: 'ਮਦਦ ਕੇਂਦਰ' },
    { href: '#', label: 'Contact Us', punjabi: 'ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ' },
    { href: '#', label: 'Privacy Policy', punjabi: 'ਗੁਪਤਤਾ ਨੀਤੀ' },
    { href: '#', label: 'Terms of Service', punjabi: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ' },
  ]

  const socialLinks = [
    { href: '#', icon: '📘', label: 'Facebook' },
    { href: '#', icon: '🐦', label: 'Twitter' },
    { href: '#', icon: '📷', label: 'Instagram' },
    { href: '#', icon: '💼', label: 'LinkedIn' },
  ]

  return (
    <footer className="bg-gradient-to-br from-punjab-green-800 via-punjab-green-900 to-punjab-yellow-800 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-punjab-yellow-400 via-punjab-green-400 to-punjab-yellow-400"></div>
      
      <div className="container-punjab py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-14 h-14 bg-gradient-to-br from-punjab-yellow-400 to-punjab-green-400 rounded-2xl flex items-center justify-center shadow-punjab group-hover:shadow-warm transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-2xl">ਨ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-gradient-to-r from-punjab-yellow-300 to-punjab-green-300 bg-clip-text text-transparent">
                  NabhaLearn
                </span>
                <span className="text-sm text-punjab-yellow-200 font-punjabi">ਨਭਾ ਲਰਨ</span>
              </div>
            </Link>
            
            <p className="text-punjab-yellow-100 max-w-lg text-lg leading-relaxed mb-6">
              Empowering learners with interactive educational content and 
              gamified learning experiences. Learn anywhere, anytime with our 
              Punjab-inspired learning platform.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl hover:bg-white/20 hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-punjab-yellow-200">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-punjab-yellow-100 hover:text-white transition-colors duration-200 group"
                  >
                    <span className="w-2 h-2 bg-punjab-yellow-400 rounded-full group-hover:bg-punjab-green-400 transition-colors duration-200"></span>
                    <div className="flex flex-col">
                      <span className="font-medium">{link.label}</span>
                      <span className="text-xs text-punjab-yellow-200 font-punjabi">{link.punjabi}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-punjab-yellow-200">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="flex items-center space-x-2 text-punjab-yellow-100 hover:text-white transition-colors duration-200 group"
                  >
                    <span className="w-2 h-2 bg-punjab-green-400 rounded-full group-hover:bg-punjab-yellow-400 transition-colors duration-200"></span>
                    <div className="flex flex-col">
                      <span className="font-medium">{link.label}</span>
                      <span className="text-xs text-punjab-yellow-200 font-punjabi">{link.punjabi}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-punjab-yellow-200/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-punjab-yellow-200">
                © {currentYear} NabhaLearn. All rights reserved.
              </p>
              <p className="text-punjab-yellow-300 text-sm mt-1">
                Built with ❤️ using React + Vite + TailwindCSS
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-punjab-yellow-200">
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-punjab-green-400 rounded-full"></span>
                <span>Made in Punjab</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-punjab-yellow-400 rounded-full"></span>
                <span>PWA Ready</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-punjab-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-punjab-green-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-punjab-orange-400 rounded-full blur-2xl"></div>
      </div>
    </footer>
  )
}

export default Footer

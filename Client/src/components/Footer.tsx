export default function Footer() {

    return (
    <footer className="bg-brand-950 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-serif font-bold mb-6">Nteer</h2>
            <p className="text-brand-400 max-w-sm leading-relaxed">
              We believe in the power of human connection. Our mission is to make volunteering as easy as ordering a ride, empowering everyone to serve their community.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-brand-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-brand-400 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-brand-500">
          <p>© 2026 Nteer Technologies Inc.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">English (US)</a>
            <a href="#" className="hover:text-white transition-colors">Nairobi</a>
          </div>
        </div>
      </footer>
    )
}
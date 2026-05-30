import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

interface NavItemProps {
  label: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}

function NavItem({ label, hasDropdown = false, onClick }: NavItemProps) {
  return (
    <li 
      onClick={onClick}
      className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 group"
    >
      <span>{label}</span>
      {hasDropdown && (
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </li>
  );
}

export default function Navbar() {
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Search API', hasDropdown: true },
    { label: 'Scrape & Crawl', hasDropdown: true },
    { label: 'Deep Research', hasDropdown: false },
    { label: 'Playground', hasDropdown: false, onClick: () => navigate('/signin') },
  ];

  return (
    <nav className="flex items-center justify-between py-6 px-6 md:px-10 w-full relative z-10 select-none">
      {/* Left Side Branding */}
      <div className="flex-1 hidden md:block">
        <a href="/" className="font-semibold tracking-tight text-2xl text-[rgba(30,50,90,0.9)] hover:opacity-80 transition-opacity">
          Fearch
        </a>
      </div>

      {/* Center Menu */}
      <ul className="hidden md:flex items-center gap-8 text-[rgb(45,45,45)] font-normal text-sm">
        {menuItems.map((item) => (
          <NavItem 
            key={item.label} 
            label={item.label} 
            hasDropdown={item.hasDropdown} 
            onClick={item.onClick}
          />
        ))}
      </ul>

      {/* Mobile Logo */}
      <div className="md:hidden">
        <span className="font-regular tracking-tighter text-xl text-[rgba(30,50,90,0.9)]">
          Fearch
        </span>
      </div>

      {/* Right Button */}
      <div className="flex-1 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/signin')}
          className="flex items-center bg-[rgba(30,50,90,0.8)] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[rgba(30,50,90,1)] transition-colors group cursor-pointer"
        >
          <div className="bg-white/20 p-1 md:p-1.5 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-xs md:text-sm font-normal">Console</span>
        </motion.button>
      </div>
    </nav>
  );
}

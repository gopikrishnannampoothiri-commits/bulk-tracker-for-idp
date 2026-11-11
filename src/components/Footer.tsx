import React from 'react';
import { Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 px-6 py-3.5 text-xs text-slate-500">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Copyright & Terms */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span>Copyright © 2026 Mitsogo Inc. All Rights Reserved.</span>
          <a href="#terms" className="text-indigo-600 hover:underline">
            Privacy Terms
          </a>
          <span>.</span>
        </div>

        {/* Right Contact & Support */}
        <div className="flex items-center space-x-6 text-[11px]">
          <a
            href="tel:+14156367555"
            className="flex items-center space-x-1.5 hover:text-slate-900 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>+1-415-636-7555</span>
          </a>

          <a
            href="mailto:idp-support@hexnode.com"
            className="flex items-center space-x-1.5 hover:text-slate-900 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>idp-support@hexnode.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};


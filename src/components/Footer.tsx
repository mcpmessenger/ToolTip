import React from 'react';
import { Link } from 'react-router-dom';
import ImagePreviewTooltip from './ImagePreviewTooltip';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-gray-800 bg-gray-950/80 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm">© {year} ToolTip Companion. All rights reserved.</div>
        <nav className="flex items-center gap-4 text-sm">
          <ImagePreviewTooltip
            imageSrc="/Screenshot 2025-10-30 205643.png"
            alt="Privacy Policy Page Preview"
          >
            <Link to="/privacy" className="hover:text-gray-200 underline">Privacy Policy</Link>
          </ImagePreviewTooltip>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;



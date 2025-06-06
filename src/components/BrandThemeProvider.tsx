
import React, { useEffect } from 'react';
import { useLoanContext } from '../context/LoanContext';

interface BrandThemeProviderProps {
  children: React.ReactNode;
}

const BrandThemeProvider: React.FC<BrandThemeProviderProps> = ({ children }) => {
  const { state } = useLoanContext();

  useEffect(() => {
    const root = document.documentElement;
    const brandColor = state.settings.brandColor;
    
    // Convert hex to HSL for better color variations
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0;
        }
        h /= 6;
      }

      return [h * 360, s * 100, l * 100];
    };

    const [h, s, l] = hexToHsl(brandColor);
    
    // Set CSS custom properties for brand colors
    root.style.setProperty('--brand-primary', `${h} ${s}% ${l}%`);
    root.style.setProperty('--brand-primary-foreground', `0 0% ${l > 50 ? '0%' : '100%'}`);
    root.style.setProperty('--brand-hover', `${h} ${s}% ${Math.max(l - 10, 10)}%`);
    root.style.setProperty('--brand-light', `${h} ${Math.max(s - 20, 20)}% ${Math.min(l + 30, 95)}%`);
    
    // Add CSS for company name styling
    const style = document.createElement('style');
    style.textContent = `
      .company-name {
        font-weight: bold;
        color: ${brandColor};
      }
    `;
    
    // Remove any previously added style tag
    const existingStyle = document.getElementById('brand-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new style tag
    style.id = 'brand-styles';
    document.head.appendChild(style);
    
  }, [state.settings.brandColor, state.settings.companyName]);

  return <>{children}</>;
};

export default BrandThemeProvider;
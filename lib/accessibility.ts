// Accessibility utilities and testing helpers

// WCAG 2.1 contrast ratio calculator
export const calculateContrastRatio = (color1: string, color2: string): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

// Check if contrast ratio meets WCAG standards
export const meetsWCAGStandards = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = calculateContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  } else {
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
};

// Accessibility testing utilities
export const accessibilityTests = {
  // Check if element has proper focus indicators
  hasFocusIndicator: (element: HTMLElement): boolean => {
    const styles = window.getComputedStyle(element, ':focus');
    return (
      styles.outline !== 'none' ||
      styles.boxShadow !== 'none' ||
      styles.border !== styles.getPropertyValue('border') // Border changes on focus
    );
  },

  // Check if interactive elements have sufficient size (44x44px minimum)
  hasSufficientTouchTarget: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44;
  },

  // Check if images have alt text
  hasAltText: (img: HTMLImageElement): boolean => {
    return img.hasAttribute('alt');
  },

  // Check if form inputs have labels
  hasLabel: (input: HTMLInputElement): boolean => {
    const id = input.id;
    if (!id) return false;
    
    const label = document.querySelector(`label[for="${id}"]`);
    return label !== null || input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
  },

  // Check if headings are in proper order
  hasProperHeadingOrder: (): boolean => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    
    for (const heading of headings) {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        return false; // Skipped a level
      }
      lastLevel = level;
    }
    
    return true;
  },

  // Check if page has a main landmark
  hasMainLandmark: (): boolean => {
    return document.querySelector('main, [role="main"]') !== null;
  },

  // Check if page has skip links
  hasSkipLinks: (): boolean => {
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    return Array.from(skipLinks).some(link => 
      link.textContent?.toLowerCase().includes('skip') ||
      link.textContent?.toLowerCase().includes('main')
    );
  }
};

// Run accessibility audit
export const runAccessibilityAudit = (): {
  passed: string[];
  failed: string[];
  warnings: string[];
} => {
  const results = {
    passed: [] as string[],
    failed: [] as string[],
    warnings: [] as string[]
  };

  // Test heading order
  if (accessibilityTests.hasProperHeadingOrder()) {
    results.passed.push('Headings are in proper sequential order');
  } else {
    results.failed.push('Headings skip levels or are out of order');
  }

  // Test main landmark
  if (accessibilityTests.hasMainLandmark()) {
    results.passed.push('Page has main landmark');
  } else {
    results.failed.push('Page missing main landmark');
  }

  // Test skip links
  if (accessibilityTests.hasSkipLinks()) {
    results.passed.push('Page has skip navigation links');
  } else {
    results.warnings.push('Consider adding skip navigation links');
  }

  // Test images
  const images = document.querySelectorAll('img');
  let imagesWithAlt = 0;
  images.forEach(img => {
    if (accessibilityTests.hasAltText(img)) {
      imagesWithAlt++;
    }
  });

  if (images.length === 0) {
    results.passed.push('No images to check for alt text');
  } else if (imagesWithAlt === images.length) {
    results.passed.push('All images have alt text');
  } else {
    results.failed.push(`${images.length - imagesWithAlt} images missing alt text`);
  }

  // Test form inputs
  const inputs = document.querySelectorAll('input, textarea, select');
  let inputsWithLabels = 0;
  inputs.forEach(input => {
    if (accessibilityTests.hasLabel(input as HTMLInputElement)) {
      inputsWithLabels++;
    }
  });

  if (inputs.length === 0) {
    results.passed.push('No form inputs to check for labels');
  } else if (inputsWithLabels === inputs.length) {
    results.passed.push('All form inputs have labels');
  } else {
    results.failed.push(`${inputs.length - inputsWithLabels} form inputs missing labels`);
  }

  // Test interactive elements size
  const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
  let elementsWithSufficientSize = 0;
  interactiveElements.forEach(element => {
    if (accessibilityTests.hasSufficientTouchTarget(element as HTMLElement)) {
      elementsWithSufficientSize++;
    }
  });

  if (elementsWithSufficientSize === interactiveElements.length) {
    results.passed.push('All interactive elements have sufficient touch target size');
  } else {
    results.warnings.push(`${interactiveElements.length - elementsWithSufficientSize} interactive elements may be too small for touch`);
  }

  return results;
};

// Color contrast testing for common combinations
export const testColorContrasts = () => {
  const tests = [
    { name: 'Primary text on dark background', fg: '#ffffff', bg: '#0a0118' },
    { name: 'Secondary text on dark background', fg: '#e2e8f0', bg: '#0a0118' },
    { name: 'Link text on dark background', fg: '#a78bfa', bg: '#0a0118' },
    { name: 'Link hover on dark background', fg: '#c4b5fd', bg: '#0a0118' },
    { name: 'Muted text on dark background', fg: '#a0aec0', bg: '#0a0118' },
    { name: 'Button text on purple background', fg: '#ffffff', bg: '#7c3aed' },
  ];

  console.log('🎨 Color Contrast Test Results:');
  tests.forEach(test => {
    const ratio = calculateContrastRatio(test.fg, test.bg);
    const passesAA = meetsWCAGStandards(test.fg, test.bg, 'AA');
    const passesAAA = meetsWCAGStandards(test.fg, test.bg, 'AAA');
    
    console.log(`${test.name}:`);
    console.log(`  Ratio: ${ratio.toFixed(2)}:1`);
    console.log(`  WCAG AA: ${passesAA ? '✅ Pass' : '❌ Fail'}`);
    console.log(`  WCAG AAA: ${passesAAA ? '✅ Pass' : '❌ Fail'}`);
    console.log('');
  });
};

// Export for use in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as typeof window & {
    accessibilityUtils?: {
      runAudit: typeof runAccessibilityAudit;
      testContrasts: typeof testColorContrasts;
      calculateContrastRatio: typeof calculateContrastRatio;
      meetsWCAGStandards: typeof meetsWCAGStandards;
    };
  }).accessibilityUtils = {
    runAudit: runAccessibilityAudit,
    testContrasts: testColorContrasts,
    calculateContrastRatio,
    meetsWCAGStandards
  };
}

// app/types.ts

export interface ComponentStyle {
  // Layout properties
  display?: string;
  position?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  minWidth?: string;
  minHeight?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  overflow?: string;
  
  // Flex/Grid layout
  flexDirection?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  
  // Positioning
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;
  
  // Typography styles
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: string;
  textTransform?: string;
  letterSpacing?: string;
  whiteSpace?: string;
  
  // Visual properties
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundBlendMode?: string;
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string;
  boxShadow?: string;
  opacity?: string;
  
  // Transitions/Animations
  transform?: string;
  transition?: string;
  animation?: string;
  
  // Other
  outline?: string;
  outlineOffset?: string;
  filter?: string;
  visibility?: string;
  
  // Context styling properties from page
  _contextBackground?: string;
  _contextColor?: string;
  _contextFontFamily?: string;
  _contextFontSize?: string;
  
  // Index signature for dynamic properties
  [key: string]: string | undefined;
}

export interface ExtractedImageInfo {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  type: string; // 'img' or 'background'
}

export interface ExtractedComponent {
  type: string;
  name: string;
  html: string;
  cleanHtml: string;
  screenshot: string;
  styles: ComponentStyle;
  metadata: {
    tagName?: string;
    classes?: string[];
    dimensions?: {
      width: number;
      height: number;
    };
    originalStyles?: {
      display: string;
      position: string;
      width: string;
      height: string;
    };
    // Enhanced metadata properties
    importanceScore?: number;
    hasBackgroundImage?: boolean;
    backgroundImageUrl?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    imageCount?: number;
    images?: ExtractedImageInfo[];
    position?: {
      x: number;
      y: number;
    };
    hasImage?: boolean;
    link?: string;
    isRepeatedPattern?: boolean;
    externalStyles?: string;
    sourcePage?: string;
    extractedAt?: string;
  };
}

export interface ExtractionMetrics {
  // Time metrics
  extractionTimeMs: number;
  responseTimeMs: number;
  
  // Accuracy metrics
  layoutAccuracy: number;
  styleAccuracy: number;
  contentAccuracy: number;
  overallAccuracy: number;
  
  // Component metrics
  totalElementsDetected: number;
  componentsExtracted: number;
  extractionRate: number;
  failedExtractions: number;
  
  // Precision metrics
  positionAccuracy: number;
  dimensionAccuracy: number;
  marginPaddingAccuracy: number;
  colorAccuracy: number;
  fontAccuracy: number;
  
  // Error details
  errors: Array<{type: string, message: string, count: number}>;
  
  // URL and timestamp
  url: string;
  timestamp: string;
}

export interface ActionData {
  success?: boolean;
  error?: string;
  sessionId?: string;
  status?: string;
  progress?: number;
  message?: string;
  componentsFound?: number;
  componentsProcessed?: number;
  totalPages?: number;
  currentPage?: number;
  components?: ExtractedComponent[];
  statusDetails?: string;
  metrics?: ExtractionMetrics; // Add this line
  url?: string; // Add this if it's used in your code
}

export interface LoaderData {
  initialMessage: string;
  storedData: any | null;
  storedSessionId: string;
}

// Tag counting interface for pattern detection
export interface TagCounts {
  [key: string]: number;
}

// Global window augmentation for browser functions
declare global {
  interface Window {
    getComputedStylesAsInline: (element: Element) => string;
    getExternalStylesForElement: (element: Element) => string;
    getBodyStyles: () => {
      backgroundColor: string;
      color: string;
      fontFamily: string;
      fontSize: string;
      lineHeight: string;
    };
    detectRepeatedPatterns: () => Array<{
      container: Element;
      containerSelector: string;
      childSelector: string;
      childTag: string;
      childCount: number;
      hasImages: boolean;
      hasText: boolean;
      sampleHtml: string;
    }>;
  }
  
  // Extend CSSRule to include selectorText property
  interface CSSStyleRule extends CSSRule {
    selectorText: string;
  }
}
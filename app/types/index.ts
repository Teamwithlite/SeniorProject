// app/types/index.ts
export interface ComponentMetadata {
    // Styles will be an array of Tailwind classes we extract
    styles: string[];
    
    // Accessibility information
    accessibility: {
      score: number;
      issues: string[];
    };
    
    // Optional properties for specific component types
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    content?: string;
  }
  
  export interface ExtractedComponent {
    type: 'button' | 'navigation' | 'hero' | 'card' | 'form' | 'footer';
    name: string;
    html: string;
    code: string;
    metadata: ComponentMetadata;
  }
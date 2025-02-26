// types.ts
export interface ComponentStyle {
  backgroundColor?: string;
  color?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  fontSize?: string;
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  width?: string;
  height?: string;
}

export interface ExtractedComponent {
  type: string;
  name: string;
  html: string;
  cleanHtml?: string;
  code?: string;
  styles?: ComponentStyle;
  metadata?: {
    tagName: string;
    classes: string[];
    dimensions: {
      width: number;
      height: number;
    };
  };
}

export interface ActionData {
  success: boolean;
  error?: string;
  components?: ExtractedComponent[];
}

export interface LoaderData {
  initialMessage: string;
}
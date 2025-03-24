// app/types.ts
export interface ComponentStyle {
  // Layout properties
  display?: string
  position?: string
  width?: string
  height?: string
  minWidth?: string
  maxWidth?: string
  minHeight?: string
  maxHeight?: string
  padding?: string
  paddingTop?: string
  paddingRight?: string
  paddingBottom?: string
  paddingLeft?: string
  margin?: string
  marginTop?: string
  marginRight?: string
  marginBottom?: string
  marginLeft?: string

  // Flex/Grid layout
  flexDirection?: string
  flexWrap?: string
  justifyContent?: string
  alignItems?: string
  alignContent?: string
  gap?: string
  rowGap?: string
  columnGap?: string

  // Positioning
  top?: string
  right?: string
  bottom?: string
  left?: string
  zIndex?: string

  // Typography styles
  color?: string
  fontSize?: string
  fontFamily?: string
  fontWeight?: string
  lineHeight?: string
  textAlign?: string
  textTransform?: string
  letterSpacing?: string
  whiteSpace?: string

  // Visual properties
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
  backgroundRepeat?: string
  backgroundBlendMode?: string
  border?: string
  borderTop?: string
  borderRight?: string
  borderBottom?: string
  borderLeft?: string
  borderRadius?: string
  boxShadow?: string
  opacity?: string

  // Transitions/Animations
  transform?: string
  transition?: string
  animation?: string

  // Other
  outline?: string
  outlineOffset?: string
  filter?: string
  visibility?: string
  overflow?: string
}

export interface ExtractedImageInfo {
  src: string
  alt?: string
  width?: number
  height?: number
  type: string // 'img' or 'background'
}

export interface ExtractedComponent {
  type: string
  name: string
  html: string
  cleanHtml?: string
  screenshot?: string
  styles?: ComponentStyle
  metadata?: {
    tagName: string
    classes: string[]
    dimensions: {
      width: number
      height: number
    }
    // Enhanced metadata properties
    importanceScore?: number
    hasBackgroundImage?: boolean
    backgroundImageUrl?: string
    imageCount?: number
    images?: ExtractedImageInfo[]
    position?: {
      x: number
      y: number
    }
  }
}

export interface ActionData {
  success?: boolean
  error?: string
  sessionId?: string
  status?: string
  progress?: number
  message?: string
  componentsFound?: number
  componentsProcessed?: number
  totalPages?: number
  currentPage?: number
  components?: ExtractedComponent[]
  statusDetails?: string // Additional status details for UI feedback
}

export interface LoaderData {
  initialMessage: string
  storedData: any | null
  storedSessionId: string
}

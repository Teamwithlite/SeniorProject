// app/utils/mockData.ts
import type { ExtractedComponent, ExtractionMetrics } from '~/types';

/**
 * Provides mock component data for when Puppeteer extraction fails in serverless environments
 */
export function generateMockComponents(
  url: string,
  count: number = 5
): ExtractedComponent[] {
  const mockComponents: ExtractedComponent[] = [];

  // Basic component types to generate
  const componentTypes = ['buttons', 'cards', 'navigation', 'forms', 'headers'];

  for (let i = 0; i < count; i++) {
    const typeIndex = i % componentTypes.length;
    const componentType = componentTypes[typeIndex];
    
    // Generate appropriate HTML based on component type
    let html = '';
    let styles = {};
    
    switch (componentType) {
      case 'buttons':
        html = `<div class="extracted-component buttons-component" style="display: inline-block; width: auto; height: auto;">
          <button class="btn btn-primary" style="background-color: #4361ee; color: #ffffff; padding: 10px 20px; border-radius: 4px; border: none;">
            Sample Button ${i + 1}
          </button>
        </div>`;
        styles = {
          backgroundColor: '#4361ee',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '4px',
          border: 'none',
        };
        break;
        
      case 'cards':
        html = `<div class="extracted-component cards-component" style="display: inline-block; width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; background-color: #ffffff;">
          <div style="padding: 20px;">
            <h3 style="margin-top: 0; font-size: 18px; color: #333333;">Card Title ${i + 1}</h3>
            <p style="color: #666666; font-size: 14px;">This is a sample card component with some placeholder text content.</p>
            <button style="background-color: #4361ee; color: #ffffff; padding: 8px 16px; border-radius: 4px; border: none; margin-top: 10px;">Learn More</button>
          </div>
        </div>`;
        styles = {
          display: 'block',
          width: '300px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          backgroundColor: '#ffffff',
          padding: '20px',
        };
        break;
        
      case 'navigation':
        html = `<div class="extracted-component navigation-component" style="display: block; width: 100%; height: auto; background-color: #333333; padding: 15px;">
          <nav style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 20px; font-weight: bold; color: #ffffff;">Brand Logo</div>
            <ul style="display: flex; list-style: none; margin: 0; padding: 0;">
              <li style="margin: 0 10px;"><a href="#" style="color: #ffffff; text-decoration: none;">Home</a></li>
              <li style="margin: 0 10px;"><a href="#" style="color: #ffffff; text-decoration: none;">About</a></li>
              <li style="margin: 0 10px;"><a href="#" style="color: #ffffff; text-decoration: none;">Services</a></li>
              <li style="margin: 0 10px;"><a href="#" style="color: #ffffff; text-decoration: none;">Contact</a></li>
            </ul>
          </nav>
        </div>`;
        styles = {
          display: 'block',
          width: '100%',
          backgroundColor: '#333333',
          padding: '15px',
          color: '#ffffff',
        };
        break;
        
      case 'forms':
        html = `<div class="extracted-component forms-component" style="display: block; width: 400px; padding: 20px; border-radius: 8px; background-color: #f5f5f5;">
          <form style="display: flex; flex-direction: column;">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #333333;">Email Address</label>
              <input type="email" placeholder="Enter your email" style="width: 100%; padding: 10px; border: 1px solid #dddddd; border-radius: 4px; font-size: 14px;" />
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #333333;">Password</label>
              <input type="password" placeholder="Enter your password" style="width: 100%; padding: 10px; border: 1px solid #dddddd; border-radius: 4px; font-size: 14px;" />
            </div>
            <button type="submit" style="background-color: #4361ee; color: #ffffff; padding: 10px; border: none; border-radius: 4px; font-size: 14px; cursor: pointer;">Submit</button>
          </form>
        </div>`;
        styles = {
          display: 'block',
          width: '400px',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
        };
        break;
        
      case 'headers':
        html = `<div class="extracted-component headers-component" style="display: block; width: 100%; padding: 40px 20px; background-color: #4361ee; color: #ffffff; text-align: center;">
          <h1 style="font-size: 36px; margin-bottom: 10px;">Welcome to Our Website</h1>
          <p style="font-size: 18px; max-width: 600px; margin: 0 auto 20px;">This is a placeholder hero header with a strong call to action button.</p>
          <button style="background-color: #ffffff; color: #4361ee; padding: 12px 24px; border: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Get Started</button>
        </div>`;
        styles = {
          display: 'block',
          width: '100%',
          padding: '40px 20px',
          backgroundColor: '#4361ee',
          color: '#ffffff',
          textAlign: 'center',
        };
        break;
        
      default:
        html = `<div class="extracted-component">Default Component ${i + 1}</div>`;
        styles = {};
    }
    
    // Create an extracted component
    mockComponents.push({
      type: componentType,
      name: `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} ${i + 1}`,
      html,
      cleanHtml: html,
      screenshot: '',
      styles: styles as any,
      metadata: {
        dimensions: { width: 300, height: 200 },
        position: { x: 0, y: 0 },
        externalStyles: '',
        sourcePage: url,
        extractedAt: new Date().toISOString(),
      },
    });
  }
  
  return mockComponents;
}

/**
 * Generates mock metrics for the extraction process
 */
export function generateMockMetrics(url: string): ExtractionMetrics {
  return {
    extractionTimeMs: 1500,
    responseTimeMs: 2000,
    layoutAccuracy: 95.5,
    styleAccuracy: 93.2,
    contentAccuracy: 90.0,
    overallAccuracy: 94.1,
    totalElementsDetected: 22,
    componentsExtracted: 8,
    extractionRate: 36.4,
    failedExtractions: 1,
    positionAccuracy: 96.7,
    dimensionAccuracy: 95.5,
    marginPaddingAccuracy: 94.2,
    alignmentAccuracy: 93.8,
    colorAccuracy: 97.5,
    fontAccuracy: 92.3,
    errors: [
      {
        type: 'serverless_fallback',
        message: 'Used mock data due to serverless environment limitations',
        count: 1,
      },
    ],
    url,
    timestamp: new Date().toISOString(),
  };
}
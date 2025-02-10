// app/routes/extract.ts
import { json } from '@remix-run/node';
import { extractWebsite } from '~/services/extractor';

export const action = async ({ request }: { request: Request }) => {
  try {
    // Get the submitted URL from the form data
    const formData = await request.formData();
    const url = formData.get('url') as string;
    console.log('Received URL for extraction:', url);

    if (!url) {
      return json({ 
        success: false, 
        error: 'Please provide a valid URL' 
      });
    }

    // Call our extraction service and wait for results
    console.log('Starting component extraction...');
    const extractedData = await extractWebsite(url);
    console.log(`Extraction complete. Found ${extractedData.components.length} components`);

    return json({ 
      success: true, 
      components: extractedData.components 
    });
  } catch (error) {
    console.error('Extraction failed:', error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
};
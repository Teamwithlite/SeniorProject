// extract.ts
import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { extractWebsite } from '~/services/extractor';
import type { ActionData } from '~/types';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = formData.get('url') as string;

  if (!url) {
    return json<ActionData>({ success: false, error: 'Please provide a valid URL' });
  }

  try {
    const extractedData = await extractWebsite(url);
    return json<ActionData>({ 
      success: true, 
      components: extractedData.components 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return json<ActionData>({ 
      success: false, 
      error: errorMessage 
    });
  }
};
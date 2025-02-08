import { json } from '@remix-run/node';
import { extractWebsite } from '../services/extractor';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const url = formData.get('url') as string;

  if (!url) {
    return json({ success: false, error: 'Please provide a valid URL' });
  }

  try {
    const extractedData = await extractWebsite(url);
    return json({ success: true, components: extractedData.components });
  } catch (error) {
    return json({ success: false, error: error.message });
  }
};

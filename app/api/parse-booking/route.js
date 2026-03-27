import Anthropic, { toFile } from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a booking confirmation parser. Extract structured data from the provided booking confirmation (text, image, or document). Return ONLY valid JSON, no markdown, no explanation, no code fences.

Determine the booking type and return one of these formats:

FLIGHT: { "type": "flight", "data": { "depart_date": "YYYY-MM-DD", "depart_time": "HH:MM", "return_date": "YYYY-MM-DD or null", "return_time": "HH:MM or null" }}

HOTEL/ACCOMMODATION: { "type": "hotel", "data": { "name": "hotel name", "address": "full address", "checkin": "YYYY-MM-DD", "checkin_time": "HH:MM", "checkout": "YYYY-MM-DD", "checkout_time": "HH:MM", "confirm_num": "confirmation number", "cost": 0, "currency": "EUR/GBP/CAD/USD", "notes": "any extra details like breakfast included", "city_name": "city name" }}

TRANSPORT: { "type": "transport", "data": { "from_city": "departure city", "to_city": "arrival city", "transport_type": "train|bus|ferry|flight|car", "departure_date": "YYYY-MM-DD", "departure_time": "HH:MM", "arrival_time": "HH:MM", "booking_ref": "reference number", "platform": "platform or gate if shown", "cost": 0, "currency": "EUR/GBP/CAD/USD", "notes": "seat, class, etc" }}

If multiple bookings are found (e.g. outbound + return flight), return a JSON array of objects.
Use null for fields not found in the text. Extract as many fields as possible.`;

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { success: false, error: 'ANTHROPIC_API_KEY not configured. Add it in Vercel → Settings → Environment Variables.' },
        { status: 500 }
      );
    }

    const { text, image, mediaType, pdf, fileName } = await request.json();

    if (!text && !image && !pdf) {
      return Response.json(
        { success: false, error: 'Please provide booking text, an image, or a document.' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Build content array
    const content = [];
    let uploadedFileId = null;

    // Handle PDF via Files API
    if (pdf) {
      const pdfBuffer = Buffer.from(pdf, 'base64');
      const uploaded = await client.beta.files.upload({
        file: await toFile(pdfBuffer, fileName || 'document.pdf', { type: 'application/pdf' }),
        betas: ['files-api-2025-04-14'],
      });
      uploadedFileId = uploaded.id;
      content.push({
        type: 'document',
        source: { type: 'file', file_id: uploaded.id },
      });
    }

    // Handle images inline (base64)
    if (image && mediaType) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: image },
      });
    }

    // Handle text
    if (text) {
      content.push({ type: 'text', text });
    }

    // If only file/image with no text, add instruction
    if (!text && (image || pdf)) {
      content.push({ type: 'text', text: 'Parse this booking confirmation.' });
    }

    // Use beta endpoint if we uploaded a file, otherwise standard
    let message;
    if (uploadedFileId) {
      message = await client.beta.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
        betas: ['files-api-2025-04-14'],
      });
    } else {
      message = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      });
    }

    // Cleanup: delete uploaded file
    if (uploadedFileId) {
      try {
        await client.beta.files.delete(uploadedFileId, {
          betas: ['files-api-2025-04-14'],
        });
      } catch {
        // Non-critical, file will expire anyway
      }
    }

    // Extract text response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Parse JSON from response (handle possible markdown fences)
    let parsed;
    try {
      const jsonStr = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return Response.json(
        { success: false, error: 'Could not parse the response. Try pasting more of the confirmation text.', raw: responseText },
        { status: 422 }
      );
    }

    // Normalize to array
    const results = Array.isArray(parsed) ? parsed : [parsed];

    return Response.json({ success: true, results });
  } catch (err) {
    console.error('Parse booking error:', err);
    return Response.json(
      { success: false, error: err.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are a booking confirmation parser. Extract structured data from the provided booking confirmation (text or image). Return ONLY valid JSON, no markdown, no explanation, no code fences.

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

    const { text, image, mediaType } = await request.json();

    if (!text && !image) {
      return Response.json(
        { success: false, error: 'Please provide booking text or an image.' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    // Build content array
    const content = [];
    if (image && mediaType) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: image },
      });
    }
    if (text) {
      content.push({ type: 'text', text });
    }
    if (!text && image) {
      content.push({ type: 'text', text: 'Parse this booking confirmation image.' });
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    });

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

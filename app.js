const express = require('express');
const line = require('@line/bot-sdk');
const OpenAI = require('openai');

const app = express();

// LINE Messaging API configuration
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

// OpenAI GPT API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Webhook callback route
app.post('/callback', line.middleware(lineConfig), async (req, res) => {
  try {
    // Handle all events from the request body
    const results = await Promise.all(req.body.events.map(handleEvent));
    res.json(results);
  } catch (err) {
    console.error('Error in webhook handler:', err);
    res.status(500).end();
  }
});

// Event handling function
async function handleEvent(event) {
  // If the event is not a text message, reply with a fixed message
  if (event.type !== 'message' || event.message.type !== 'text') {
    const reply = { type: 'text', text: '目前只支援文字訊息' };
    return lineClient.replyMessage(event.replyToken, reply);
  }

  // Construct user message for OpenAI API
  const userMessage = event.message.text;
  const messages = [{ role: 'user', content: userMessage }];

  try {
    // Call OpenAI API for chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages
    });
    const replyText = completion.choices[0]?.message?.content?.trim() || '';
    const replyMessage = { type: 'text', text: replyText };
    return lineClient.replyMessage(event.replyToken, replyMessage);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Reply with error message to the user
    const errorMessage = { type: 'text', text: '發生錯誤，請稍後再試' };
    return lineClient.replyMessage(event.replyToken, errorMessage);
  }
}

// Start the server (for Render platform)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

require('dotenv').config();
const express = require('express');
const { Client, middleware } = require('@line/bot-sdk');
const { OpenAI } = require('openai');

const app = express();

// LINE 設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// 建立 LINE client
const client = new Client(config);

// 建立 OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware for LINE webhook
app.post('/webhook', middleware(config), async (req, res) => {
  try {
    const results = await Promise.all(req.body.events.map(handleEvent));
    res.json(results);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

// 處理 LINE 訊息事件
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = event.message.text;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    });

    const gptReply = chatCompletion.choices[0].message.content;

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: gptReply,
    });
  } catch (error) {
    console.error('OpenAI 回覆失敗:', error.message);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '抱歉，GPT 回覆失敗。',
    });
  }
}

// 預設首頁
app.get('/', (req, res) => {
  res.send('MCP_LINE 機器人已啟動');
});

// 監聽 port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

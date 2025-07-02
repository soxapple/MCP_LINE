
require('dotenv').config();
const line = require('@line/bot-sdk');
const express = require('express');
const { Configuration, OpenAIApi } = require("openai");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const app = express();
const client = new line.Client(config);

// OpenAI 設定
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// Webhook 處理
app.post('/webhook', line.middleware(config), async (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then(result => res.json(result));
});

// GPT 回覆邏輯
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userInput = event.message.text;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "你是一個親切、有禮貌、會講中文的聊天機器人。" },
        { role: "user", content: userInput }
      ],
      temperature: 0.8
    });

    const gptReply = completion.data.choices[0].message.content;

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: gptReply
    });
  } catch (error) {
    console.error('GPT Error:', error.message);
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '抱歉，我暫時沒辦法回覆，請稍後再試！'
    });
  }
}

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE Bot + GPT server running on ${port}`);
});

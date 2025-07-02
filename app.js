const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const app = express();
const client = new line.Client(config);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const msg = event.message.text.trim().toLowerCase();
  let reply = "我還在學習中，可以再說一次嗎？";

  // 問候
  if (['hi', 'hello', '嗨', '你好', '哈囉'].includes(msg)) {
    reply = '哈囉！今天過得如何？😊';
  } else if (msg.includes('早安')) {
    reply = '早安～希望你今天心情很好 ☀️';
  } else if (msg.includes('晚安')) {
    reply = '晚安，祝你有個好夢 🌙✨';
  }

  // 情緒
  else if (msg.includes('累') || msg.includes('煩') || msg.includes('壓力')) {
    reply = '辛苦了，要不要喝杯水或休息一下？💪';
  } else if (msg.includes('開心') || msg.includes('快樂')) {
    reply = '太棒了！你開心我也開心 😄';
  }

  // 天氣
  else if (msg.includes('天氣')) {
    reply = '我不能查天氣，但可以陪你聊聊天！🌦️';
  }

  // 吃飯
  else if (msg.includes('吃') && msg.includes('飯')) {
    reply = '你吃了什麼？還是要我推薦？🍜';
  }

  // 自我介紹
  else if (msg.includes('你是誰')) {
    reply = '我是你的LINE小助手，喜歡聊天、也能幫你轉達訊息～';
  }

  // 特定關鍵字回覆
  else if (msg === '123') {
    reply = '567 😄';
  }

  // 趣味互動
  else if (msg.includes('講笑話')) {
    reply = '為什麼番茄走路要小心？因為它會變成番茄醬（尬）😂';
  } else if (msg.includes('你幾歲')) {
    reply = '我沒有年齡，但我每天都在進步中！🤖';
  }

  // 模糊輸入
  else if (msg.length <= 2) {
    reply = '嗯？可以再多說一點嗎？';
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: reply,
  });
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

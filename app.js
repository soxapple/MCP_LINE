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

  const rules = [
    {
      keywords: ['你好', '嗨', '哈囉', 'hi', 'hello'],
      responses: ['嗨嗨！今天心情如何？', '哈囉～有什麼我能幫你的嗎？', '嗨！開啟今天的第一句話 💬'],
    },
    {
      keywords: ['吃飯', '吃什麼', '午餐', '晚餐'],
      responses: ['我也肚子餓了呢～你想吃什麼？', '最近流行義大利麵喔！🍝', '便當？泡麵？還是外送？😋'],
    },
    {
      keywords: ['心情不好', '好累', '煩躁', '壓力'],
      responses: ['要不要休息一下？我陪你聊聊。', '辛苦了，要不要放空一下？', '想聽你說說發生什麼了～'],
    },
    {
      keywords: ['天氣', '下雨', '氣溫', '冷', '熱'],
      responses: ['今天天氣感覺不錯～你出門了嗎？', '別忘了帶傘喔 ☔', '外面冷不冷啊？我感覺不到，但你要多穿點 😆'],
    },
    {
      keywords: ['講笑話', '笑話', '想聽笑話'],
      responses: ['為什麼電腦會游泳？因為它有滑鼠！🤣', '青蛙跳不出井，是因為牠太青了～🐸', '尷尬的冷笑話也算嗎？😅'],
    },
    {
      keywords: ['掰掰', 'bye', '再見', '拜拜'],
      responses: ['掰掰～下次再來找我喔 👋', '祝你今天過得愉快！', '保重喔～我會想你的！🙈'],
    },
    {
      keywords: ['你是誰', '你叫什麼', '你從哪來'],
      responses: ['我是一個聊天機器人，可以陪你說說話～', '我是你最忠實的文字夥伴 🤖', '叫我阿咪就好啦 😎'],
    },
    {
      keywords: ['你會什麼', '你可以幹嘛'],
      responses: ['我能跟你聊天、轉發訊息，甚至陪你廢話 🐶', '我在慢慢學習成為更厲害的助手！', '先試試說『講笑話』或『你好』吧～'],
    },
    {
      keywords: ['我好爛', '不想努力', '我很廢'],
      responses: ['你已經很棒了，不要太苛責自己！❤️', '給自己一點時間，也要給自己掌聲 👏', '沒事的，我陪你～你並不孤單！'],
    },
    {
      keywords: ['幾點', '現在幾點'],
      responses: ['我不會看鐘錶，但你可以問手機 📱', '時間過得真快，你還好嗎？', '大約是陪你聊天的好時機 😁'],
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(keyword => msg.includes(keyword))) {
      const response = rule.responses[Math.floor(Math.random() * rule.responses.length)];
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: response,
      });
    }
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `你說的是「${event.message.text}」，可以再說一次嗎？我會慢慢學習更多回答的！`,
  });
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

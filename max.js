require("dotenv").config();
const fetch = require("node-fetch");
const { Telegraf, Markup, Extra } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { polling: true });
//const HttpsProxyAgent = require("https-proxy-agent");
let a, b, c, d, e, f, result, callBackData, rightAnswers;
let maxQuestions = 9;
// const bot = new Telegraf(process.env.TELEGRAM_TOKEN,
//   {
//     telegram:
//       { agent: new HttpsProxyAgent(process.env.Proxy) }
//   }, { polling: true });

const myKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "Хочу множити",
          callback_data: "multi",
        }],
      [{
        text: "Хочу додавати",
        callback_data: "sum",
      }],
      [{
        text: "Таблиця віднімання",
        callback_data: "sub",
      }],
      [{
        text: "Я вже втомився :((",
        callback_data: "exit",
      }
        // {
        //   text: "Таблиця ділення",
        //   callback_data: "div",
        // }
      ],
    ],
  },
};
function mixedKeyboard(result) {
  do {
    switch (action) {
      case "*":
        c = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        d = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        e = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        f = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        break;
      case "+":
        c = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        d = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        e = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        f = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        break;
      case "-":
        c = Math.abs(Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21));
        d = Math.abs(Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21));
        e = Math.abs(Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21));
        f = Math.abs(Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21));
        break;
      case "/":
        c = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        d = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        e = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        f = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        break;
    }
  }
  while (c == d || c == e || c == f || d == e || d == f || e == f || result == c || result == d || result == e || result == f);
  const answerKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: c,
            callback_data: c,
          },
          {
            text: d,
            callback_data: d,
          },
          {
            text: e,
            callback_data: e,
          },
          {
            text: f,
            callback_data: f,
          },
        ],
      ],
    },
  };
  answerKeyboard.reply_markup.inline_keyboard[0][Math.floor(Math.random() * 4)] = { text: result, callback_data: result }
  return answerKeyboard;
};
function random(action) {
  if (!action) {
    var myArray = [
      "+",
      "-",
      "*"
    ];
    var action = myArray[Math.floor(Math.random() * myArray.length)];
  }
  return action;
}
function math(ctx, action) {
  a = Math.floor(Math.random() * 11);
  b = Math.floor(Math.random() * 11);
  if (a < b) { a1 = a; a = b; b = a1; }
  if (action == "*") { result = a * b; }
  else if (action == "+") { result = a + b; }
  else if (action == "/") {
    result = a / b;
  }
  else if (action == "-") {
    result = a - b;
  }
  else result = "ok"
  ctx.reply("Скільки буде " + a + action + b + "?", mixedKeyboard(result));
}
function start(ctx) {
  rightAnswers = 0;
  ctx.replyWithMarkdown(`Давай трохи пограємо?\nОбери варіант:`, myKeyboard);
}

bot.command("start", async (ctx) => {
  await ctx.reply(`Вітаю, ${ctx.from.first_name}!`);
  start(ctx)
});

bot.action("multi", (ctx) => {
  action = "*";
  math(ctx, action);
});
bot.action("sum", (ctx) => {
  action = "+";
  math(ctx, action);
});
bot.action("sub", (ctx) => {
  action = "-";
  math(ctx, action);
});
bot.action("div", (ctx) => {
  action = "/";
  math(ctx, action);
});
bot.action("exit", (ctx) => {
  ctx.reply("Гаразд! До зустрічі наступного разу!")
});

bot.on("callback_query", async (ctx) => {
  callBackData = ctx.update.callback_query.data;
  if (callBackData == result && rightAnswers < maxQuestions) {
    await ctx.reply(`Молодець! Дай правильну відповідь ще на ${maxQuestions - rightAnswers} питань і отримаєш приз!`);
    rightAnswers++;
    ctx.deleteMessage(ctx.update.callback_query.message.message_id - 1);
    // повторний запуск тесту; 
    //для запуску з рендомними питаннями math(ctx, random())
    ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    math(ctx, random(action));
   // ctx.deleteMessage(ctx.update.callback_query.message.message_id);
  }
  else if (callBackData == result && rightAnswers >= maxQuestions) {
    ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    ctx.reply("Молодець! Ти дуже гарно знаєш таблицю!!!\nТримай фото песика:)");
    //const response = await fetch("https://dog.ceo/api/breeds/image/random", { agent: new HttpsProxyAgent(process.env.Proxy) });
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();
    if (data.status == 'success') {
      await ctx.replyWithPhoto(data.message);
      await ctx.replyWithAudio({ source: "./victory.mp3" });
    }
    else if (data.status == 'error') {
      await ctx.reply("Вибач, песика знайти не вдалося :(");
    }
    start(ctx)
  }
  else {
    await ctx.replyWithAudio({ source: "./lost.mp3" });
    await ctx.reply("Нажаль, не вірно:(. Старайся краще наступного разу!\nВірних відповідей: " + rightAnswers);
    start(ctx)
  }
});
// Запуск бота
bot.launch();

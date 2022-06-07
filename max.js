require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const url = process.env.MONGODB_URI;
//const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url, { useUnifiedTopology: true });
const fetch = require("node-fetch");
const { Telegraf, Markup} = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { polling: true });

let result, callbackData, rightAnswers, cheat, bestResults;
let maxQuestions = 9;
// const HttpsProxyAgent = require("https-proxy-agent");
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
        },
      ],
      [
        {
          text: "Хочу додавати",
          callback_data: "sum",
        },
      ],
      [
        {
          text: "Хочу віднімати",
          callback_data: "sub",
        },
      ],
      [
        {
          text: "Здивуй мене :)",
          callback_data: "impress",
        },
      ],
      [
        {
          text: "Я вже втомився :((",
          callback_data: "exit",
        },
        //[ {
        //   text: "Таблиця ділення",
        //   callback_data: "div",
        // }]
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
        c = Math.abs(
          Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21)
        );
        d = Math.abs(
          Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21)
        );
        e = Math.abs(
          Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21)
        );
        f = Math.abs(
          Math.floor(Math.random() * 21) - Math.floor(Math.random() * 21)
        );
        break;
      case "/":
        c = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        d = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        e = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        f = Math.floor(Math.random() * 11) / Math.floor(Math.random() * 11);
        break;
    }
  } while (
    c == d ||
    c == e ||
    c == f ||
    d == e ||
    d == f ||
    e == f ||
    result == c ||
    result == d ||
    result == e ||
    result == f
  );
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
  answerKeyboard.reply_markup.inline_keyboard[0][
    Math.floor(Math.random() * 4)
  ] = { text: result, callback_data: result };
  if (rightAnswers >= 2) {
    answerKeyboard.reply_markup.inline_keyboard[0][4] = {
      text: "?",
      callback_data: "cheat",
    };
  } else delete answerKeyboard.reply_markup.inline_keyboard[0][4];
  return answerKeyboard;
}

async function mongo(ctx, bestResults) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("usersdb");
    const collection = db.collection("users");
    const findUser = await collection.find({ chatID: ctx.from.id }).toArray(); //find user
    //adding user to database
    if (!findUser[0]) {
      let user = {
        chatID: ctx.from.id,
        name: ctx.from.first_name,
        score: bestResults,
      };
      const result = await collection.insertOne(user); //add user
      //console.log(`user added to database`, result);
    } else if (
      (findUser[0].chatID == ctx.from.id && bestResults < findUser[0].score) ||
      findUser[0].score === null
    ) {
      bestResults = findUser[0].score;
    }
    //console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
  return new Promise(function (resolve) {
    resolve(bestResults);
  });
}
async function mongoWrite(ctx, bestResults) {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("usersdb");
    const collection = db.collection("users");
    const findUser = await collection.find({ chatID: ctx.from.id }).toArray(); //find user
    //adding user to database
    const result = await collection.updateOne(
      { score: findUser[0].score },
      { $set: { score: bestResults } }
    );
    //console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
}
function random(action) {
  if (!action) {
    let myArray = ["+", "-", "*"];
    action = myArray[Math.floor(Math.random() * myArray.length)];
  }
  return action;
}
function math(ctx, action) {
  if (action == "+" || action == "-") {
    a = Math.floor(Math.random() * 21);
    b = Math.floor(Math.random() * 21);
  } else {
    a = Math.floor(Math.random() * 11);
    b = Math.floor(Math.random() * 11);
  }
  if (a < b) {
    a1 = a;
    a = b;
    b = a1;
  }
  if (action == "*") {
    result = a * b;
  } else if (action == "+") {
    result = a + b;
  } else if (action == "/") {
    result = a / b;
  } else if (action == "-") {
    result = a - b;
  } else result = "ok";
  ctx.reply("Скільки буде " + a + action + b + "?", mixedKeyboard(result));
  if (ctx.update.callback_query.message.message_id)
    ctx.deleteMessage(ctx.update.callback_query.message.message_id);
  //console.log("a=", a, "b=", b, "result=", result);
  //userID = { ID: ctx.from.id, result: result };
  return result;
}
async function start(ctx) {
  cheat = 0;
  rightAnswers = 0;
  bestResults = 0;
  mongo(ctx, bestResults).then(function (value) {
    bestResults = value;
  });
  //await test;
  //console.log(`externalbestres`, bestResults);
  return ctx.replyWithMarkdown(
    `Давай трохи пограємо?\nОбери варіант:`,
    myKeyboard
  );
}
//start button
bot.command("/start", async (ctx) => {
  await ctx.reply(
    `Вітаю, ${ctx.from.first_name}!`,
    Markup.keyboard([["почали"], ["вихід"]])
      .oneTime()
      .resize()
  );
});
//start
bot.hears("почали", async (ctx) => {
  await ctx.reply(
    `Готовий практикуватися у математиці?\nПравила прості: \n${maxQuestions + 1
    } прикладів і декілька підказок.\nКожна правильна відповідь додає 1 бал.\nКожна підказка знімає 2 бали.\nДаси відповідь на всі ${maxQuestions + 1
    } питань отримаєш приз!`
  );
  start(ctx);
});
//exit button action
bot.hears("вихід", async (ctx) => {
  ctx.reply("Гаразд! До зустрічі наступного разу!");
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
bot.action("impress", (ctx) => {
  action = random();
  math(ctx, action);
});
bot.action("exit", (ctx) => {
  ctx.reply("Гаразд! До зустрічі наступного разу!");
});

bot.on("callback_query", async (ctx) => {
  callbackData = ctx.update.callback_query.data;
  if (callbackData == result && rightAnswers < maxQuestions) {
    await ctx.telegram.sendMessage(
      ctx.from.id,
      `Молодець! Дай правильну відповідь ще на ${maxQuestions - rightAnswers
      } питань і отримаєш приз!`
    );
    rightAnswers++;
    if (ctx.update.callback_query.message.message_id + 1) {
      setTimeout(
        () =>
          ctx.deleteMessage(ctx.update.callback_query.message.message_id + 1),
        5000
      );
    }
    //повторний запуск тесту;
    //для запуску з рендомними питаннями math(ctx, random())
    math(ctx, random(action));
  } else if (callbackData == result && rightAnswers >= maxQuestions) {
    if (ctx.update.callback_query.message.message_id) {
      bestResults++;
      //console.log(`top`, bestResults);
      mongoWrite(ctx, bestResults);
      setTimeout(
        () => ctx.deleteMessage(ctx.update.callback_query.message.message_id),
        1000
      );
    }
    ctx.reply(
      `Молодець! Ти дуже гарно знаєш таблицю!!!\nПідказок використано: ${cheat}\nТримай фото песика:)`
    );
    // const response = await fetch("https://dog.ceo/api/breeds/image/random", {
    //   agent: new HttpsProxyAgent(process.env.Proxy),
    // });
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();
    if (data.status == "success") {
      await ctx.replyWithPhoto(data.message);
      await ctx.replyWithAudio({ source: "./victory.mp3" });
    } else if (data.status == "error") {
      await ctx.reply("Вибач, песика знайти не вдалося :(");
    }
    start(ctx);
  } else if (callbackData == "cheat" && rightAnswers > 0) {
    rightAnswers -= 2;
    cheat++;
    ctx.reply(
      "Натисни: " +
      result +
      "\nКількість правильних відповідей зменшилася на 2.\nЛишилося ще: " +
      rightAnswers
    );
  } else {
    await ctx.replyWithAudio({ source: "./lost.mp3" });
    await ctx.reply(
      "Нажаль, не вірно:(. Старайся краще наступного разу!\nВірних відповідей: " +
      rightAnswers
    );
    start(ctx);
  }
});

bot.catch((err, ctx) => {
  console.log(`Ох-охо-xo, сталося щось жаахливе: ${ctx.updateType}`, err);
});

// Запуск бота
bot.launch();
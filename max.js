require("dotenv").config();
const fetch = require("node-fetch");
const { Telegraf, Markup } = require("telegraf");
let siteUrl = `https://maxbotsite.herokuapp.com/`;
let result, rightAnswers, cheat, bestResults, chatID;
let maxQuestions = 9;
const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { polling: true });
const url = process.env.MONGODB_URI;
// const url = "mongodb://localhost:27017/";
// const HttpsProxyAgent = require("https-proxy-agent");
// const bot = new Telegraf(process.env.TELEGRAM_TOKEN,
//   {
//     telegram:
//       { agent: new HttpsProxyAgent(process.env.Proxy) }
//   }, { polling: true });

const MongoClient = require("mongodb").MongoClient;
const mongoClient = new MongoClient(url, { useUnifiedTopology: true });
const db = mongoClient.db("usersdb");
const collection = db.collection("users");
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
          text: "Хочу ділити",
          callback_data: "div",
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
      ],
      [
        {
          text: "Найкращі гравці",
          url: siteUrl,
        },
      ],
    ],
  },
};
function mixedKeyboard(ctx, action, chatID) {
  // console.log(chatID, " in mixed keyboard");
  do {
    switch (action) {
      case "*":
        c = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        d = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        e = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        f = Math.floor(Math.random() * 11) * Math.floor(Math.random() * 11);
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        result = a * b;
        break;
      case "+":
        c = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        d = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        e = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        f = Math.floor(Math.random() * 21) + Math.floor(Math.random() * 21);
        a = Math.floor(Math.random() * 21);
        b = Math.floor(Math.random() * 21);
        result = a + b;
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
        a = Math.floor(Math.random() * 21);
        b = Math.floor(Math.random() * 21);
        if (a < b) {
          a1 = a;
          a = b;
          b = a1;
        }
        result = a - b;
        break;
      case ":":
        const array = [
          1,
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          2,
          [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
          3,
          [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
          4,
          [4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
          5,
          [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
          6,
          [6, 12, 18, 24, 30, 36, 42, 48, 54, 60],
          7,
          [7, 14, 21, 28, 35, 42, 49, 56, 63, 70],
          8,
          [8, 16, 24, 32, 40, 48, 56, 64, 72, 80],
          9,
          [9, 18, 27, 36, 45, 54, 63, 72, 81, 90],
          10,
          [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        ];
        const pair = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]; //база дільників
        c = pair[Math.floor(Math.random() * pair.length)];
        d = pair[Math.floor(Math.random() * pair.length)];
        e = pair[Math.floor(Math.random() * pair.length)];
        f = pair[Math.floor(Math.random() * pair.length)];
        a = Math.floor(Math.random() * 10);
        b = pair[Math.floor(Math.random() * pair.length)];
        b1 = array[b];
        a = array[b + 1][a];
        b = b1;
        result = a / b;
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
  chatID = ctx.from.id;
  if (!ctx.db)
    bot.context.db = { [chatID]: { result, rightAnswers, bestResults } };
  else
    bot.context.db = Object.assign(ctx.db, {
      [chatID]: { result, rightAnswers, bestResults },
    });
  //console.log(chatID);
  answerKeyboard.reply_markup.inline_keyboard[0][
    Math.floor(Math.random() * 4)
  ] = { text: result, callback_data: result };
  if (rightAnswers >= 2) {
    answerKeyboard.reply_markup.inline_keyboard[0][4] = {
      text: "?",
      callback_data: "cheat",
    };
  } else delete answerKeyboard.reply_markup.inline_keyboard[0][4];
  ctx.reply("Скільки буде " + a + action + b + "?", answerKeyboard);
  if (ctx.update.callback_query.message.message_id)
    try {
      //  console.log("first remove", ctx.update.callback_query.message.message_id);
      ctx.deleteMessage(ctx.update.callback_query.message.message_id);
    } catch (error) {}
  return;
}
async function mongo(ctx, bestResults, chatID) {
  try {
    await mongoClient.connect();
    const findUser = await collection.find({ chatID: chatID }).toArray(); //find user
    //adding user to database
    if (!findUser[0]) {
      let user = {
        chatID: chatID,
        name: ctx.from.first_name,
        score: bestResults,
      };
      ctx.telegram.sendMessage(
        process.env.TELEGRAM_SEND,
        `New user: ${user.name} with ChatID: ${user.chatID} added to database!`
      );
      const resp = await collection.insertOne(user); //add user
      //console.log(`user added to database`, resp);
    }
    // else if (findUser[0].score === null)
    else if (findUser[0].chatID == chatID) {
      const resp = await collection.updateOne(
        { chatID: findUser[0].chatID, score: findUser[0].score },
        { $set: { score: findUser[0].score + 1 } }
      );
      // console.log("User:", findUser[0], "updated score:",findUser[0].score + 1);
    }
    //console.log(resp);
  } catch (err) {
    console.log(err);
  } finally {
    await mongoClient.close();
  }
  //   return new Promise(function (resolve) {
  // resolve(bestResults);
  //   });
}
// async function mongoWrite(bestResults, chatID) {
//   try {
//     await mongoClient.connect();
//     const findUser = await collection.find({ chatID: chatID }).toArray(); //find user
//     //adding user to database
//     const resp = await collection.updateOne(
//       { score: findUser[0].score },
//       { $set: { score: bestResults } }
//     );
//     console.log(resp);
//   } catch (err) {
//     console.log(err);
//   } finally {
//     await mongoClient.close();
//   }
// }
function random(action) {
  if (!action) {
    let myArray = ["+", "-", "*", ":"];
    action = myArray[Math.floor(Math.random() * myArray.length)];
  }
  return action;
}
//function math(ctx, action,a,b,result) {
//  if (!result) result = "ok";
// ctx.reply("Скільки буде " + a + action + b + "?", mixedKeyboard());
// if (ctx.update.callback_query.message.message_id)
// ctx.deleteMessage(ctx.update.callback_query.message.message_id);
//console.log("a=", a, "b=", b, "result=", result);
//userID = { ID: ctx.from.id, result: result };
// return result;
//}
async function start(ctx, chatID) {
  await ctx.replyWithMarkdown(
    `Давай трохи пограємо?\nОбери варіант:`,
    myKeyboard
  );
  cheat = 0;
  rightAnswers = 0;
  bestResults = 0;
  chatID = ctx.from.id;
  // console.log(chatID);
  //   mongo(ctx, bestResults, chatID).then(function (value) {
  //     bestResults = value;
  //     console.log("ChatID", chatID, "Database results:", bestResults);
  //   });
  return;
}
//start button
bot.command("/start", async (ctx) => {
  let helloMessage = "Доброго ранку";
  const hour = new Date().getHours() + 3; //my timezone+3 for Heroku
  // console.log(hour);
  if (hour > 17) {
    helloMessage = "Добрий вечір";
  } else if (hour > 12) {
    helloMessage = "Добрий день";
  }
  await ctx.reply(
    `${helloMessage}, ${ctx.from.first_name}!`,
    Markup.keyboard([["Почали"], ["Найкращі гравці"], ["Вихід"]])
      .oneTime()
      .resize()
  );
});
//Scores
bot.hears("Найкращі гравці", (ctx) => {
  ctx.reply(siteUrl);
});

//start
bot.hears("Почали", async (ctx) => {
  await ctx.reply(
    `Готовий практикуватися у математиці?\nПравила прості: \n${
      maxQuestions + 1
    } прикладів і декілька підказок.\nКожна правильна відповідь додає 1 бал.\nКожна підказка знімає 2 бали.\nДаси відповідь на всі ${
      maxQuestions + 1
    } питань отримаєш приз!`
  );
  start(ctx);
});

//exit button action
bot.hears("Вихід", async (ctx) => {
  ctx.reply("Гаразд! До зустрічі наступного разу!");
});
bot.action("multi", (ctx) => {
  action = "*";
  mixedKeyboard(ctx, action, chatID);
});
bot.action("sum", (ctx) => {
  action = "+";
  mixedKeyboard(ctx, action, chatID);
});
bot.action("sub", (ctx) => {
  action = "-";
  mixedKeyboard(ctx, action, chatID);
});
bot.action("div", (ctx) => {
  action = ":";
  mixedKeyboard(ctx, action, chatID);
});
bot.action("impress", (ctx) => {
  action = random();
  mixedKeyboard(ctx, action, chatID);
});
bot.action("exit", (ctx) => {
  ctx.reply("Гаразд! До зустрічі наступного разу!");
});
bot.on("callback_query", async (ctx) => {
  callbackData = ctx.update.callback_query.data;
  chatID = ctx.from.id;
  if (
    ctx.db == undefined ||
    ctx.db?.[chatID] == undefined ||
    result == undefined ||
    rightAnswers == undefined
  ) {
    await ctx.telegram.sendMessage(chatID, `Сталася помилка, давай спочатку`);
    start(ctx);
    return;
  }
  bot.context.db[chatID] = Object.assign(ctx.db[chatID], { callbackData });
  console.log(ctx.db);
  rightAnswers = rightAnswers ?? 0;
  //bot.context.result = { [chatID]: [result] };
  //console.log("callback_object", ctx.result);
  //console.log(ctx);
  // console.log(ctx.result);
  //console.log(result, callbackData, ctx.from.id);
  //console.log("callback", callbackData);
  //console.log(ctx.result);
  // console.log(ctx.result[chatID]);
  if (
    ctx.db[chatID].result == ctx.db[chatID].callbackData &&
    ctx.db[chatID].rightAnswers < maxQuestions
  ) {
    await ctx.telegram.sendMessage(
      chatID,
      `Молодець! Дай правильну відповідь ще на ${
        maxQuestions - ctx.db[chatID].rightAnswers
      } питань і отримаєш приз!`
    );
    rightAnswers = ctx.db[chatID].rightAnswers + 1;
    // console.log('rightAnswers',rightAnswers);
    //rightAnswers++;
    bot.context.db[chatID] = Object.assign(ctx.db[chatID], { rightAnswers });
    // if (ctx.update.callback_query.message.message_id + 1) {
    //   console.log(
    //     "second remove:",
    //     ctx.update.callback_query.message.message_id + 1
    //   );
    //   setTimeout(() => {
    //     try {
    //       ctx.deleteMessage(ctx.update.callback_query.message.message_id + 1);
    //     } catch (error) {}
    //   }, 2000);
    // }
    //повторний запуск тесту;
    //для запуску з рендомними питаннями math(ctx, random())
    mixedKeyboard(ctx, random(action), chatID);
  } else if (
    ctx.db[chatID].result == ctx.db[chatID].callbackData &&
    ctx.db[chatID].rightAnswers >= maxQuestions
  ) {
    if (ctx.update.callback_query.message.message_id) {
      //bestResults++;
      bestResults = ctx.db[chatID].bestResults + 1;
      bot.context.db[chatID] = Object.assign(ctx.db[chatID], {
        bestResults,
      });
      //console.log(`top`, bestResults);

      mongo(ctx, ctx.db[chatID].bestResults, chatID);
      try {
        () =>
          setTimeout(
            ctx.deleteMessage(ctx.update.callback_query.message.message_id),
            1000
          );
      } catch (error) {}
    }
    ctx.reply(
      `Молодець! Ти дуже гарно знаєш таблицю!!!\nПідказок використано: ${cheat}\nТримай фото песика:)`
    );
    // const response = await fetch("https://dog.ceo/api/breeds/image/random", {
    //  agent: new HttpsProxyAgent(process.env.Proxy),
    // });
    const response = await fetch("https://dog.ceo/api/breeds/image/random");
    const data = await response.json();
    if (data.status == "success") {
      await ctx.replyWithPhoto(data.message);
      await ctx.replyWithAudio({ source: "./victory.mp3" });
    } else if (data.status == "error") {
      await ctx.reply("Вибач, песика знайти не вдалося :(");
    }
    ctx.reply("Наші найкращі гравці тут:\n" + siteUrl);
    start(ctx, chatID);
  } else if (
    ctx.db[chatID].callbackData == "cheat" &&
    ctx.db[chatID].rightAnswers > 0
  ) {
    rightAnswers = ctx.db[chatID].rightAnswers - 2;
    bot.context.db[chatID] = Object.assign(ctx.db[chatID], { rightAnswers });
    cheat++;
    ctx.reply(
      "Натисни: " +
        ctx.db[chatID].result +
        "\nКількість правильних відповідей зменшилася на 2.\nЛишилося ще: " +
        (maxQuestions - ctx.db[chatID].rightAnswers)
    );
  } else {
    await ctx.replyWithAudio({ source: "./lost.mp3" });
    await ctx.reply(
      "Нажаль, не вірно:(. Старайся краще наступного разу!\nВірних відповідей: " +
        ctx.db[chatID].rightAnswers
    );
    start(ctx, chatID);
  }
});
bot.catch((err, ctx) => {
  console.log(`Ох-охо-xo, сталося щось жаахливе: ${ctx.updateType}`, err);
});

// Запуск бота
bot.launch();

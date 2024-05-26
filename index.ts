interface Config {
  calendarId: string;
  githubToken: string;
  morningHour: number; // ここまでが朝(defalut 14時)
  mustWords: string[];
  zenkyuWords: string[];
  gozenkyuWords: string[];
  gogoKyuWords: string[];
}

function parseNumber(value: string | null): number | null {
  if (value === null) {
    return null;
  }
  return Number(value);
}

function newConfig(): Config {
  const properties = PropertiesService.getScriptProperties();
  const cid: string | null = properties.getProperty("CALENDAR_ID");
  if (cid === null) {
    throw new Error("CALENDAR_ID is not set");
  }
  const ghToken: string | null = properties.getProperty("GITHUB_TOKEN");
  if (ghToken === null) {
    throw new Error("GTIHUB_TOKEN is not set");
  }
  let morningHour: number | null = parseNumber(properties.getProperty("MORNING_HOUR"));
  if (morningHour === null) {
    morningHour = 14;
  }
  let mustWords: string[] = properties.getProperty("MUST_WORDS")?.split(",") || [];
  let zenkyuWords: string[] = properties.getProperty("ZENKYU_WORDS")?.split(",") || ["全休", "休み"];
  let gozenkyuWords: string[] = properties.getProperty("GOZENKYU_WORDS")?.split(",") || ["午前休", "午前半休"];
  let gogoKyuWords: string[] = properties.getProperty("GOGO_KYU_WORDS")?.split(",") || ["午後休", "午後半休"];

  return {
    calendarId: cid,
    githubToken: ghToken,
    morningHour: morningHour,
    mustWords: mustWords,
    zenkyuWords: zenkyuWords,
    gozenkyuWords: gozenkyuWords,
    gogoKyuWords: gogoKyuWords,
  };
}

function containsMustWords(title: string, words: string[]): boolean {
  for (const word of words) {
    if (!title.includes(word)) {
      return false;
    }
  }
  return true;
}

function containsWords(title: string, words: string[]): boolean {
  for (const word of words) {
    if (title.includes(word)) {
      return true;
    }
  }
  return false;
}

async function main() {
  const config = newConfig();
  const now = new Date();

  const github = new GitHubGraphQLClient(config.githubToken);

  const calendar = CalendarApp.getCalendarById(config.calendarId);
  const events = calendar.getEventsForDay(now);

  const isMorning = now.getHours() <= config.morningHour;
  Logger.log(`isMorning: ${isMorning}, now: ${now.getHours()}`);

  let isBusy = false;
  events.forEach((event) => {
    const title = event.getTitle();
    // 必須ワードが含まれていない場合は無視
    if (!containsMustWords(title, config.mustWords)) {
      return;
    }
    // 全休の場合は無条件でbusy
    if (containsWords(title, config.zenkyuWords)) {
      isBusy = true;
      return;
    }
    // 午前休の場合は午前はbusy
    if (isMorning && containsWords(title, config.gozenkyuWords)) {
      isBusy = true;
      return;
    }
    // 午後休の場合は午後はbusy
    if (!isMorning && containsWords(title, config.gogoKyuWords)) {
      isBusy = true;
      return;
    }
  });

  // 忙しいときは busy ステータスを設定
  if (isBusy) {
    try {
      Logger.log("忙しい");
      await github.updateUserStatus("busy", ":love_you_gesture:", true);
    } catch (e) {
      Logger.log(`Error: ${e}`);
    }
    return;
  }

  // 忙しくないときは work ステータスを設定
  try {
    Logger.log("忙しくない");
    await github.updateUserStatus("work", ":v:", false);
  } catch (e) {
    Logger.log(`Error: ${e}`);
  }
}

interface Config {
  calendarId: string;
  githubToken: string;
}

function newConfig(): Config {
  const properties = PropertiesService.getScriptProperties()
  const cid: string | null = properties.getProperty("CALENDAR_ID");
  if (cid === null) {
    throw new Error("CALENDAR_ID is not set");
  }
  const ghToken: string | null = properties.getProperty("GITHUB_TOKEN");
  if (ghToken === null) {
    throw new Error("GTIHUB_TOKEN is not set");
  }

  return {
    calendarId: cid,
    githubToken: ghToken,
  }
}

async function main() {
  const config = newConfig();
  const today = new Date();

  const github = new GitHubGraphQLClient(config.githubToken);

  const calendar = CalendarApp.getCalendarById(config.calendarId);
  const events = calendar.getEventsForDay(today);

  let isBusy = false;
  events.forEach(event => {
    if (event.getTitle().includes("全休")) {
      isBusy = true;
      return;
    }
  });

  if (isBusy) {
    try {
      await github.updateUserStatus("busy", ":love_you_gesture:", true);
    } catch (e) {
      Logger.log(`Error: ${e}`);
    }
  }
}

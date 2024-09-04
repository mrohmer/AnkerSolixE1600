/*
   Sample usage of SolixE1600 class
   will write schedule.json and sceninfo.json to the current directory
   or pushes schedule to device if json file is specified as first parameter
*/
const fs = require("fs/promises");

const SolixE1600 = require("./SolixE1600.js");

const assertEnv = (envName, message) => {
  if (typeof process.env[envName] == 'undefined') {
    throw new Error(message);
  }
}

const handleScheduleUpdate = async (mysolix, schedulePath) => {
  console.log("Writing new Schedule");
  const content = await fs.readFile(schedulePath);

  if (!content) {
    console.log("could not read schedule file");
    process.exit(1);
    return;
  }

  const schedule = JSON.parse(content);
  await mysolix.setSchedule(schedule);
}

const writeFile = (path, data) => fs.writeFile(path, JSON.stringify(data, null, 2))
const readData = async () => {
  const [sceninfo, schedule] = await Promise.all([
    mysolix.getScenInfo(),
    mysolix.getSchedule(),
  ]);
  await Promise.all([
    writeFile("sceninfo.json", sceninfo),
    writeFile("schedule.json", schedule),
  ]);
}

const app = async () => {
  assertEnv("ANKER_USERNAME", "SET ANKER_USERNAME=your@mail.com");
  assertEnv("ANKER_PASSWORD", "SET ANKER_PASSWORD=yourAppPassword");
  assertEnv("ANKER_COUNTRY", "SET ANKER_COUNTRY=2-LETT-CODE");

  const mysolix = new SolixE1600({
    username: process.env.ANKER_USERNAME,
    password: process.env.ANKER_PASSWORD,
    country: process.env.ANKER_COUNTRY,
  });
  console.log(process.argv);

  if (typeof process.argv[2] !== 'undefined') {
    await handleScheduleUpdate(mysolix, process.argv[2]);
    return undefined;
  }

  await readData();
}

app()
  .catch(err => {
    console.log(err?.message ?? err);
    process.exit(1);
  })

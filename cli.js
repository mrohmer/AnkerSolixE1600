/*
   Sample usage of SolixE1600 class
   will write schedule.json and sceninfo.json to the current directory
   or pushes schedule to device if json file is specified as first parameter
*/
const fs = require("fs/promises");
const {resolve} = require("path");

const SolixE1600 = require("./src/SolixE1600.js");
const SolixApi = require("./src/SolixAPI.js");
const {createHash} = require("crypto");

const assertEnv = (envName, message) => {
    if (typeof process.env[envName] == 'undefined') {
        throw new Error(message);
    }
}
const assertMethod = (method) => {
    if (typeof method !== 'string') {
        throw new Error("Invalid method");
    }
    if (!/^\w+.\w+$/.test(method)) {
        throw new Error("Invalid method format");
    }

    const [scope, key] = method.split('.');

    if (!['app', 'powerServices', 'chargingPvSvc'].includes(scope)) {
        throw new Error("Invalid scope");
    }

    if (scope === 'app' && SolixApi.App.prototype[key] === undefined) {
        throw new Error("Invalid method in app");
    }

    if (scope === 'powerServices' && SolixApi.PowerServices.prototype[key] === undefined) {
        throw new Error("Invalid method in app");
    }
}

const resolvePath = (path = '') => resolve('.data', path);
const prepareDir = async () => {
    try {
        const base = resolvePath();

        const stat = await fs.stat(base).catch(() => undefined);

        if (stat) {
            return;
        }

        await fs.mkdir(base, {recursive: true});
        await fs.writeFile(resolve(base, '.gitignore'), '*');
    } catch (e) {
        if (e.code !== 'EEXIST') {
            throw e;
        }
    }
}
const writeFile = async (path, data) => {
    if (!data) {
        return fs.unlink(resolvePath(path));
    }
    return fs.writeFile(resolvePath(path), JSON.stringify(data, null, 2));
}
const readFile = async (path) => {
    try {
        const content = await fs.readFile(resolvePath(path));
        const str = content.toString();
        if (!str) {
            return undefined;
        }

        return JSON.parse(str);
    } catch (e) {
        if (!['EEXIST', 'ENOENT'].includes(e.code)) {
            throw e;
        }
        return undefined;
    }
}
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
const storeSessionConfig = (sessionKey, data) => writeFile(`${sessionKey}.json`, data);

const getSessionKey = (username) => `session-${createHash("md5").update(Buffer.from(username)).digest("hex")}`;

const app = async () => {
    assertEnv("ANKER_USERNAME", "SET ANKER_USERNAME=your@mail.com");
    assertEnv("ANKER_PASSWORD", "SET ANKER_PASSWORD=yourAppPassword");
    assertEnv("ANKER_COUNTRY", "SET ANKER_COUNTRY=2-LETT-CODE");

    const method = process.argv[2];

    assertMethod(method);

    const sessionKey = getSessionKey(process.env.ANKER_USERNAME);
    const sessionFilePath = `sessions/${sessionKey}.json`;

    await prepareDir();
    const sessionConfig = await readFile(sessionFilePath);

    const api = new SolixE1600({
        username: process.env.ANKER_USERNAME,
        password: process.env.ANKER_PASSWORD,
        country: process.env.ANKER_COUNTRY,
        logger: console,
        loginCredentials: sessionConfig?.loginCredentials,
    });


    try {
        api
            .on('initialized', async () => {
                await writeFile(sessionFilePath, {loginCredentials: api.getSessionConfiguration()?.loginCredentials});
            })
            .on('couldNotGetCredentials', async (loginResponse) => {
                console.error('could not get credentials', loginResponse);
                await writeFile(sessionFilePath, undefined);
            })
            .on('authFailed', async () => {
                await writeFile(sessionFilePath, undefined);
            })

        const isInitialised = await api.init();

        isInitialised && await new Promise(resolve => setTimeout(resolve, 500));

        const [scope, key] = method.split('.');
        const args = process.argv.slice(3).map(v => {
            try {
                return JSON.parse(v)
            } catch (e) {
                return v
            }
        });

        const data = await api.raw(scope, key, args);
        await writeFile(`${method}.json`, data);
        console.log(JSON.stringify(data, null, 2));
    } finally {
        api.eventNames().forEach(event => api.removeAllListeners(event));
    }
}

app()
    .catch(err => {
        console.log(err?.message ?? err);
        process.exit(1);
    })

"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fastify_1 = __importDefault(require("fastify"));
const stream_1 = require("stream");
const util_1 = require("util");
const fastify_static_1 = __importDefault(require("fastify-static"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const pump = util_1.promisify(stream_1.pipeline);
const fastify_multipart_1 = __importDefault(require("fastify-multipart"));
let app = fastify_1.default({ logger: false });
// Require the framework and instantiate it
app.register(fastify_multipart_1.default);
app.register(fastify_static_1.default, {
    root: path_1.default.join(__dirname, "./../../cli/public"),
    prefix: "/api/public",
    list: true,
});
// Declare a route
app.post("/api/sendfile", async (request, reply) => {
    var e_1, _a;
    const params = request.query;
    const parts = await request.parts();
    try {
        for (var parts_1 = __asyncValues(parts), parts_1_1; parts_1_1 = await parts_1.next(), !parts_1_1.done;) {
            const part = parts_1_1.value;
            if (!fs_1.existsSync(`./reports/${params["project"]}/${params["mode"]}`)) {
                fs_1.mkdirSync(`./reports/${params["project"]}/${params["mode"]}`, {
                    recursive: true,
                });
            }
            const path = `./reports/${params["project"]}/${params["mode"]}/${part.filename}`;
            if (part.file) {
                await pump(part.file, fs_1.createWriteStream(path));
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (parts_1_1 && !parts_1_1.done && (_a = parts_1.return)) await _a.call(parts_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return { success: true };
});
app.get("/api/data/:prj/:m/:e/:domain", async (request, reply) => {
    const { prj, e, m, domain } = request.params;
    const result = {};
    const projects = getSubDirs("./reports");
    for (const project of projects) {
        if (prj && prj === project.name) {
            result[project.name] = {};
            const envs = getSubDirs(`./reports/${project.name}`);
            for (const env of envs) {
                if (m && env.name === m) {
                    result[project.name][env.name] = {};
                    const files = getJSONFiles(`./reports/${project.name}/${env.name}/`);
                    for (const file of files) {
                        if (e &&
                            file.name.split("--")[0] == e &&
                            domain &&
                            file.name.split("--")[1] == domain) {
                            result[project.name][env.name][file.name] = fs_1.readFileSync(`./reports/${project.name}/${env.name}/${file.name}`).toString();
                        }
                    }
                }
            }
        }
    }
    return { data: result };
});
app.get("/api/filter", async (request, reply) => {
    const result = { projects: [], modes: [], envs: [], domains: [] };
    const projects = getSubDirs("./reports");
    result.projects = projects.map((project) => project.name);
    for (const project of projects) {
        const envs = getSubDirs(`./reports/${project.name}`);
        result.modes.push(...envs.map((env) => env.name));
        for (const env of envs) {
            const files = getJSONFiles(`./reports/${project.name}/${env.name}`);
            result.envs.push(...files.map((env) => env.name.split("--")[0]));
            result.domains.push(...files.map((env) => env.name.split("--")[1]));
            result.envs = Array.from(new Set(result.envs));
            result.domains = Array.from(new Set(result.domains));
        }
    }
    return { data: result };
});
app.get("/api/file/:project/:mode/:name", async (request, reply) => {
    const { project, mode, name } = request.params;
    reply.headers({
        "content-type": "text/html",
    });
    reply.send(fs_1.readFileSync(`./reports/${project}/${mode}/${name}`));
});
app.get("/api/run/:project/:mode/:env", async (request, reply) => {
    let bin = "";
    if (process.platform == "darwin") {
        bin = "./public/cli-macos";
    }
    else if (process.platform == "linux") {
        bin = "./public/cli-linux";
    }
    else {
        bin = "./public/cli-win.exe";
    }
    const { project, mode, env } = request.params;
    const newPath = path_1.default.join(__dirname, "./../../cli");
    console.log({ newPath });
    let child = child_process_1.spawn(bin, [project, mode, env], { cwd: newPath, detached: true });
    request.connection.on("close", (e) => {
        console.log("close");
        // process.kill(-child.pid);
        // child.stdin.destroy();
        child.kill("SIGINT");
        // child.disconnect()
    });
    request.connection.on("end", (e) => {
        console.log("end");
        child.kill("SIGINT");
        // process.kill(-child.pid);
        // child.stdin.destroy();
        // child.disconnect()
    });
    reply.send(child.stdout);
});
function getSubDirs(path) {
    return fs_1.readdirSync(path, { withFileTypes: true }).filter((sub) => sub.isDirectory());
}
function getJSONFiles(path) {
    return fs_1.readdirSync(path, { withFileTypes: true }).filter((sub) => sub.isFile() && sub.name.endsWith(".json"));
}
// Run the server!
const start = async () => {
    try {
        await app.listen(4000);
        app.log.info(`server listening on ${app.server.address()}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();

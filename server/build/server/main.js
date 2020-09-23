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
const config_json_1 = __importDefault(require("./../cli/config.json"));
const pump = util_1.promisify(stream_1.pipeline);
const envs = ["dev", "qa", "preprod", "prod"];
const fastify_multipart_1 = __importDefault(require("fastify-multipart"));
const stream_2 = require("stream");
const mergeStream = (...streams) => {
    let pass = new stream_2.PassThrough();
    let waiting = streams.length;
    for (let stream of streams) {
        pass = stream.pipe(pass, { end: false });
        stream.once('end', () => --waiting === 0 && pass.emit('end'));
    }
    return pass;
};
let app = fastify_1.default({ logger: false });
// Require the framework and instantiate it
app.register(fastify_multipart_1.default);
app.register(fastify_static_1.default, {
    root: path_1.default.join(__dirname, "./../../../cli/public"),
    prefix: "/api/public",
    list: true,
});
const reportsDir = "./reports";
// Declare a route
app.post("/api/sendfile", async (request, reply) => {
    var e_1, _a;
    const params = request.query;
    const parts = await request.parts();
    try {
        for (var parts_1 = __asyncValues(parts), parts_1_1; parts_1_1 = await parts_1.next(), !parts_1_1.done;) {
            const part = parts_1_1.value;
            if (!fs_1.existsSync(`${reportsDir}/${params["project"]}/${params["mode"]}`)) {
                fs_1.mkdirSync(`${reportsDir}/${params["project"]}/${params["mode"]}`, {
                    recursive: true,
                });
            }
            const path = `${reportsDir}/${params["project"]}/${params["mode"]}/${part.filename}`;
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
    let { prj, e, m, domain } = request.params;
    domain = encodeURIComponent(domain);
    console.log({ prj, e, m, domain });
    const result = {};
    const projects = getSubDirs(reportsDir);
    for (const project of projects) {
        if (prj && prj === project.name) {
            result[project.name] = {};
            const envs = getSubDirs(`${reportsDir}/${project.name}`);
            for (const env of envs) {
                if (m && env.name === m) {
                    result[project.name][env.name] = {};
                    const files = getJSONFiles(`${reportsDir}/${project.name}/${env.name}/`);
                    for (const file of files) {
                        if (e &&
                            file.name.split("--")[0] == e &&
                            domain &&
                            file.name.split("--")[1] == domain) {
                            result[project.name][env.name][file.name] = fs_1.readFileSync(`${reportsDir}/${project.name}/${env.name}/${file.name}`).toString();
                        }
                    }
                }
            }
        }
    }
    return { data: result };
});
app.get("/api/filter", async (request, reply) => {
    const result = { projects: [], modes: [], envs: envs, domains: [] };
    console.log(config_json_1.default);
    result.projects = Object.keys(config_json_1.default);
    for (const project of result.projects) {
        let modes = Object.keys(config_json_1.default[project]);
        result.modes.push(...modes);
        for (const mode of modes) {
            result.domains.push(...config_json_1.default[project][mode]);
        }
    }
    return { data: result };
});
app.get("/api/file/:project/:mode/:name", async (request, reply) => {
    let { project, mode, name } = request.params;
    name = encodeURIComponent(name);
    reply.headers({
        "content-type": "text/html",
    });
    reply.send(fs_1.readFileSync(`${reportsDir}/${project}/${mode}/${name}`));
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
    const newPath = path_1.default.join(__dirname, "./../../../cli");
    console.log({ project, mode, env });
    let child = child_process_1.spawn(bin, [project, mode, env], { cwd: newPath, detached: true });
    child.on("error", (e) => {
        reply.status(400).send({ error: e });
    });
    child.on("message", (e) => {
        console.log({ e });
    });
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
    const stream = mergeStream(child.stderr, child.stdout);
    reply.send(stream);
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

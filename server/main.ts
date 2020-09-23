import {
  createWriteStream,
  existsSync,
  
  mkdirSync,
  readdirSync,
  readFileSync,
  ReadStream,
  WriteStream,
} from "fs";
import fastify from "fastify";
import { pipeline } from "stream";
import { promisify } from "util";
import fastifyStatic from "fastify-static";
import path from "path";
import { spawn, fork } from "child_process";
import config from "./../cli/config.json"; 

const pump = promisify(pipeline);

const envs = ["dev", "qa","preprod","prod"]

import appmultipart from "fastify-multipart";
import { PassThrough } from 'stream'
const mergeStream = (...streams) => {
    let pass = new PassThrough()
    let waiting = streams.length
    for (let stream of streams) {
        pass = stream.pipe(pass, {end: false})
        stream.once('end', () => --waiting === 0 && pass.emit('end'))
    }
    return pass
}

let app = fastify({ logger: false });
// Require the framework and instantiate it

app.register(appmultipart);

app.register(fastifyStatic, {
  root: path.join(__dirname, "./../../../cli/public"),
  prefix: "/api/public",
  list: true,
});

const reportsDir = "./reports";

// Declare a route
app.post("/api/sendfile", async (request, reply) => {
  const params = request.query;
  const parts = await request.parts();

  for await (const part of parts) {
    if (!existsSync(`${reportsDir}/${params["project"]}/${params["mode"]}`)) {
      mkdirSync(`${reportsDir}/${params["project"]}/${params["mode"]}`, {
        recursive: true,
      });
    }
    const path = `${reportsDir}/${params["project"]}/${params["mode"]}/${part.filename}`;
    if (part.file) {
      await pump(part.file, createWriteStream(path));
    }
  }

  return { success: true };
});
app.get("/api/data/:prj/:m/:e/:domain", async (request, reply) => {
  let { prj, e, m, domain } = <any>request.params;
  domain = encodeURIComponent(domain)
  console.log({ prj, e, m, domain })
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
            if (
              e &&
              file.name.split("--")[0] == e &&
              domain &&
              file.name.split("--")[1] == domain
            ) {
              result[project.name][env.name][file.name] = readFileSync(
                `${reportsDir}/${project.name}/${env.name}/${file.name}`
              ).toString();
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
  console.log(config)
result.projects = Object.keys(config)
for (const project of result.projects){
  let modes = Object.keys(config[project]);
  result.modes.push(...modes)
  for(const mode of modes){
   result.domains.push(...config[project][mode])
  }
}
 

  return { data: result };
});
app.get("/api/file/:project/:mode/:name", async (request, reply) => {
  let { project, mode, name } = <any>request.params;
  name = encodeURIComponent(name)
  reply.headers({
    "content-type": "text/html",
  });
  reply.send(readFileSync(`${reportsDir}/${project}/${mode}/${name}`));
});
app.get("/api/run/:project/:mode/:env", async (request, reply) => {
  let bin = "";
  if (process.platform == "darwin") {
    bin = "./public/cli-macos";
  } else if (process.platform == "linux") {
    bin = "./public/cli-linux";
  } else {
    bin = "./public/cli-win.exe";
  }
  const { project, mode, env } = <any>request.params;
  
  const newPath = path.join(__dirname, "./../../../cli");
  console.log({ project, mode, env });
  let child = spawn(bin, [project, mode, env], { cwd: newPath, detached:true });
  child.on("error", (e) => {
    reply.status(400).send({error:e})
  })
  child.on("message",(e) => {
    console.log({e})
  })
  
  request.connection.on("close", (e) => {
    console.log("close")
    
    // process.kill(-child.pid);
    // child.stdin.destroy();
     child.kill("SIGINT");
    // child.disconnect()
  });
 
  request.connection.on("end", (e) => {
    console.log("end")
    child.kill("SIGINT");
    // process.kill(-child.pid);
    // child.stdin.destroy();
   
    // child.disconnect()
  });
 const stream = mergeStream(child.stderr, child.stdout)
  reply.send(stream);
});

function getSubDirs(path) {
  return readdirSync(path, { withFileTypes: true }).filter((sub) =>
    sub.isDirectory()
  );
}
function getJSONFiles(path) {
  return readdirSync(path, { withFileTypes: true }).filter(
    (sub) => sub.isFile() && sub.name.endsWith(".json")
  );
}

// Run the server!
const start = async () => {
  try {
    await app.listen(4000);
    app.log.info(`server listening on ${app.server.address()}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();

import data from "./config.json";
import {resolve} from "path"
import fetch from "node-fetch";
const fs = require("fs");
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { createReadStream, existsSync, mkdirSync } from "fs";
import { pathToFileURL } from "url";

const remoteServer = "http://localhost:4000"

const project = process.argv[2] || "N2";
const mode = process.argv[3] || "pdn";
const server = process.argv[4] || "qa";

console.log({project, mode, server})

async function main() {
  //@ts-ignore 
  for (const site of data[project][mode]) { //@ts-ignore 
    try{
      await startLighthouse(site);
    } catch(e){
      console.error(e)
    }
   
    // sendResult();
  }
}

async function startLighthouse(site: string) {
  console.log("----------------------------------------------");
  console.log("Testing", site);
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless", " --ignore-certificate-errors"] });
  const options = {
     logLevel: "warn",
    output: ["html", "json"],
    onlyCategories: ["performance"],
    port: chrome.port,
  };
  const runnerResult = await lighthouse(
    mode === "pdn" ? `${site}`:`${site}`,
    options
  );

  // `.report` is the HTML report as a string
  const reportHtml = runnerResult.report;

  const artifacts = runnerResult.artifacts;
  // console.log({reportHtml, artifacts})

  

  const date = Date.now();
  const reportPath = resolve(".", "reports");
  if(!existsSync(reportPath)){ mkdirSync(reportPath);}
  const fileName = `${reportPath}/${server}--${encodeURIComponent(site)}--${date}`;
  const HTMLFile = `${fileName}.html`;
  const JSONFile = `${fileName}.json`;
  fs.writeFileSync(  HTMLFile, reportHtml[0]);
  fs.writeFileSync( JSONFile, reportHtml[1]);

  // `.lhr` is the Lighthouse Result as a JS object

  console.log(
    "Performance score for ",
    site,
    runnerResult.lhr.categories.performance.score * 100
  );
  await sendResult(
    HTMLFile,
    JSONFile,
    site
  );

  await chrome.kill();
}
const FormData = require("form-data");

async function sendResult(file1: string, file2: string, site:string) {
  const stream1 = createReadStream(file1);
  const stream2 = createReadStream(file2);

  const form = new FormData();

  form.append("file1", stream1);
  form.append("file2", stream2);
  try{
    await fetch(`${remoteServer}/api/sendfile?project=${project}&mode=${mode}&site=${site}`, {
      method: "POST",
      body: form,
      
    });
  } catch(e){
    console.log("Error uploading results to server", remoteServer, "Check if server is running there");
  }
 
}

(async () => main())();

const DOMAIN = `/api/`;
export async function getHomeData(project:string, mode:string, env:string, domain:string) {
  const URL = `${DOMAIN}data/${project}/${mode}/${env}/${encodeURIComponent(domain)}`;
  const res = await fetch(URL);
  return res.json();
}

export async function getfilterData() {
  const URL = `${DOMAIN}filter`;
  const res = await fetch(URL);
  return res.json();
}

export async function getFile(project:string, mode:string, filename:string) {
  const URL = `${DOMAIN}file/${project}/${mode}/${encodeURIComponent(filename)}`;
  const res = await fetch(URL);
  return res.text();
}

export async function run(project:string, mode:string, env:string) {
  const URL = `${DOMAIN}run/${project}/${mode}/${env}`;
  const res = await fetch(URL);
  return res.body?.pipeThrough(new TextDecoderStream()).getReader()
  ;
}
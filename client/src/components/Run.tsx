import React, { ReactElement, useContext, useEffect, useState } from "react";
import { Button } from "@rmwc/button";
import { Typography } from "@rmwc/typography";
import { Select } from "@rmwc/select";
import { getfilterData, run } from "../util/util";
import { CircularProgress } from "@rmwc/circular-progress";
interface Props {}


export default function Run(props: Props): ReactElement {
  const [filterData, setFilterData] = useState<any>({});
  const [filter, setFilter] = useState<any>({});
  const [res, setRes] = useState("");
  //   console.log({resultinit:result })
  useEffect(() => {
    getfilterData().then((filter) => {
      setFilterData(filter.data);
      setFilter({
        project: filter.data.projects[0],
        mode: filter.data.modes[0],
        env: filter.data.envs[0],
        domain: filter.data.domains[0],
      });
    });
  }, []);

  if (!filterData.projects) {
    return <CircularProgress size={200} />
  }

  return (
    <div style={{ padding: "15px 20px" }}>
      <Typography className="text-left" use="headline5">
        Run
      </Typography>

      <Select
        options={filterData && filterData.projects}
        defaultValue={filterData.projects[0]}
        onChange={(e: any) => setFilter({ ...filter, project: e.target.value })}
      />
      <Typography className="text-left" use="subtitle1">
        Mode
      </Typography>
      <Select
        options={filterData.modes}
        defaultValue={filterData.modes[0]}
        onChange={(e: any) => setFilter({ ...filter, mode: e.target.value })}
      />
      <Typography className="text-left" use="subtitle1">
        Environment
      </Typography>
      <Select
        options={filterData.envs}
        defaultValue={filterData.envs[0]}
        onChange={(e: any) => setFilter({ ...filter, env: e.target.value })}
      />
      <Button
        raised
        onClick={async () => {
          let data = "";
          const reader = await run(filter.project, filter.mode, filter.env);

          // @ts-ignore
          let { value, done } = await reader?.read();
          while (!done) {
            console.log({ data, value, done });
            data = data + value;
            setRes(data);
            console.log({data})
            let read = await reader?.read();
            value = read?.value;
            done = read?.done;
           
          }
        }}
      >
        Run
      </Button>
      <pre className="console-output">{res}</pre>
    </div>
  );
}

function getProjects(data: any) {
  return Object.keys(data);
}
function getModes(data: any, project: string) {
  return Object.keys(data[project]);
}
function getEnvs(data: any, project: string, mode: string) {
  return Object.keys(data[project][mode]);
}
function getFile(data: any, project: string, mode: string, env: string) {
  return Object.keys(data[project][mode][env]);
}

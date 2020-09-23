import React, { ReactElement, useContext, useEffect, useState } from "react";
import { Drawer } from "@rmwc/drawer";
import { Typography } from "@rmwc/typography";
import { CircularProgress } from "@rmwc/circular-progress";
import { Select } from "@rmwc/select";
import { getfilterData } from "../util/util";
interface Props {
  onChange:Function;
}

export default function Filters(props: Props): ReactElement {
  const [filterData, setFilterData] = useState<any>({});
  const [filter, setFilter] = useState<any>({});
  useEffect(() => {
    getfilterData().then((filter) => {
    setFilterData(filter.data);
    setFilter({project:filter.data.projects[0], mode:filter.data.modes[0], env:filter.data.envs[0], domain:filter.data.domains[0]})
    props.onChange({project:filter.data.projects[0], mode:filter.data.modes[0], env:filter.data.envs[0], domain:filter.data.domains[0]});
    
    });
  }, []);
  useEffect(() => {
    props.onChange(filter);
  }, [filter]);
  if (!filterData.projects) {
    return <CircularProgress size={200}></CircularProgress>;
  }

  return (
    <Drawer style={{padding:"15px 20px"}}>
      <Typography className="text-left" use="headline5">
        Filters
      </Typography>

      <Typography className="text-left" use="subtitle1">
        Projects
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
        onChange={(e: any) =>
          setFilter({ ...filter, env: e.target.value })
        }
      />
      <Typography className="text-left" use="subtitle1">
        Domain
      </Typography>
      <Select
        options={filterData.domains}
        defaultValue={filterData.domains[0]}
        onChange={(e: any) =>
          setFilter({ ...filter, domain: e.target.value })
        }
      />
    </Drawer>
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

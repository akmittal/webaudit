import React, { ReactElement } from "react";
import { CircularProgress } from "@rmwc/circular-progress";
import { List, ListItem, ListGroup, ListItemMeta } from "@rmwc/list";
import { ChipSet, Chip } from "@rmwc/chip";
import {
  Card,
  CardActionButton,
  CardPrimaryAction,
  CardActions,
  CardActionIcon,
  CardActionButtons,
  CardActionIcons,
} from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import { Link } from "react-router-dom";

interface Props {
  data: {
    [data: string]: any;
    score: number;
    "first-contentful-paint": string;
    interactive: string;
    "speed-index": string;
    "total-blocking-time": string;
    "largest-contentful-paint": string;
    "cumulative-layout-shift": string;
    fetchTime: Date;
    domain: string;
    project: string;
    env: string;
    stat: string;
    transferSize: number;
  };
}

const metrics: any = {
  "first-contentful-paint": "First Contentful Paint",
  interactive: "Time to Interactive",
  "speed-index": "Speed Index",
  "total-blocking-time": "Total Blocking Time",
  "largest-contentful-paint": "Largest Contentful Paint",
  "cumulative-layout-shift": "Cumulative Layout Shift",
};

export default function Stats(props: Props): ReactElement {
  const { project, env, stat } = props.data;
  return (
    <div>
      <Card style={{ boxSizing:"border-box",width: "100%", margin: "2rem" }}>
        <CardPrimaryAction>
          <div style={{ padding: "0 1rem 1rem 1rem", boxSizing:"border-box" }}>
            <div className="stat-header"><Typography use="headline6" className="text-left">
              Fetch Time : {props.data.fetchTime.toLocaleString()}
            </Typography>
            <br />
            <Typography use="headline6" className="text-left">
              Domain:
              <a target="_blank" href={props.data.domain}>
                {props.data.domain}
              </a>
            </Typography>
            </div>
            <div className="chart-container">
              <CircularProgress progress={props.data.score} size={120} />
              <div className="chart-score">{props.data.score * 100}</div>
            </div>
            <Typography use="headline5" tag="h2">
              Performance
            </Typography>
            <Typography
              use="headline6"
              tag="div"
              style={{ marginTop: "-1rem", textAlign: "left" }}
            >
              Metrics
            </Typography>
            <List className="stat-list">
              {Object.keys(metrics).map((item) => (
                <ListGroup>
                  <ListItem>
                    {metrics[item]}
                    <ListItemMeta>{props.data[item]}</ListItemMeta>
                  </ListItem>
                </ListGroup>
              ))}
              <ListGroup>
                <ListItem>
                  Total TransaferSize
                  <ListItemMeta>
                    {Math.round(props.data.transferSize / 1024)} KB
                  </ListItemMeta>
                </ListItem>
              </ListGroup>
            </List>
          </div>
        </CardPrimaryAction>
        <CardActions>
          <CardActionButtons>
            <Link
              to={`/file/${project}/${env}/${stat.replace(".json", ".html")}`}
            >
              {" "}
              <CardActionButton>Open Full stats</CardActionButton>
            </Link>
          </CardActionButtons>
          <ChipSet>
            <Chip label={props.data.project} />
            <Chip selected label={props.data.env} />
            <Chip label={props.data.stat.split("--")[0]} />
            <Chip label={props.data.stat.split("--")[1]} />
          </ChipSet>
        </CardActions>
      </Card>
    </div>
  );
}

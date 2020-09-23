import { AnyNsRecord } from "dns";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { newContext } from "../util/context";
import Stats from "./Stats";
import { CircularProgress } from "@rmwc/circular-progress";

interface Props {}

export default function Home({}: Props): ReactElement {
  const data: any = useContext(newContext);

  if (!data) {
    return <CircularProgress size={200} />
  }
  return (
    <div style={{ width: "100%" }}>
      {Object.keys(data).map((project) => {
        return Object.keys(data[project]).map((env) => {
          return Object.keys(data[project][env]).map((stat) => {
            const statData = JSON.parse(data[project][env][stat]);

            return (
              <Stats
                data={{
                  score: statData["categories"]["performance"]["score"],
                  "cumulative-layout-shift":
                    statData["audits"]["cumulative-layout-shift"][
                      "displayValue"
                    ],
                  "first-contentful-paint":
                    statData["audits"]["first-contentful-paint"][
                      "displayValue"
                    ],
                  "speed-index":
                    statData["audits"]["speed-index"]["displayValue"],
                  "largest-contentful-paint":
                    statData["audits"]["largest-contentful-paint"][
                      "displayValue"
                    ],
                  interactive:
                    statData["audits"]["interactive"]["displayValue"],
                  "total-blocking-time":
                    statData["audits"]["total-blocking-time"]["displayValue"],
                  fetchTime: new Date(statData["fetchTime"]),
                  domain: statData["requestedUrl"],
                  project,
                  env,
                  stat,
                  transferSize: statData["audits"]["network-requests"][
                    "details"
                  ]?statData["audits"]["network-requests"][
                    "details"
                  ]["items"]
                    .map((item: any) => item.transferSize)
                    .reduce((a: number, size: number) => a + size, 0) : "",
                }}
              />
            );
          });
        });
      })}
    </div>
  );
}

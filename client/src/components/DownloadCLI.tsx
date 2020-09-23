import React, { ReactElement } from "react";
import { Icon } from "@rmwc/icon";
import { Link } from "react-router-dom";
import { Typography } from "@rmwc/typography";

interface Props {}

export default function DownloadCLI({}: Props): ReactElement {
  return (
    <div className="download-container">
      <div className="download macos">
        <a href="/api/public/cli-macos" download="cli-macos">
          <Icon icon="get_app" />
          <Typography use="subtitle2">MacOS</Typography>
        </a>
      </div>
      <div className="download linux">
      <a href="/api/public/cli-linux" download="cli-linux">
        <Icon icon="get_app" />
        <Typography use="subtitle2">Linux</Typography> </a>
      </div>
      <div className="download windows">
      <a href="/api/public/cli-win.exe" download="cli-win.exe">
        <Icon icon="get_app" />
        <Typography use="subtitle2">Windows</Typography> </a>
      </div>
    </div>
  );
}

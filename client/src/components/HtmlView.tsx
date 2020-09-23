import React, { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFile } from "../util/util";
import { CircularProgress } from "@rmwc/circular-progress";

interface Props {}

export default function HtmlView({}: Props): ReactElement {
  const [file, setFile] = useState<string>("");
  const {project, mode, filename} = useParams();
  useEffect(() => {
    getFile(project, mode, filename).then((data) => {
      setFile(data);
    });
    const fileElem: any = document.querySelector("#FileFrame");
    if (fileElem) {
      let doc = fileElem.contentWindow.document;
      doc.open();
      doc.write(file);
      doc.close();
    }
  }, [file]);
  if (!file) {
    return <CircularProgress size={200} />;
  }
  return (
   
      <iframe style={{width:"100%"}} id="FileFrame" src="about:blank"></iframe>
 
  );
}

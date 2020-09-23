import React, { useEffect, useState } from "react";
import "./App.css";
import "rmwc/dist/styles";
import { SimpleTopAppBar, TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { Link } from "react-router-dom";
import { Button } from "@rmwc/button";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import Home from "./components/Home";
import { newContext } from "./util/context";
import { getHomeData } from "./util/util";
import Filters from "./components/Filters";
import HtmlView from "./components/HtmlView";
import DownloadCLI from "./components/DownloadCLI";
import Run from "./components/Run";

const { Provider } = newContext;

function App() {
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    setData(null)
    getHomeData(
      filters.project,
      filters.mode,
      filters.env,
      filters.domain
    ).then((data) => {
      setData(data.data);
    });
  }, [filters]);
  
  return (
    <Provider value={data}>
      <Router>
        <div className="App">
          <header className="App-header">
            <SimpleTopAppBar
              startContent={
                <nav className="topbar-nav">
                  
                    <Link to="/"><Button  theme={[ "onSecondary"]}>
                      Home
                    </Button></Link>
                 
                  
                    <Link to="/run"><Button  theme={[ "onSecondary"]}>
                      Run
                    </Button></Link>
                 
                  
                    <Link to="/download"><Button theme={[ "onSecondary"]}>
                      Download CLI
                    </Button></Link>
                 
                </nav>
              }
              title="Web Audits"
              navigationIcon
              onNav={() => console.log("Navigate")}
             
            />
            <TopAppBarFixedAdjust />

            <div
              style={{
                height: "calc(100vh - 60px)",
                width: "100%",
                display: "flex",
                justifyItems: "space-evenly",
              }}
            >
              <div>
                <Filters
                  onChange={(e: any) => {
                    console.log(e);
                    setFilters(e);
                  }}
                />
              </div>

              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/file/:project/:mode/:filename"
                  element={<HtmlView />}
                />
                 <Route
                  path="/download"
                  element={<DownloadCLI />}
                />
                 <Route
                  path="/run"
                  element={<Run />}
                />
              </Routes>
            </div>
          </header>
        </div>{" "}
      </Router>
    </Provider>
  );
}

export default App;

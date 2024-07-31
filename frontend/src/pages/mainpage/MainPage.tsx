import React from "react";
import CytoscapeComponent from "react-cytoscapejs";

const elements = [
  { data: { id: "a" } },
  { data: { id: "b" } },
  { data: { id: "c" } },
  { data: { id: "d" } },
  { data: { id: "e" } },
  { data: { source: "a", target: "b" } },
  { data: { source: "a", target: "c" } },
  { data: { source: "b", target: "d" } },
  { data: { source: "c", target: "e" } },
];

export default function Main() {
  return (
    <>
      <div>main 페이지입니다.</div>
      <div style={{ height: "100vh", width: "100%" }}>
        <CytoscapeComponent
          elements={elements}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </>
  );
}

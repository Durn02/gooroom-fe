import React, { useEffect, useRef } from "react";
import { Network } from "vis-network";

export default function MainPage() {
  const container = useRef(null);

  const nodes = [
    { id: 1, label: "South Korea", size: 20, shape: "square" },
    { id: 2, label: "Seoul" },
    { id: 3, label: "Jeju" },
    { id: 4, label: "Busan" },
    { id: 5, label: "Incheon" },
    { id: 6, label: "Gwangju" },
    { id: 7, label: "Daejeon" },
  ];
  const edges = [
    { from: 2, to: 1, label: "label1" },
    { from: 3, to: 1, label: "label2" },
    { from: 4, to: 1, label: "label3" },
    { from: 5, to: 1, label: "label4" },
    { from: 6, to: 5, label: "label5" },
    { from: 7, to: 5, label: "label6" },
    { from: 6, to: 7, label: "label7" },
    { from: 6, to: 4, label: "label8" },
  ];

  // network topology options.
  const options = {
    nodes: {
      shape: "dot",
      size: 12,
      shadow: true,
      color: {
        border: "white",
        background: "skyblue",
      },
      font: {
        color: "#000",
      },
    },
    edges: {
      color: "gray",
    },
    interaction: {
      hover: true,
    },
  };

  // create topology using edges, nodes, options
  useEffect(() => {
    const network: Network | null | undefined = container.current
      ? new Network(container.current, { nodes, edges }, options)
      : null;
    // Use `network` here to configure events, etc
    network?.on("doubleClick", (event: { nodes: number[] }) => {
      const { nodes: clickedNodes } = event;
      alert(`id ${clickedNodes} node is clicked.`);
    });
  }, [container, nodes, edges]);
  return (
    <div>
      <div ref={container} style={{ height: "100vh", width: "100%" }} />
    </div>
  );
}

const visnet_options = {
  physics: {
    enabled: true,
    solver: "forceAtlas2Based", // Use a force-based solver to cluster nodes naturally
    forceAtlas2Based: {
      gravitationalConstant: -50, // Negative value pulls nodes closer
      centralGravity: 0.01, // Strength of the pull towards the center
      springLength: 200, // Length of springs between nodes (closer makes them cluster tighter)
      springConstant: 0.08, // Strength of the spring between nodes
    },
    maxVelocity: 50, // Limits how fast nodes move
    stabilization: {
      iterations: 1500, // Number of iterations for stabilization
    },
  },
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
    smooth: {
      enabled: true,
      type: "dynamic",
      roundness: 0.5,
    },
  },
  physics: {
    enabled: true,
  },
  interaction: {
    hover: true,
  },
};

export default visnet_options;

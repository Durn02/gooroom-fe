const visnet_options = {
  nodes: {
    shape: 'dot',
    size: 12,
    shadow: true,
    color: {
      border: 'white',
      background: 'skyblue',
    },
    font: {
      color: '#000',
    },
  },
  edges: {
    color: 'gray',
    smooth: {
      enabled: true,
      type: 'dynamic',
      roundness: 0.5,
    },
  },
  physics: {
    enabled: true,
    barnesHut: {
      gravitationalConstant: -8000,
      centralGravity: 0.3,
      springLength: 50,
      springConstant: 0.04,
      damping: 0.09,
      avoidOverlap: false,
    },
  },
  interaction: {
    hover: true,
  },
};

export default visnet_options;

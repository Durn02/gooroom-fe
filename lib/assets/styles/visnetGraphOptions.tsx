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
  },
  interaction: {
    hover: true,
  },
};

export default visnet_options;

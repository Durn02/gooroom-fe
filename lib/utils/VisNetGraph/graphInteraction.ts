import { Network } from 'vis-network';

export const zoomIn = (network: Network) => {
  const scale = network.getScale();
  network.moveTo({
    scale: scale * 1.2,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad',
    },
  });
};

export const zoomOut = (network: Network) => {
  const scale = network.getScale();
  network.moveTo({
    scale: scale * 0.8,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad',
    },
  });
};

export const resetPosition = (network: Network) => {
  network.fit({
    animation: {
      duration: 1000,
      easingFunction: 'easeInOutQuad',
    },
  });
};

export const disableGraphInteraction = (network: Network) => {
  network.setOptions({
    interaction: {
      dragNodes: false,
      dragView: false,
      zoomView: false,
      selectable: false,
    },
  });
};

export const enableGraphInteraction = (network: Network) => {
  network.setOptions({
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      selectable: true,
    },
  });
};

export const hardenGraph = (network: Network) => {
  network.setOptions({
    edges: {
      smooth: {
        enabled: true,
        type: 'continuous',
        roundness: 0,
      },
    },
  });
};

export const softenGraph = (network: Network) => {
  network.setOptions({
    edges: {
      smooth: {
        enabled: true,
        type: 'dynamic',
        roundness: 0.5,
      },
    },
  });
};

import { NetworkManager } from './NetworkManager';

export const zoomIn = function (this: NetworkManager) {
  const network = this.getNetwork();
  const scale = network.getScale();
  network.moveTo({
    scale: scale * 1.2,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad',
    },
  });
};

export const zoomOut = function (this: NetworkManager) {
  const network = this.getNetwork();
  const scale = network.getScale();
  network.moveTo({
    scale: scale * 0.8,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad',
    },
  });
};

export const resetPosition = function (this: NetworkManager) {
  const network = this.getNetwork();
  network.fit({
    animation: {
      duration: 1000,
      easingFunction: 'easeInOutQuad',
    },
  });
};

export const disableGraphInteraction = function (this: NetworkManager) {
  const network = this.getNetwork();
  network.setOptions({
    interaction: {
      dragNodes: false,
      dragView: false,
      zoomView: false,
      selectable: false,
    },
  });
};

export const enableGraphInteraction = function (this: NetworkManager) {
  const network = this.getNetwork();
  network.setOptions({
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      selectable: true,
    },
  });
};

export const hardenGraph = function (this: NetworkManager) {
  const network = this.getNetwork();
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

export const softenGraph = function (this: NetworkManager) {
  const network = this.getNetwork();
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

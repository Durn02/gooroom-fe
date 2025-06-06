import { Network } from "vis-network";
let isCasting: boolean = false;

export const zoomIn = (network: Network | null) => {
  if (network && !isCasting) {
    const scale = network.getScale();
    network.moveTo({
      scale: scale * 1.2,
      animation: {
        duration: 500,
        easingFunction: "easeInOutQuad",
      },
    });
  }
};

export const zoomOut = (network: Network | null) => {
  if (network && !isCasting) {
    const scale = network.getScale();
    network.moveTo({
      scale: scale * 0.8,
      animation: {
        duration: 500,
        easingFunction: "easeInOutQuad",
      },
    });
  }
};

export const resetPosition = (network: Network | null) => {
  if (network && !isCasting) {
    network.fit({
      animation: {
        duration: 1000,
        easingFunction: "easeInOutQuad",
      },
    });
  }
};

export const disableGraphInteraction = (network: Network | null) => {
  if (network) {
    network.setOptions({
      interaction: {
        dragNodes: false,
        dragView: false,
        zoomView: false,
        selectable: false,
      },
    });
  }
  isCasting = true;
};

export const enableGraphInteraction = (network: Network | null) => {
  if (network) {
    network.setOptions({
      interaction: {
        dragNodes: true,
        dragView: true,
        zoomView: true,
        selectable: true,
      },
    });
  }
  isCasting = false;
};

export const hardenGraph = (network: Network | null) => {
  if (network) {
    network.setOptions({
      edges: {
        smooth: {
          enabled: true,
          type: "continuous",
          roundness: 0,
        },
      },
    });
  }
};

export const softenGraph = (network: Network | null) => {
  if (network) {
    network.setOptions({
      edges: {
        smooth: {
          enabled: true,
          type: "dynamic",
          roundness: 0.5,
        },
      },
    });
  }
};

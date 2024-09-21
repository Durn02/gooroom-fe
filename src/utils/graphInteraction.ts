import { Network } from "vis-network";

export const zoomIn = (network: Network | null, isCasting: boolean) => {
  if (network && !isCasting) {
    const scale = network.getScale();
    network.moveTo({
      scale: scale * 1.2, // 1.2배 확대
      animation: {
        duration: 500, // 애니메이션 지속 시간 (밀리초)
        easingFunction: "easeInOutQuad", // 애니메이션 이징 함수
      },
    });
  }
};

export const zoomOut = (network: Network | null, isCasting: boolean) => {
  if (network && !isCasting) {
    const scale = network.getScale();
    network.moveTo({
      scale: scale * 0.8, // 0.8배 축소
      animation: {
        duration: 500, // 애니메이션 지속 시간 (밀리초)
        easingFunction: "easeInOutQuad", // 애니메이션 이징 함수
      },
    });
  }
};

export const fitNetworkToScreen = (network: Network | null) => {
  if (network) {
    network.fit({
      animation: {
        duration: 1000, // 애니메이션 지속 시간 (밀리초)
        easingFunction: "easeInOutQuad", // 애니메이션 이징 함수
      },
    });
  }
};

export const resetPosition = (network: Network | null, isCasting: boolean) => {
  if (network && !isCasting) {
    fitNetworkToScreen(network);
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

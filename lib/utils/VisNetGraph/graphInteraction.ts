import { NetworkManager } from './NetworkManager';

export const zoomIn = function (this: NetworkManager) {
<<<<<<< HEAD
  this.startObservation();
=======
>>>>>>> 8bae9ddf76c0946f983be3ef8b2ca7d01303a923
  const network = this.getNetwork();
  const scale = network.getScale();
  network.moveTo({
    scale: scale * 1.2,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad',
    },
  });
<<<<<<< HEAD
  setTimeout(() => {
    this.stopObservation();
  }, 500);
};

export const zoomOut = function (this: NetworkManager) {
  this.startObservation();
=======
};

export const zoomOut = function (this: NetworkManager) {
>>>>>>> 8bae9ddf76c0946f983be3ef8b2ca7d01303a923
  const network = this.getNetwork();
  const scale = network.getScale();
  network.moveTo({
    scale: scale * 0.8,
    animation: {
      duration: 500,
      easingFunction: 'easeInOutQuad',
    },
  });
<<<<<<< HEAD
  setTimeout(() => {
    this.stopObservation();
  }, 500);
};

export const resetPosition = function (this: NetworkManager) {
  this.startObservation();
=======
};

export const resetPosition = function (this: NetworkManager) {
>>>>>>> 8bae9ddf76c0946f983be3ef8b2ca7d01303a923
  const network = this.getNetwork();
  network.fit({
    animation: {
      duration: 1000,
      easingFunction: 'easeInOutQuad',
    },
  });
<<<<<<< HEAD
  setTimeout(() => {
    this.stopObservation();
  }, 1000);
=======
>>>>>>> 8bae9ddf76c0946f983be3ef8b2ca7d01303a923
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
<<<<<<< HEAD
};
=======
};
>>>>>>> 8bae9ddf76c0946f983be3ef8b2ca7d01303a923

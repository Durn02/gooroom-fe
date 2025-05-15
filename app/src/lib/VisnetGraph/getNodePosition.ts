// getNodePosition.ts
import { IdType, Network, Position } from 'vis-network';
import { NetworkManager } from './NetworkManager';

const getPosition = (nodeId: IdType, network: Network): Position => {
  const canvasPosition = network.getPosition(nodeId);
  const domPosition = network.canvasToDOM(canvasPosition);
  return domPosition;
};

export const getLoggedInUserPosition = function (this: NetworkManager): Position {
  const loggedInUser = this.getLoggedInUser();
  const network = this.getNetwork();
  return getPosition(loggedInUser.nodeId as IdType, network);
};

export const getRoommatesPosition = function (this: NetworkManager): Position[] {
  const roommates = this.getRoommatesWithNeighbors();
  const network = this.getNetwork();
  return Array.from(roommates.keys()).map((roommateId) => {
    const position = getPosition(roommateId, network);
    return position;
  });
};

export const getRoommatesByNeighborsPositions = function (this: NetworkManager): { [x: string]: Position[] }[] {
  const neighbors = this.getNeighborsData();
  const network = this.getNetwork();
  return Array.from(
    neighbors.keys().map((neighbor) => {
      const connectedRoommates = network.getConnectedNodes(neighbor) as IdType[];
      const connectedRoommatesPositions = connectedRoommates.map((connnectedRoommate) => {
        return getPosition(connnectedRoommate, network);
      });
      return { [neighbor]: connectedRoommatesPositions };
    }),
  );
};

// getNodePosition.ts
import { IdType, Network, Position } from 'vis-network';
import { NetworkManager } from './NetworkManager';

const getPosition = (node_id: IdType, network: Network): Position => {
  const canvasPosition = network.getPosition(node_id);
  const domPosition = network.canvasToDOM(canvasPosition);
  return domPosition;
};

export const getLoggedInUserPosition = function (this: NetworkManager): Position {
  const loggedInUser = this.getLoggedInUser();
  const network = this.getNetwork();
  return getPosition(loggedInUser.node_id as IdType, network);
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

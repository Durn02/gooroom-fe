import { NetworkManager } from './NetworkManager';
import { IdType, Network, Position } from 'vis-network';

const getPosition = (node_id: IdType, network: Network): Position => {
  const canvasPosition = network.getPosition(node_id);
  const domPosition = network.canvasToDOM(canvasPosition);
  return domPosition;
};

export const getLoggedInUserPosition = function (this: NetworkManager): Position {
  const loggedInUser = this.getLoggeInUser();
  const network = this.getNetwork();
  return getPosition(loggedInUser.node_id as IdType, network);
};

export const getRoommatesPosition = function (this: NetworkManager): Position[] {
  const roommates = this.getRoommatesData();
  const network = this.getNetwork();
  return roommates.map((roommate) => {
    const position = getPosition(roommate.roommate.node_id, network);
    return position;
  });
};

export const getRoommatesByNeighborsPositions = function (this: NetworkManager): { [x: string]: Position[] }[] {
  const neighbors = this.getNeighborsata();
  const network = this.getNetwork();
  return neighbors.map((neighbor) => {
    const connectedRoommates = network.getConnectedNodes(neighbor.node_id) as IdType[];
    const connectedRoommatesPositions = connectedRoommates.map((connnectedRoommate) => {
      return getPosition(connnectedRoommate, network);
    });
    return { [neighbor.node_id]: connectedRoommatesPositions };
  });
};

import { Network, IdType } from "vis-network";
import { RoomMateData, User } from "../types/landingPage.type";
import style from "../pages/landingpage/LandingPage.module.css";
import gsap from "gsap";
import { softenGraph, enableGraphInteraction } from "./graphInteraction";
const getPosition = (node_id: IdType, network: Network | null) => {
  if (!network) {
    console.error("error in getPosition. there's no networkInstance.current");
    return;
  }

  const canvasPosition = network.getPosition(node_id);
  const domPosition = network.canvasToDOM(canvasPosition);
  return domPosition;
};

export const castAnimation = (
  network: Network | null,
  networkContainer: HTMLDivElement | null,
  loggedInUserNodeId: string | undefined,
  roommatesData: RoomMateData[],
  neighborsData: User[]
) => {
  if (!network) {
    console.error("error in castAnimation. there's no network");
    return;
  }

  const scale = network.getScale();
  const alignOffset = 5 * scale;

  if (!networkContainer) {
    console.error("error in castAnimation. there's no network");
    return;
  }

  const loggedInUserPosition = getPosition(
    loggedInUserNodeId as IdType,
    network
  );
  if (!loggedInUserPosition) {
    console.error("error in castAnimation. there's no loggedInUserPosition");
    return;
  }

  const roommatesPositions = roommatesData
    .map((roommate) => {
      const position = getPosition(roommate.roommate.node_id, network);
      return position || null;
    })
    .filter((position) => position !== null);

  const roommatesByNeighborsPositions = neighborsData.map((neighbor) => {
    const connectedRoommates = network?.getConnectedNodes(
      neighbor.node_id
    ) as IdType[];
    const connectedRoommatesPositions = connectedRoommates.map(
      (connnectedRoommate) => {
        return getPosition(connnectedRoommate, network);
      }
    );
    return { [neighbor.node_id]: connectedRoommatesPositions };
  });

  const runFirstAnimation = (onComplete: () => void) => {
    let animationsCompleted = 0;

    roommatesPositions.forEach((roommatePos) => {
      if (roommatePos && loggedInUserPosition) {
        const element = document.createElement("span");
        element.classList.add(style.blinkingElement);
        networkContainer.appendChild(element);

        element.style.left = `${loggedInUserPosition.x - alignOffset}px`;
        element.style.top = `${loggedInUserPosition.y - alignOffset}px`;

        element.style.width = `${10 * scale}px`;
        element.style.height = `${10 * scale}px`;

        gsap.fromTo(
          element,
          { x: 0, y: 0 },
          {
            x: roommatePos.x - loggedInUserPosition.x,
            y: roommatePos.y - loggedInUserPosition.y,
            duration: 2,
            ease: "power1.inOut",
            onComplete: () => {
              networkContainer.removeChild(element);
              animationsCompleted += 1;
              if (animationsCompleted === roommatesPositions.length) {
                onComplete();
              }
            },
          }
        );
      }
    });
  };

  const runSecondAnimation = () => {
    roommatesByNeighborsPositions.forEach((roommatesByNeighborPos, index) => {
      const [[neighborId, connectedRoommates]] = Object.entries(
        roommatesByNeighborPos
      );
      const neighborPosition = getPosition(neighborId, network);

      connectedRoommates.forEach((connectedRoommate) => {
        if (neighborPosition && connectedRoommate) {
          const element = document.createElement("span");
          element.classList.add(style.blinkingElement);
          networkContainer.appendChild(element);

          element.style.width = `${10 * scale}px`;
          element.style.height = `${10 * scale}px`;

          element.style.left = `${connectedRoommate.x - alignOffset}px`;
          element.style.top = `${connectedRoommate.y - alignOffset}px`;

          gsap.fromTo(
            element,
            { x: 0, y: 0 },
            {
              x: neighborPosition.x - connectedRoommate.x,
              y: neighborPosition.y - connectedRoommate.y,
              duration: 2,
              ease: "power1.inOut",
              onComplete: () => {
                networkContainer.removeChild(element);
                if (index === roommatesByNeighborsPositions.length - 1) {
                  enableGraphInteraction(network);
                  softenGraph(network);
                }
              },
            }
          );
        }
      });
    });
  };

  runFirstAnimation(runSecondAnimation);
};

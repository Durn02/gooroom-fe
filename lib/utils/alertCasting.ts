import { DataSet } from "vis-data";
import { Node, IdType } from "vis-network";
import getAPIURL from "./getAPIURL";
import { GetCastsResponse } from "../types/landingPage.type";

const castsToAlert: GetCastsResponse[] = [];
export const fetchUnreadCasts = async (nodesDataset: DataSet<Node>) => {
  const APIURL = getAPIURL();
  try {
    const response = await fetch(
      `${APIURL}/domain/content/cast/get-unread-members`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.contents.length > 0) {
        castsToAlert.push(...data.contents);
        castsToAlert.forEach(async (cast) => {
          alertCast(nodesDataset, cast.creator.node_id);
        });
      }
    }
  } catch (error) {
    console.error("error: ", error);
  }
};

const alertCast = (nodesDataset: DataSet<Node>, node_id: IdType) => {
  const originalSize = nodesDataset.get(node_id)?.size || 10;
  let growing = true;
  let newOpacity = 1;
  let newSize = originalSize;

  const interval = setInterval(() => {
    newOpacity = growing ? newOpacity - 0.1 : newOpacity + 0.1;
    newSize = growing ? newSize + 0.2 : newSize - 0.2;

    if (newOpacity < 0.4) {
      growing = false;
    }
    if (newOpacity >= 1) {
      growing = true;
    }

    nodesDataset.update({
      id: node_id,
      size: newSize,
      opacity: newOpacity,
    });
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    nodesDataset.update({
      id: node_id,
      size: originalSize,
      opacity: 1,
    });
  }, 2800);
};

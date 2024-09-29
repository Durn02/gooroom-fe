import { DataSet } from "vis-data";
import { Node, IdType } from "vis-network";
import getAPIURL from "./getAPIURL";
import { GetCastsResponse } from "../types/landingPage.type";

const castsToAlert: GetCastsResponse[] = [];
// let isFetching = false;

export const fetchUnreadCasts = async (nodesDataset: DataSet<Node>) => {
  console.log("fetchUnreadCasts is called");
  //   if (isFetching) {
  //     console.log("now fetching is doing");
  //     return;
  //   } // 이미 호출 중이면 중단
  //   isFetching = true;
  const APIURL = getAPIURL();
  try {
    console.log("trying fetchUnreadCasts");
    const response = await fetch(
      `${APIURL}/domain/content/cast/get-unread-members`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );
    if (response.ok) {
      console.log("fetchUnreadCasts response ok");
      const data = await response.json();
      if (data.contents.length > 0) {
        castsToAlert.push(...data.contents);
        console.log("data: ", data);
        castsToAlert.forEach(async (cast) => {
          console.log("here is cast : ", cast);
          alertCast(nodesDataset, cast.creator.node_id);
        });
      }
    }
  } catch (error) {
    console.log("there's error");
    console.error("error: ", error);
  } finally {
    // isFetching = false; // 호출이 완료되면 상태 초기화
  }
};

const alertCast = (nodesDataset: DataSet<Node>, node_id: IdType) => {
  const originalSize = nodesDataset.get(node_id)?.size ?? 5;
  let growing = true;
  let newSize = originalSize;

  const interval = setInterval(() => {
    newSize = growing ? newSize + 2 : newSize - 2;
    if (newSize >= originalSize + 10) growing = false;
    if (newSize <= originalSize) growing = true;

    nodesDataset.update({ id: node_id, size: newSize });
  }, 100);

  setTimeout(() => {
    console.log("setTimeout called");
    clearInterval(interval);
    nodesDataset.update({ id: node_id, size: originalSize });
  }, 2000);
};

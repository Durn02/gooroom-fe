import { DataSet } from 'vis-data';
import { Node } from 'vis-network';
import { GetCastsResponse } from '../types/landingPage.type';
import { API_URL } from '@/lib/utils/config';

const unreadCasts: GetCastsResponse[] = [];

const alertFrameInterval = 100;
const alertDuration = 5600;
const alertInterval = 10000;

export const fetchUnreadCasts = async (nodesDataset: DataSet) => {
  // const APIURL = getAPIURL();
  try {
    const response = await fetch(`${API_URL}/domain/content/cast/get-unread-members`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      if (data.contents.length > 0) {
        unreadCasts.push(...data.contents);
        alertUnreadCast(nodesDataset);
      }
    }
    setTimeout(() => {
      long_poll(nodesDataset);
    }, alertInterval);
  } catch (error) {
    console.error('error: ', error);
    setTimeout(() => {
      fetchUnreadCasts(nodesDataset);
    }, alertInterval);
  }
};

const long_poll = async (nodesDataset: DataSet) => {
  console.log('long_poll called');

  // const APIURL = getAPIURL();
  try {
    const response = await fetch(`${API_URL}/domain/content/cast/get-unsent-members`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('long_poll data : ', data);
      if (data.contents.length > 0) {
        unreadCasts.push(...data.contents);

        // const unsendCasts: GetCastsResponse[] = [];
        // unsendCasts.push(...data.contents);
        // alertNewCasts(nodesDataset, unsendCasts);
      }
      setTimeout(() => long_poll(nodesDataset), alertInterval);
    }
  } catch (error) {
    console.error('Error during long polling: ', error);
    setTimeout(() => long_poll(nodesDataset), alertInterval);
  }
};

const alertUnreadCast = (nodesDataset: DataSet) => {
  unreadCasts.forEach(async (cast) => {
    const node_id = cast.creator.node_id;
    const originalNodeProps = nodesDataset.get(node_id);
    const originalSize = originalNodeProps?.group == 'neighbor' ? 10 : 15;

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
    }, alertFrameInterval);

    setTimeout(() => {
      clearInterval(interval);
    }, alertDuration);
  });

  setTimeout(() => {
    alertUnreadCast(nodesDataset);
  }, alertInterval);
};

// const alertNewCasts = (
//   nodesDataset: DataSet<Node>,
//   new_casts: GetCastsResponse[]
// ) => {
//   new_casts.forEach((cast) => {
//     const node_id = cast.creator.node_id;
//     const originalNodeProps = nodesDataset.get(node_id);
//     let newX =
//     let onBoundary = false;
//     if(!newX) return;
//     const newMass = 10;
//     const interval = setInterval(() => {
//       newX = onBoundary ? newX - 0.1 : newX + 0.1;

//       if (newX < 0.4) {
//         onBoundary = false;
//       }
//       if (newX >= 1) {
//         onBoundary = true;
//       }

//       nodesDataset.update({
//         id: node_id,
//         mass: newMass,
//         opacity: newOpacity,
//       });
//     }, alertFrameInterval);

//     setTimeout(() => {
//       clearInterval(interval);
//     }, alertDuration);
//   });
// };

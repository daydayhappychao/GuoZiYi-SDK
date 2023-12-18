import { EventTrack } from "./EventTrack";
import {
  SessionStorageKeys,
  sessionstorageUtils,
} from "./utils/sessionstorage";

export const saveCurrentRoute = (eventTrack: EventTrack<any>) => {
  let firstLocation = window.location;
  eventTrack.route(firstLocation.pathname, firstLocation.search);
};

export const initHistoryListener = (eventTrack: EventTrack<any>) => {
  let history = eventTrack.history;
  history.listen(({ location }) => {
    eventTrack.route(location.pathname, location.search);
  });
};

export const initRouteEvent = (eventTrack: EventTrack<any>) => {
  const session = eventTrack.getSession();
  sessionstorageUtils.setItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK, {
    ...session,
    routes: [],
  });
  saveCurrentRoute(eventTrack);
  initHistoryListener(eventTrack);
};

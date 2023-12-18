import axios from "axios";
import {
  SessionStorageKeys,
  sessionstorageUtils,
} from "./utils/sessionstorage";
import { initRouteEvent, saveCurrentRoute } from "./routeEvent";
import { BrowserHistory } from "history";
import { getParsedUrl } from "./utils/parseUrl";

export class EventTrack<EventNames extends string> {
  constructor(
    private serverUrl: string,
    private routeList: string[],
    public history: BrowserHistory
  ) {
    if (serverUrl.endsWith("/")) {
      this.serverUrl = serverUrl.slice(0, -1);
    }
    this.handleVisibleChange();
    initRouteEvent(this);
  }
  publishCount = 30;
  private recording = false;
  private token = "";
  private username = "";
  private heartbeartTimer: NodeJS.Timeout | undefined;

  private handleVisibleChange = () => {
    document.addEventListener("visibilitychange", () => {
      if (this.recording) {
        if (document.visibilityState === "hidden") {
          const { routes, token } = this.getSession();
          if (routes) {
            routes[routes?.length - 1].leaveTime = new Date().valueOf();
          }

          const data = { routes, uuid: token };
          const headers = {
            type: "application/json",
          };
          const blob = new Blob([JSON.stringify(data)], headers);
          navigator.sendBeacon("/eventTrack/offline", blob);
        } else {
          const session = this.getSession();
          sessionstorageUtils.setItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK, {
            ...session,
            routes: [],
          });
          saveCurrentRoute(this);
        }
      }
    });
  };
  private genarateToken = async () => {
    const session = this.getSession();

    const { data } = await axios.post(`${this.serverUrl}/eventTrack/token`, {
      username: this.username,
    });
    const nextToken = data.data;
    sessionstorageUtils.setItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK, {
      ...session,
      token: nextToken,
    });
    return nextToken;
  };
  getSession = () => {
    return sessionstorageUtils.getItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK)!;
  };
  /** 初始化用户名后开始上传数据 */
  startRecord = async (username: string) => {
    this.username = username;
    if (this.heartbeartTimer) {
      clearTimeout(this.heartbeartTimer);
    }
    const session = this.getSession();
    const sessionToken = session?.token;
    if (sessionToken) {
      this.token = sessionToken;
    } else {
      this.token = await this.genarateToken();
    }
    this.recording = true;
    this.heartbeat();
  };
  action = (eventName: EventNames, extraData: string | Object) => {
    const session = this.getSession();
    sessionstorageUtils.setItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK, {
      ...session,
      events: [...(session?.events || []), { eventName, extraData }],
    });
  };
  /** 路由状态监控 */
  route = (pathname: string, search: string) => {
    const url = `${pathname}${search}`;
    const session = this.getSession();
    const { routes } = session;
    const nextRoutes = [...(routes || [])];
    const now = new Date().valueOf();
    const preRoute = nextRoutes[nextRoutes.length - 1];
    if (preRoute && preRoute.commingTime === preRoute.leaveTime) {
      preRoute.leaveTime = now;
    }
    const { route, searchObj } = getParsedUrl(this.routeList, pathname, search);
    nextRoutes.push({
      url,
      route: route || "",
      pathname,
      searchObj,
      commingTime: now,
      leaveTime: now,
    });
    sessionstorageUtils.setItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK, {
      ...session,
      routes: nextRoutes,
    });
    return now;
  };

  private heartbeat = async () => {
    const { data } = await axios.get(
      `/eventTrack/heartbeat?token=${this.token}`
    );
    if (data.code !== 0) {
      this.token = await this.genarateToken();
    }
    this.heartbeartTimer = setTimeout(this.heartbeat, 10 * 1000);
  };
}

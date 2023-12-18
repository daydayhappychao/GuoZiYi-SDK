export enum SessionStorageKeys {
  GUOZIYI_EVENT_TRACK = "GUOZIYI_EVENT_TRACK",
}

export interface IGUOYIZI_EVENT_TRACK_ROUTE {
  url: string;
  route: string;
  pathname: string;
  searchObj: Record<string, string>;
  commingTime: number;
  leaveTime: number;
}

export interface IGUOYIZI_EVENT_TRACK_TYPE {
  token?: string;
  lastPublishIndex: number;
  routes?: IGUOYIZI_EVENT_TRACK_ROUTE[];
  events?: {
    eventName: string;
    extraData: string | Object;
  }[];
}

export interface SessionStorageData {
  [SessionStorageKeys.GUOZIYI_EVENT_TRACK]: IGUOYIZI_EVENT_TRACK_TYPE;
}

// sessionstorage utils class
class SessionstorageUtils {
  constructor() {
    if (!this.getItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK)) {
      this.setItem(SessionStorageKeys.GUOZIYI_EVENT_TRACK, {
        lastPublishIndex: 0,
      });
    }
  }
  // get item from localstorage
  getItem<T extends SessionStorageKeys>(
    key: T
  ): SessionStorageData[T] | undefined {
    const data = sessionStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    } else {
      return undefined;
    }
  }

  // set item to localstorage
  setItem<T extends SessionStorageKeys>(key: T, value: SessionStorageData[T]) {
    const data = JSON.stringify(value);
    sessionStorage.setItem(key, data);
  }

  // remove item from localstorage
  removeItem(key: SessionStorageKeys) {
    sessionStorage.removeItem(key);
  }

  // clear localstorage
  clear() {
    sessionStorage.clear();
  }
}

export const sessionstorageUtils = new SessionstorageUtils();

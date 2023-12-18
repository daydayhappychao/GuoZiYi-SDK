import qs from "qs";

export const getQueryObject = (queryString: string) => {
  let _queryString = queryString;
  if (queryString.indexOf("?") > -1) {
    _queryString = queryString.substr(queryString.indexOf("?") + 1);
  }
  return qs.parse(_queryString);
};

export const getParsedUrl = (
  routePathArr: string[],
  pathname: string,
  search: string
) => {
  const searchObj = getQueryObject(search) as Record<string, string>;
  const pathNameArr = pathname.split("/");
  let patternRoute: string | undefined;
  for (let routePathItem of routePathArr) {
    const routePathItemArr = routePathItem.split("/");
    if (
      pathNameArr.length !== routePathItemArr.length ||
      !routePathItemArr.every(
        (v, index) => v.startsWith(":") || v === pathNameArr[index]
      )
    ) {
      continue;
    } else {
      patternRoute = routePathItem;
      break;
    }
  }
  return {
    route: patternRoute,
    pathname,
    search,
    searchObj,
  };
};

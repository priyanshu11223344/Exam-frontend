import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ignoredRoutes = new Set(["/", "/login", "/signup", "/redirect"]);

const RouteMemory = () => {
  const location = useLocation();

  useEffect(() => {
    if (ignoredRoutes.has(location.pathname)) return;
    sessionStorage.setItem(
      "lastRoute",
      `${location.pathname}${location.search}${location.hash}`
    );
  }, [location]);

  return null;
};

export default RouteMemory;

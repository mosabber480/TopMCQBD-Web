import { onRequest as __api_questions_free_js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\api\\questions\\free.js"
import { onRequest as __api_categories_js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\api\\categories.js"
import { onRequest as __api_db_check_js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\api\\db-check.js"
import { onRequest as __api_home_config_js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\api\\home-config.js"
import { onRequest as __api_layout_config_js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\api\\layout-config.js"
import { onRequest as __api_sidebar_config_js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\api\\sidebar-config.js"
import { onRequest as __api___route___js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\api\\[[route]].js"
import { onRequest as ___middleware_js_onRequest } from "C:\\Users\\Mosabber\\Downloads\\Mosabber\\TopMCQBD-Web\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/questions/free",
      mountPath: "/api/questions",
      method: "",
      middlewares: [],
      modules: [__api_questions_free_js_onRequest],
    },
  {
      routePath: "/api/categories",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_categories_js_onRequest],
    },
  {
      routePath: "/api/db-check",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_db_check_js_onRequest],
    },
  {
      routePath: "/api/home-config",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_home_config_js_onRequest],
    },
  {
      routePath: "/api/layout-config",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_layout_config_js_onRequest],
    },
  {
      routePath: "/api/sidebar-config",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_sidebar_config_js_onRequest],
    },
  {
      routePath: "/api/:route*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___route___js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]
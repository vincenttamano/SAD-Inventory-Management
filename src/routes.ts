import { createHashRouter } from "react-router-dom";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Analytics } from "./components/Analytics";
import { PatientUsage } from "./components/PatientUsage";
import { Usage } from "./components/Usage";
import { Layout } from "./components/Layout";
import { PatientManagement } from "./components/PatientManagement";

export const router = createHashRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "inventory", Component: Inventory },
      { path: "usage", Component: Usage },
      { path: "analytics", Component: Analytics },
      { path: "patient-usage", Component: PatientUsage },
      { path: "patient-management", Component: PatientManagement },
    ],
  },
]);
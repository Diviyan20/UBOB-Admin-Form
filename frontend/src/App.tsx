import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import AdminLoginForm from "./views/forms/AdminLoginForm";
import ConfigurationForm from "./views/forms/ConfigurationForm";
import OutletDashboard from "./views/dashboards/OutletDashboard";
import OutletScreenConfiguration from "./views/dashboards/OutletScreenConfiguration";
import MediaLibrary from "./views/dashboards/MediaLibrary";
import MenuBar from "./components/menu/MenuComponent";

function AdminLayout() {
  return (
    <>
      <MenuBar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />}></Route>
        <Route path="/login" element={<AdminLoginForm />}></Route>
        <Route element={<AdminLayout />}>
          <Route path="/configuration" element={<ConfigurationForm />}></Route>
          <Route path="/outlet-dashboard" element={<OutletDashboard />}></Route>
          <Route
            path="/outlet-screen"
            element={<OutletScreenConfiguration />}
          ></Route>
          <Route path="/media-library" element={<MediaLibrary />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

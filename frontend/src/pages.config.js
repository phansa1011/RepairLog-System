import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Worker from './pages/Worker.jsx';
import Locations from './pages/Locations.jsx';
import LocationDetail from './pages/LocationDetail.jsx';
import Devices from './pages/Devices.jsx';
import Parts from './pages/Parts.jsx';
import Repairs from './pages/Repairs.jsx';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Login": Login,
    "Dashboard": Dashboard,
    "Worker": Worker,
    "Locations": Locations,
    "LocationDetail": LocationDetail,
    "Devices": Devices,
    "Parts": Parts,
    "Repairs": Repairs,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
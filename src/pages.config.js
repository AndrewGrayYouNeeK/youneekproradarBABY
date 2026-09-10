import Radar from './pages/Radar';
import Globe from './pages/Globe';
import Forecast from './pages/Forecast';
import Explore from './pages/Explore';
import Storms from './pages/Storms';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';

export const PAGES = {
    "Radar": Radar,
    "Globe": Globe,
    "Forecast": Forecast,
    "Explore": Explore,
    "Storms": Storms,
    "Contacts": Contacts,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Radar",
    Pages: PAGES,
};

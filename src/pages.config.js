import Radar from './pages/Radar';
import Forecast from './pages/Forecast';
import Alerts from './pages/Alerts';
import Radio from './pages/Radio';
import Safety from './pages/Safety';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';

export const PAGES = {
    "Radar": Radar,
    "Forecast": Forecast,
    "Alerts": Alerts,
    "Radio": Radio,
    "Safety": Safety,
    "Contacts": Contacts,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Radar",
    Pages: PAGES,
};
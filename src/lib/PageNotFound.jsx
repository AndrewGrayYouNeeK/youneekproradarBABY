import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1) || "this page";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md text-center">
        <p className="text-7xl font-light text-slate-600">404</p>
        <div className="mx-auto mt-2 h-0.5 w-16 bg-white/10" />
        <h1 className="mt-6 text-2xl font-medium text-white">Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          <span className="font-medium text-slate-200">{pageName}</span> is not a route in YouNeeK Pro Radar.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/Radar"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950"
          >
            Open Radar
          </Link>
          <Link to="/landing" className="text-sm text-slate-400 hover:text-white">
            Back to welcome
          </Link>
        </div>
      </div>
    </div>
  );
}

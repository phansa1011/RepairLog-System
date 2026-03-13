import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils/index";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, MapPin, Monitor, Wrench, Package, LogOut, Menu, X
} from "lucide-react";

const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "พนักงาน", page: "Worker", icon: Users },
  { label: "สถานที่", page: "Locations", icon: MapPin },
  { label: "อุปกรณ์", page: "Devices", icon: Monitor },
  { label: "อะไหล่", page: "Parts", icon: Package },
  { label: "การซ่อม", page: "Repairs", icon: Wrench },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate(createPageUrl("Login"), { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const loginTime = Number(sessionStorage.getItem("loginTime"));

    if (loginTime) {
      const now = Date.now();
      const diff = now - loginTime;

      const threeHours = 8 * 60 * 60 * 1000;

      // ถ้าเกิน 3 ชั่วโมงแล้ว
      if (diff > threeHours) {
        sessionStorage.clear();
        navigate(createPageUrl("Login"), { replace: true });
      } else {

        // ตั้ง timer logout อัตโนมัติ
        const remainingTime = threeHours - diff;

        const timer = setTimeout(() => {
          sessionStorage.clear();
          navigate(createPageUrl("Login"), { replace: true });
        }, remainingTime);

        return () => clearTimeout(timer);
      }
    }
  }, [navigate]);

  const isLoginPage = currentPageName === "Login";

  if (isLoginPage) {
    return <div className="min-h-screen w-full flex min-w-0 items-center justify-center bg-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <style>{`
        :root {
          --accent: #F5E87C;
          --accent-light: #FFFBE8;
          --accent-border: #EDD93A;
        }
        body { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <Wrench className="w-4 h-4 text-gray-800" />
            </div>
            <span className="font-semibold text-gray-900 text-sm tracking-tight">RepairLog</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ label, page, icon: Icon }) => {
              const active = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
                    ? "text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  style={active ? { background: "var(--accent)" } : {}}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("loginTime");
                navigate(createPageUrl("Login"), { replace: true });
              }}
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {navItems.map(({ label, page, icon: Icon }) => {
              const active = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "text-gray-900" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  style={active ? { background: "var(--accent)" } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("loginTime");
                navigate(createPageUrl("Login"), { replace: true });
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="pt-16 min-h-screen w-full overflow-x-hidden">
        <div className="w-full max-w-full px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
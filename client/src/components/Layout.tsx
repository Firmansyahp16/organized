import { Link } from "@tanstack/react-router";
import { useLogout } from "../hooks/auth.hook";
import { useRef, useState, useEffect } from "react";
import { SessionCountdown } from "./ExpiredAt";
import { DraggableButton } from "./DraggableMenu";

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  const { mutate: logout } = useLogout();
  const drawerToggleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [menuHeightClass, setMenuHeightClass] = useState("h-screen");
  const [hideMenu, setHideMenu] = useState(false);

  useEffect(() => {
    const updateHeight = () => {
      if (!menuRef.current || !contentRef.current) return;
      const contentHeight = contentRef.current.offsetHeight;
      const screenHeight = window.innerHeight;
      setMenuHeightClass(contentHeight > screenHeight ? "h-full" : "h-screen");
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [children]);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-base-300">
        <div className="drawer lg:drawer-open">
          <input
            type="checkbox"
            name="my-drawer"
            className="drawer-toggle"
            ref={drawerToggleRef}
          />
          <div
            className="drawer-content flex flex-col gap-3 p-2 min-h-screen"
            ref={contentRef}
          >
            {children}
          </div>

          <div className="drawer-side">
            {/* drawer overlay bawaan DIHILANGKAN */}
            <div
              ref={menuRef}
              className={`menu bg-base-300 w-80 flex flex-col ${menuHeightClass}`}
            >
              <div className="bg-base-100 h-full p-2 rounded-lg shadow-lg overflow-y-auto font-bold">
                <div className="relative w-full p-2 mt-3">
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                    <h1 className="text-2xl font-bold">Organized</h1>
                  </div>
                </div>

                {/* Daftar menu */}
                <div className="border-t border-base-300 mt-4" />
                <ul className="flex flex-col gap-2 mt-2">
                  <li>
                    <Link to="/">Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/branch">Branches</Link>
                  </li>
                  <li>
                    <Link to="/events">Events</Link>
                  </li>
                  <li>
                    <Link to="/calendars">Calendars</Link>
                  </li>
                  <li>
                    <Link to="/users">Users</Link>
                  </li>
                </ul>

                <br />
                <hr />
                <br />
                <SessionCountdown />
                <li>
                  <button
                    className="btn btn-error text-white font-bold w-full"
                    onClick={() => logout()}
                  >
                    Logout
                  </button>
                </li>
              </div>
            </div>
          </div>
        </div>
        {hideMenu === true && (
          <div className="fixed top-1/2 left-80 -translate-y-1/2 z-50 lg:hidden">
            <button
              className="btn btn-circle bg-base-100 btn-md hover:btn-primary hover:text-black"
              onClick={() => {
                setHideMenu(false);
                drawerToggleRef.current?.click();
              }}
              title="Hide menu"
            >
              ⭅
            </button>
          </div>
        )}
        {hideMenu === false && (
          <DraggableButton
            onClick={() => {
              setHideMenu(true);
              drawerToggleRef.current?.click();
            }}
          />
        )}
      </div>
    </>
  );
}

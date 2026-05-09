import React from "react";
import Sidebar from "../components/layout/Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

const DashboardLayout = () => {
  const opened = false;
  const toggle = () => {};
  const authLoading = false;
  const isPending = false;

  return (
    <>
      {authLoading || isPending ? (
        <div
          className={
            "min-h-screen flex items-center justify-center bg-slate-100"
          }
        ></div>
      ) : (
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <div className="w-20 md:w-64 flex-shrink-0">
            <Sidebar opened={opened} toggle={toggle} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col custom-scrollbar overflow-y-auto bg-[#1A1A23]">
            {/* Topbar */}
            <div className="px-6 sticky top-0 z-50 mb-2">
              <div className="pt-4 bg-[#1A1A23]">
                <Navbar opened={opened} toggle={toggle} />
              </div>
            </div>

            <div className="flex-1 p-6">
              <Outlet />
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardLayout;

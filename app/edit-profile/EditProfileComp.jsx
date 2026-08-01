"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../dashboard/DashboardLayout";
import EditProfile from "./EditProfilePage";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";

export default function EditProfileComp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);
  }, []);

  if (isLoggedIn) {
    return (
      <DashboardLayout>
        <EditProfile />
      </DashboardLayout>
    );
  }

  return (
    <>
      <Navbar />
      <EditProfile />
      <Footer />
    </>
  );
}

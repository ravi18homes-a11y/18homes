"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../COMMON/Navbar';
import Footer from '../COMMON/Footer';
import RealEstateApp from './RealEstateApp';
import DashboardLayout from '../dashboard/DashboardLayout';

export const SellComponent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setIsLoggedIn(true);
  }, []);

  if (isLoggedIn) {
    return (
      <DashboardLayout>
        <RealEstateApp />
      </DashboardLayout>
    );
  }

  return (
    <>
      <Navbar />
      <RealEstateApp />
      <Footer />
    </>
  );
};

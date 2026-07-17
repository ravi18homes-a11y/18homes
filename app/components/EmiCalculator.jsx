"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Info,
  Download,
  Printer,
  Calendar,
  Percent,
  TrendingUp,
  Coins,
  ChevronDown,
  ChevronUp,
  Calculator,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Helper to format numbers in the Indian Currency system (e.g. 50,00,000)
const formatIndianCurrency = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "";
  const parts = Math.round(num).toString().split(".");
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherBits = parts[0].substring(0, parts[0].length - 3);
  if (otherBits !== "") {
    lastThree = "," + lastThree;
  }
  const res = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return parts.length > 1 ? res + "." + parts[1] : "₹" + res;
};

// Helper to parse currency string back to number
const parseCurrencyToNumber = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;

  const str = val.toString().toLowerCase().trim();

  // Extract numerical value including decimal
  const match = str.match(/[\d.]+/);
  if (!match) return 0;

  const num = parseFloat(match[0]);
  if (isNaN(num)) return 0;

  // Apply Indian real estate price multipliers (Crore / Lakh)
  if (str.includes("cr") || str.includes("crore") || str.includes("crores")) {
    return Math.round(num * 10000000);
  }
  if (str.includes("lac") || str.includes("lacs") || str.includes("lakh") || str.includes("lakhs")) {
    return Math.round(num * 100000);
  }
  // Fallback: If it's a small number like 85 and it's from propertyPrice prop, it might be Lacs,
  // but if the user typed it, it's just raw. For safety, return raw number.
  return num;
};

// Helper to calculate progress percentage and return range slider style
const getSliderBackground = (value, min, max) => {
  if (min === max) return { background: "#e5e7eb" };
  const percentage = ((value - min) / (max - min)) * 100;
  return {
    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
  };
};

export default function EmiCalculator({ propertyPrice = 0 }) {
  // Mounting check to prevent SSR hydration mismatches with Recharts
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Standard or Advanced mode (Property Price + Down Payment vs Direct Loan Amount)
  const [isPropertyMode, setIsPropertyMode] = useState(!!propertyPrice);

  // States
  const [inputPropertyPrice, setInputPropertyPrice] = useState(propertyPrice || 5000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // 20% default
  const [downPaymentVal, setDownPaymentVal] = useState(1000000); // 20% of 50 Lac

  // Raw loan amount state (used in Direct Mode, or calculated in Property Mode)
  const [directLoanAmount, setDirectLoanAmount] = useState(4000000);

  const [roi, setRoi] = useState(8.5); // 8.5% default (standard home loan)
  const [tenure, setTenure] = useState(20); // 20 years default
  const [tenureType, setTenureType] = useState("years"); // "years" or "months"

  // Prepayment States (Advanced)
  const [monthlyPrepayment, setMonthlyPrepayment] = useState(0);
  const [annualPrepayment, setAnnualPrepayment] = useState(0);
  const [processingFeePercent, setProcessingFeePercent] = useState(1); // 1% default

  // Input Text & Focus States (UX Improvements to prevent formatting jumps and stop-at-comma parsing bugs)
  const [propertyPriceText, setPropertyPriceText] = useState("");
  const [isPropertyPriceFocused, setIsPropertyPriceFocused] = useState(false);
  useEffect(() => {
    if (!isPropertyPriceFocused) {
      setPropertyPriceText(formatIndianCurrency(inputPropertyPrice));
    }
  }, [inputPropertyPrice, isPropertyPriceFocused]);

  const [downPaymentValText, setDownPaymentValText] = useState("");
  const [isDownPaymentValFocused, setIsDownPaymentValFocused] = useState(false);
  useEffect(() => {
    if (!isDownPaymentValFocused) {
      setDownPaymentValText(formatIndianCurrency(downPaymentVal));
    }
  }, [downPaymentVal, isDownPaymentValFocused]);

  const [directLoanAmountText, setDirectLoanAmountText] = useState("");
  const [isDirectLoanAmountFocused, setIsDirectLoanAmountFocused] = useState(false);
  useEffect(() => {
    if (!isDirectLoanAmountFocused) {
      setDirectLoanAmountText(formatIndianCurrency(directLoanAmount));
    }
  }, [directLoanAmount, isDirectLoanAmountFocused]);

  const [monthlyPrepaymentText, setMonthlyPrepaymentText] = useState("");
  const [isMonthlyPrepaymentFocused, setIsMonthlyPrepaymentFocused] = useState(false);
  useEffect(() => {
    if (!isMonthlyPrepaymentFocused) {
      setMonthlyPrepaymentText(monthlyPrepayment ? formatIndianCurrency(monthlyPrepayment) : "");
    }
  }, [monthlyPrepayment, isMonthlyPrepaymentFocused]);

  const [annualPrepaymentText, setAnnualPrepaymentText] = useState("");
  const [isAnnualPrepaymentFocused, setIsAnnualPrepaymentFocused] = useState(false);
  useEffect(() => {
    if (!isAnnualPrepaymentFocused) {
      setAnnualPrepaymentText(annualPrepayment ? formatIndianCurrency(annualPrepayment) : "");
    }
  }, [annualPrepayment, isAnnualPrepaymentFocused]);

  // Synchronize Property Price and Down Payment
  useEffect(() => {
    if (propertyPrice) {
      // Ensure we extract a clean number if propertyPrice is string
      const parsedPrice = typeof propertyPrice === "string" ? parseCurrencyToNumber(propertyPrice) : Number(propertyPrice);
      if (parsedPrice > 0) {
        setInputPropertyPrice(parsedPrice);
        const calculatedDP = Math.round((parsedPrice * downPaymentPercent) / 100);
        setDownPaymentVal(calculatedDP);
        setIsPropertyMode(true);
      }
    }
  }, [propertyPrice]);

  // Handle Property Price changes
  const handlePropertyPriceChange = (val) => {
    const num = parseCurrencyToNumber(val);
    setInputPropertyPrice(num);
    const calculatedDP = Math.round((num * downPaymentPercent) / 100);
    setDownPaymentVal(calculatedDP);
  };

  // Handle Down Payment Value changes
  const handleDownPaymentValChange = (val) => {
    const num = parseCurrencyToNumber(val);
    setDownPaymentVal(num);
    if (inputPropertyPrice > 0) {
      const pct = Math.min(100, Math.max(0, (num / inputPropertyPrice) * 100));
      setDownPaymentPercent(parseFloat(pct.toFixed(2)));
    }
  };

  // Handle Down Payment Percentage changes
  const handleDownPaymentPercentChange = (pct) => {
    const numericPct = parseFloat(pct) || 0;
    setDownPaymentPercent(numericPct);
    const calculatedDP = Math.round((inputPropertyPrice * numericPct) / 100);
    setDownPaymentVal(calculatedDP);
  };

  // Active Loan Amount
  const loanAmount = useMemo(() => {
    if (isPropertyMode) {
      return Math.max(0, inputPropertyPrice - downPaymentVal);
    }
    return directLoanAmount;
  }, [isPropertyMode, inputPropertyPrice, downPaymentVal, directLoanAmount]);

  // Tenure in months
  const totalMonths = useMemo(() => {
    return tenureType === "years" ? tenure * 12 : tenure;
  }, [tenure, tenureType]);

  // Math Calculations (Basic + Advanced with Amortization)
  const calculations = useMemo(() => {
    const P = loanAmount;
    const r = roi / (12 * 100);
    const n = totalMonths;

    if (P <= 0 || r < 0 || n <= 0) {
      return {
        emi: 0,
        totalInterest: 0,
        totalPayment: 0,
        schedule: [],
        hasPrepayment: false,
        prepaidSchedule: [],
        prepaidTotalInterest: 0,
        prepaidTotalPayment: 0,
        monthsSaved: 0,
        interestSaved: 0,
      };
    }

    // 1. Calculate Standard EMI
    const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const standardTotalPayment = emi * n;
    const standardTotalInterest = standardTotalPayment - P;

    // 2. Generate Standard Amortization Schedule (Yearly + Monthly)
    let balance = P;
    const schedule = [];
    let cumInterest = 0;
    let cumPrincipal = 0;

    for (let m = 1; m <= n; m++) {
      const interestThisMonth = balance * r;
      const principalThisMonth = Math.min(emi - interestThisMonth, balance);
      balance = Math.max(0, balance - principalThisMonth);

      cumInterest += interestThisMonth;
      cumPrincipal += principalThisMonth;

      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        emiPaid: interestThisMonth + principalThisMonth,
        interestPaid: interestThisMonth,
        principalPaid: principalThisMonth,
        prepayment: 0,
        balanceOutstanding: balance,
        cumInterest,
        cumPrincipal,
      });
    }

    // 3. Amortization with Prepayments
    let prepBalance = P;
    const prepaidSchedule = [];
    let prepCumInterest = 0;
    let prepCumPrincipal = 0;
    let prepMonths = 0;
    const hasPrepayment = monthlyPrepayment > 0 || annualPrepayment > 0;

    if (hasPrepayment) {
      let m = 1;
      // Loop safety to avoid infinite loops, max 600 months (50 years)
      while (prepBalance > 0 && m <= 600) {
        const interestThisMonth = prepBalance * r;
        // Standard expected payment
        let principalThisMonth = Math.min(emi - interestThisMonth, prepBalance);

        // Add monthly prepayment and check if it's the annual month (every 12th month)
        const isAnnualMonth = m % 12 === 0;
        const currentPrepay = monthlyPrepayment + (isAnnualMonth ? annualPrepayment : 0);
        const actualPrepayment = Math.min(currentPrepay, prepBalance - principalThisMonth);

        prepBalance = Math.max(0, prepBalance - principalThisMonth - actualPrepayment);

        prepCumInterest += interestThisMonth;
        prepCumPrincipal += (principalThisMonth + actualPrepayment);

        prepaidSchedule.push({
          month: m,
          year: Math.ceil(m / 12),
          emiPaid: interestThisMonth + principalThisMonth,
          interestPaid: interestThisMonth,
          principalPaid: principalThisMonth,
          prepayment: actualPrepayment,
          balanceOutstanding: prepBalance,
          cumInterest: prepCumInterest,
          cumPrincipal: prepCumPrincipal,
        });

        if (prepBalance <= 0) {
          prepMonths = m;
          break;
        }
        m++;
      }
    }

    const prepaidTotalPayment = prepCumPrincipal + prepCumInterest;
    const prepaidTotalInterest = prepCumInterest;
    const monthsSaved = hasPrepayment ? Math.max(0, n - prepMonths) : 0;
    const interestSaved = hasPrepayment ? Math.max(0, standardTotalInterest - prepaidTotalInterest) : 0;

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(standardTotalInterest),
      totalPayment: Math.round(standardTotalPayment),
      schedule,
      hasPrepayment,
      prepaidSchedule,
      prepaidTotalInterest: Math.round(prepaidTotalInterest),
      prepaidTotalPayment: Math.round(prepaidTotalPayment),
      monthsSaved,
      interestSaved: Math.round(interestSaved),
      actualMonthsCount: hasPrepayment ? prepMonths : n,
    };
  }, [loanAmount, roi, totalMonths, monthlyPrepayment, annualPrepayment]);

  // Processing Fee in Rupees
  const processingFeeVal = useMemo(() => {
    return Math.round((loanAmount * processingFeePercent) / 100);
  }, [loanAmount, processingFeePercent]);

  // React 19 Deferred Values to optimize heavy calculations and scheduling rendering during slider drag
  const deferredCalculations = React.useDeferredValue(calculations);
  const deferredLoanAmount = React.useDeferredValue(loanAmount);

  // Aggregate schedule to Yearly details (computed from deferredCalculations to prevent rendering block)
  const deferredYearlySchedule = useMemo(() => {
    const activeSchedule = deferredCalculations.hasPrepayment ? deferredCalculations.prepaidSchedule : deferredCalculations.schedule;
    const years = {};

    activeSchedule.forEach((m) => {
      const y = m.year;
      if (!years[y]) {
        years[y] = {
          year: y,
          emiPaid: 0,
          interestPaid: 0,
          principalPaid: 0,
          prepayment: 0,
          balanceOutstanding: 0,
          months: [],
        };
      }
      years[y].emiPaid += m.emiPaid;
      years[y].interestPaid += m.interestPaid;
      years[y].principalPaid += m.principalPaid;
      years[y].prepayment += m.prepayment;
      years[y].balanceOutstanding = m.balanceOutstanding; // Ending balance of the year
      years[y].months.push(m);
    });

    return Object.values(years);
  }, [deferredCalculations]);

  // Deferred Pie chart data
  const deferredPieData = useMemo(() => {
    const interest = deferredCalculations.hasPrepayment ? deferredCalculations.prepaidTotalInterest : deferredCalculations.totalInterest;
    return [
      { name: "Principal Amount", value: deferredLoanAmount, color: "#1e293b" }, // dark slate
      { name: "Interest Cost", value: interest, color: "#ef4444" }, // red-500
    ];
  }, [deferredLoanAmount, deferredCalculations]);

  // Amortization Schedule States
  const [scheduleView, setScheduleView] = useState("yearly"); // "yearly" or "monthly"
  const [expandedYear, setExpandedYear] = useState(null); // Which year is expanded in yearly view

  const toggleYearExpansion = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null);
    } else {
      setExpandedYear(year);
    }
  };

  // CSV download function (uses deferredCalculations for CSV generation)
  const handleDownloadCSV = () => {
    const activeSchedule = deferredCalculations.hasPrepayment ? deferredCalculations.prepaidSchedule : deferredCalculations.schedule;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Month,Year,EMI Paid,Principal Paid,Interest Paid,Prepayment,Balance Outstanding\n";

    activeSchedule.forEach((row) => {
      csvContent += `${row.month},${row.year},${row.emiPaid.toFixed(2)},${row.principalPaid.toFixed(2)},${row.interestPaid.toFixed(2)},${row.prepayment.toFixed(2)},${row.balanceOutstanding.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EMI_Amortization_Schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 w-full max-w-7xl mx-auto my-12 transition-all duration-300">

      {/* Component Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-500" /> Professional Calculator
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Real Estate <span className="text-red-600">EMI Calculator</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Calculate your monthly payment, interest breakdowns, and explore smart prepayments to save money.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-center">
          <button
            onClick={() => setIsPropertyMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isPropertyMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
          >
            Property Valuation
          </button>
          <button
            onClick={() => setIsPropertyMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!isPropertyMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
          >
            Direct Loan Amount
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* ================= LEFT SIDE: INPUT CONTROLS ================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Property Price & Down Payment Inputs (Only in Property Valuation Mode) */}
          {isPropertyMode && (
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-5">
              {/* Property Price */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                    Property Price
                  </label>
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                    <input
                      type="text"
                      value={isPropertyPriceFocused ? propertyPriceText : formatIndianCurrency(inputPropertyPrice)}
                      onFocus={() => {
                        setIsPropertyPriceFocused(true);
                        setPropertyPriceText(inputPropertyPrice.toString());
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPropertyPriceText(val);
                        const num = parseCurrencyToNumber(val);
                        handlePropertyPriceChange(num);
                      }}
                      onBlur={() => {
                        setIsPropertyPriceFocused(false);
                        setPropertyPriceText(formatIndianCurrency(inputPropertyPrice));
                      }}
                      className="w-36 text-right font-bold text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="150000000"
                  step="100000"
                  value={inputPropertyPrice}
                  onChange={(e) => handlePropertyPriceChange(e.target.value)}
                  style={getSliderBackground(inputPropertyPrice, 500000, 150000000)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹5 Lac</span>
                  <span>₹15 Cr</span>
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <label className="text-sm font-bold text-gray-700">
                    Down Payment ({downPaymentPercent}%)
                  </label>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* DP Percentage Input */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm w-20">
                      <input
                        type="number"
                        min="0"
                        max="90"
                        step="0.5"
                        value={downPaymentPercent}
                        onChange={(e) => handleDownPaymentPercentChange(e.target.value)}
                        className="w-full text-right font-semibold text-gray-700 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-gray-400 text-xs ml-0.5">%</span>
                    </div>
                    {/* DP Value Input */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm w-36">
                      <input
                        type="text"
                        value={isDownPaymentValFocused ? downPaymentValText : formatIndianCurrency(downPaymentVal)}
                        onFocus={() => {
                          setIsDownPaymentValFocused(true);
                          setDownPaymentValText(downPaymentVal.toString());
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDownPaymentValText(val);
                          const num = parseCurrencyToNumber(val);
                          handleDownPaymentValChange(num);
                        }}
                        onBlur={() => {
                          setIsDownPaymentValFocused(false);
                          setDownPaymentValText(formatIndianCurrency(downPaymentVal));
                        }}
                        className="w-full text-right font-bold text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={inputPropertyPrice}
                  step="50000"
                  value={downPaymentVal}
                  onChange={(e) => handleDownPaymentValChange(e.target.value)}
                  style={getSliderBackground(downPaymentVal, 0, inputPropertyPrice || 1)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹0</span>
                  <span>{formatIndianCurrency(inputPropertyPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Direct Loan Amount Input */}
          {!isPropertyMode && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700">
                  Loan Amount (Principal)
                </label>
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <input
                    type="text"
                    value={isDirectLoanAmountFocused ? directLoanAmountText : formatIndianCurrency(directLoanAmount)}
                    onFocus={() => {
                      setIsDirectLoanAmountFocused(true);
                      setDirectLoanAmountText(directLoanAmount.toString());
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDirectLoanAmountText(val);
                      const num = parseCurrencyToNumber(val);
                      setDirectLoanAmount(num);
                    }}
                    onBlur={() => {
                      setIsDirectLoanAmountFocused(false);
                      setDirectLoanAmountText(formatIndianCurrency(directLoanAmount));
                    }}
                    className="w-36 text-right font-bold text-gray-800 focus:outline-none"
                  />
                </div>
              </div>
              <input
                type="range"
                min="100000"
                max="100000000"
                step="50000"
                value={directLoanAmount}
                onChange={(e) => setDirectLoanAmount(Number(e.target.value))}
                style={getSliderBackground(directLoanAmount, 100000, 100000000)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹1 Lac</span>
                <span>₹10 Cr</span>
              </div>
            </div>
          )}

          {/* Calculated Loan Indicator (If in Property Mode) */}
          {isPropertyMode && (
            <div className="flex items-center justify-between p-3.5 bg-red-50/50 border border-red-100 rounded-xl text-sm">
              <span className="text-gray-600 font-medium">Computed Net Loan Required:</span>
              <span className="font-extrabold text-red-600 text-base">{formatIndianCurrency(loanAmount)}</span>
            </div>
          )}

          {/* 3. Interest Rate (ROI) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                Interest Rate (R.O.I. P.A.)
                <span className="text-gray-400 group relative cursor-pointer">
                  <Info className="w-4 h-4" />
                  <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded-lg -top-12 left-1/2 -translate-x-1/2 w-48 z-10 text-center shadow-lg">
                    Annual Rate of Interest charged by bank.
                  </span>
                </span>
              </label>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm w-28">
                <input
                  type="number"
                  min="5"
                  max="20"
                  step="0.05"
                  value={roi}
                  onChange={(e) => setRoi(parseFloat(e.target.value) || 0)}
                  className="w-full text-right font-bold text-gray-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-400 font-bold ml-1">%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.05"
              value={roi}
              onChange={(e) => setRoi(parseFloat(e.target.value))}
              style={getSliderBackground(roi, 5, 20)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5% p.a.</span>
              <span>20% p.a.</span>
            </div>
          </div>

          {/* 4. Tenure (Duration) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-700">
                Loan Tenure ({tenureType === "years" ? "Years" : "Months"})
              </label>
              <div className="flex items-center gap-2">
                {/* Tenure Switcher */}
                <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => {
                      if (tenureType === "months") {
                        setTenureType("years");
                        setTenure(Math.max(1, Math.round(tenure / 12)));
                      }
                    }}
                    className={`px-2 py-1 rounded-md font-semibold transition-all ${tenureType === "years" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                      }`}
                  >
                    Yr
                  </button>
                  <button
                    onClick={() => {
                      if (tenureType === "years") {
                        setTenureType("months");
                        setTenure(tenure * 12);
                      }
                    }}
                    className={`px-2 py-1 rounded-md font-semibold transition-all ${tenureType === "months" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400"
                      }`}
                  >
                    Mo
                  </button>
                </div>

                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm w-24">
                  <input
                    type="number"
                    min="1"
                    max={tenureType === "years" ? 30 : 360}
                    value={tenure}
                    onChange={(e) => setTenure(parseInt(e.target.value) || 0)}
                    className="w-full text-right font-bold text-gray-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max={tenureType === "years" ? 30 : 360}
              step="1"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              style={getSliderBackground(tenure, 1, tenureType === "years" ? 30 : 360)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 {tenureType}</span>
              <span>{tenureType === "years" ? 30 : 360} {tenureType}</span>
            </div>
          </div>

          {/* 5. Prepayments & Processing Fees (ADVANCED DRAWER) */}
          {/* <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-4">
            <h4 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-red-600" /> Advanced Options (Save Interest)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Monthly Prepayment (Rs.)
                </label>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                  <input
                    type="text"
                    placeholder="e.g. ₹5,000"
                    value={monthlyPrepayment ? formatIndianCurrency(monthlyPrepayment) : ""}
                    onChange={(e) => setMonthlyPrepayment(parseCurrencyToNumber(e.target.value))}
                    className="w-full text-sm font-semibold text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

            
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  One-time Annual Prepayment (Rs.)
                </label>
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000"
                    value={annualPrepayment ? formatIndianCurrency(annualPrepayment) : ""}
                    onChange={(e) => setAnnualPrepayment(parseCurrencyToNumber(e.target.value))}
                    className="w-full text-sm font-semibold text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

            
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-600">
                    Est. Processing Fee ({processingFeePercent}%)
                  </label>
                  <span className="text-xs font-semibold text-gray-500">
                    {formatIndianCurrency(processingFeeVal)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={processingFeePercent}
                    onChange={(e) => setProcessingFeePercent(parseFloat(e.target.value))}
                    style={getSliderBackground(processingFeePercent, 0, 5)}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={processingFeePercent}
                    onChange={(e) => setProcessingFeePercent(parseFloat(e.target.value) || 0)}
                    className="w-12 text-center text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg py-0.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div> */}

        </div>

        {/* ================= RIGHT SIDE: DETAILED VISUALS & CHARTS ================= */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">

          {/* Main EMI Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-red-600 rounded-full blur-3xl opacity-20 pointer-events-none" />

            <div>
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Your Monthly Installment
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-black tracking-tight text-white">
                  {formatIndianCurrency(calculations.emi)}
                </span>
                <span className="text-slate-400 text-sm font-medium">/ month</span>
              </div>
            </div>

            {/* Calculations Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div>
                <span className="text-slate-400 text-xs block mb-0.5">Total Principal</span>
                <span className="text-sm font-bold text-slate-100">{formatIndianCurrency(loanAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block mb-0.5">Total Interest Cost</span>
                <span className="text-sm font-bold text-red-400">
                  {formatIndianCurrency(
                    calculations.hasPrepayment ? calculations.prepaidTotalInterest : calculations.totalInterest
                  )}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 text-xs block mb-0.5">Total Amount Payable</span>
                <span className="text-base font-extrabold text-white">
                  {formatIndianCurrency(
                    calculations.hasPrepayment ? calculations.prepaidTotalPayment : calculations.totalPayment
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Prepayment Highlights */}
          {calculations.hasPrepayment && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-extrabold text-green-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-green-600 animate-pulse" /> Prepayment Benefits Unlocked!
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                  <span className="text-gray-500 block mb-0.5">Tenure Reduction</span>
                  <span className="text-base font-extrabold text-green-600">
                    {Math.floor(calculations.monthsSaved / 12) > 0
                      ? `${Math.floor(calculations.monthsSaved / 12)} Yrs `
                      : ""}
                    {calculations.monthsSaved % 12} Mos Saved
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                  <span className="text-gray-500 block mb-0.5">Interest Saved</span>
                  <span className="text-base font-extrabold text-green-600">
                    {formatIndianCurrency(calculations.interestSaved)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Chart Container */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 flex flex-col items-center justify-center min-h-[240px]">
            {isMounted ? (
              <div className="w-full h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deferredPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {deferredPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatIndianCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Interest %</span>
                  <span className="text-base font-extrabold text-gray-800">
                    {deferredLoanAmount > 0
                      ? (
                        ((deferredCalculations.hasPrepayment ? deferredCalculations.prepaidTotalInterest : deferredCalculations.totalInterest) /
                          (deferredCalculations.hasPrepayment ? deferredCalculations.prepaidTotalPayment : deferredCalculations.totalPayment)) *
                        100
                      ).toFixed(1) + "%"
                      : "0%"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
              </div>
            )}

            {/* Custom Legend */}
            <div className="flex gap-6 mt-2 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-800" />
                <span className="text-gray-600">Principal: {deferredLoanAmount > 0 ? ((deferredLoanAmount / (deferredCalculations.hasPrepayment ? deferredCalculations.prepaidTotalPayment : deferredCalculations.totalPayment)) * 100).toFixed(0) + "%" : "0%"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">Interest: {deferredLoanAmount > 0 ? (((deferredCalculations.hasPrepayment ? deferredCalculations.prepaidTotalInterest : deferredCalculations.totalInterest) / (deferredCalculations.hasPrepayment ? deferredCalculations.prepaidTotalPayment : deferredCalculations.totalPayment)) * 100).toFixed(0) + "%" : "0%"}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= AMORTIZATION SCHEDULE SECTION ================= */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" /> Amortization Repayment Schedule
            </h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Year-wise or Month-wise breakdown of payments, principal reduction, and interest tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setScheduleView("yearly")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${scheduleView === "yearly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                Yearly View
              </button>
              <button
                onClick={() => setScheduleView("monthly")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${scheduleView === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                Monthly View
              </button>
            </div>

            {/* Print & CSV buttons */}
            <button
              onClick={handleDownloadCSV}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900 shadow-sm cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-900 shadow-sm cursor-pointer"
              title="Print Schedule"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Amortization Tables */}
        <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-inner max-h-[420px] overflow-y-auto print:max-h-none">
          {scheduleView === "yearly" ? (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-gray-100 text-gray-500 font-extrabold text-xs uppercase">
                  <th className="py-4 px-6">Year</th>
                  <th className="py-4 px-4 text-right">Principal Paid</th>
                  <th className="py-4 px-4 text-right">Interest Paid</th>
                  {calculations.hasPrepayment && <th className="py-4 px-4 text-right text-green-700">Prepayment</th>}
                  <th className="py-4 px-4 text-right">Total Paid</th>
                  <th className="py-4 px-6 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {deferredYearlySchedule.map((row) => (
                  <React.Fragment key={row.year}>
                    <tr
                      onClick={() => toggleYearExpansion(row.year)}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 flex items-center gap-2 font-bold text-gray-900">
                        {expandedYear === row.year ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                        Year {row.year}
                      </td>
                      <td className="py-4 px-4 text-right">{formatIndianCurrency(row.principalPaid)}</td>
                      <td className="py-4 px-4 text-right text-red-500">{formatIndianCurrency(row.interestPaid)}</td>
                      {calculations.hasPrepayment && (
                        <td className="py-4 px-4 text-right text-green-600 font-bold">
                          {row.prepayment > 0 ? formatIndianCurrency(row.prepayment) : "-"}
                        </td>
                      )}
                      <td className="py-4 px-4 text-right font-bold text-gray-800">
                        {formatIndianCurrency(row.emiPaid + row.prepayment)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900">
                        {formatIndianCurrency(row.balanceOutstanding)}
                      </td>
                    </tr>

                    {/* Expandable Monthly details within this year */}
                    {expandedYear === row.year && (
                      <tr className="bg-gray-50/30">
                        <td colSpan={calculations.hasPrepayment ? 6 : 5} className="p-0">
                          <div className="px-6 py-4 border-l-4 border-red-500 space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Monthly Breakdown (Year {row.year})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-xs text-gray-600">
                              {row.months.map((m) => (
                                <div
                                  key={m.month}
                                  className="flex justify-between py-1 border-b border-gray-100/50 last:border-b-0"
                                >
                                  <span className="font-bold text-gray-500">Month {m.month}</span>
                                  <div className="flex gap-4">
                                    <span>P: {formatIndianCurrency(m.principalPaid)}</span>
                                    <span className="text-red-500">I: {formatIndianCurrency(m.interestPaid)}</span>
                                    {m.prepayment > 0 && (
                                      <span className="text-green-600 font-bold">
                                        Prep: {formatIndianCurrency(m.prepayment)}
                                      </span>
                                    )}
                                    <span className="font-bold text-gray-800">
                                      Bal: {formatIndianCurrency(m.balanceOutstanding)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            // Monthly Schedule
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-gray-100 text-gray-500 font-extrabold text-xs uppercase">
                  <th className="py-4 px-6">Month</th>
                  <th className="py-4 px-4">Year</th>
                  <th className="py-4 px-4 text-right">Principal Paid</th>
                  <th className="py-4 px-4 text-right">Interest Paid</th>
                  {deferredCalculations.hasPrepayment && <th className="py-4 px-4 text-right text-green-700">Prepayment</th>}
                  <th className="py-4 px-4 text-right">Total Paid</th>
                  <th className="py-4 px-6 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium text-gray-700">
                {(deferredCalculations.hasPrepayment ? deferredCalculations.prepaidSchedule : deferredCalculations.schedule).map((row) => (
                  <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-6 font-bold text-gray-900">Month {row.month}</td>
                    <td className="py-3 px-4 text-gray-500 font-bold">Year {row.year}</td>
                    <td className="py-3 px-4 text-right">{formatIndianCurrency(row.principalPaid)}</td>
                    <td className="py-3 px-4 text-right text-red-500">{formatIndianCurrency(row.interestPaid)}</td>
                    {deferredCalculations.hasPrepayment && (
                      <td className="py-3 px-4 text-right text-green-600 font-bold">
                        {row.prepayment > 0 ? formatIndianCurrency(row.prepayment) : "-"}
                      </td>
                    )}
                    <td className="py-3 px-4 text-right font-bold text-gray-800">
                      {formatIndianCurrency(row.emiPaid + row.prepayment)}
                    </td>
                    <td className="py-3 px-6 text-right font-bold text-gray-900">
                      {formatIndianCurrency(row.balanceOutstanding)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

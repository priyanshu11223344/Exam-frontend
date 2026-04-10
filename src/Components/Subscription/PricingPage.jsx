import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

import { useDispatch, useSelector } from "react-redux";
import { fetchPlans } from '../../features/subscription_plans/planSlice'; 
import { fetchUser } from '../../features/user/userSlice';

import axios from "axios";                  // ✅ ADDED
import toast from "react-hot-toast";        // ✅ ADDED
import API from '../../api/axios';
import {useAuth} from "@clerk/react"
const PricingPage = () => {

  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.plans);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const { getToken } = useAuth();

  // 🔥 Fetch plans from backend
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // 🔥 Extract plans
  const freePlan = plans.find(p => p.name === "Free");
  const premiumPlan = plans.find(p => p.name === "Pro");

  // 🔥 Set default selected duration
  useEffect(() => {
    if (premiumPlan && premiumPlan.durations.length > 0) {
      setSelectedPlan(premiumPlan.durations[0]);
    }
  }, [premiumPlan]);

  // 🔥 Payment handler (UPDATED ONLY THIS LOGIC)
  const handlePayment = async (planId, durationLabel) => {
    try {
      const loadingToast = toast.loading("Processing payment...");
  
      // ✅ Fix closure issue
      const currentPlanId = planId;
      const currentDuration = durationLabel;
      const token = await getToken();
      // 🔥 1. Create order
      const { data } = await API.post("/payment/create-order", {
        planId: currentPlanId,
        duration: currentDuration,
        {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      });
  
      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Aurethia",
        description: `${premiumPlan?.name} Plan`,
        order_id: data.orderId,
  
        handler: async function (response) {
          try {
            // 🔥 2. VERIFY PAYMENT (FIXED)
            await API.post(
                "/payment/verify-payment",
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  planId: currentPlanId,
                  durationLabel: currentDuration,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
  
            toast.dismiss(loadingToast);
            toast.success("Payment successful 🎉");
  
            // 🔥 3. Refresh user
            await dispatch(fetchUser({ getToken }));
  
          } catch (err) {
            console.error(err);
            toast.dismiss(loadingToast);
            toast.error("Payment verification failed");
          }
        },
  
        prefill: {
          name: "User",
          email: "user@email.com",
        },
  
        theme: {
          color: "#6366f1",
        },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
  
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Try again.");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading plans...</div>;
  }
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-12 mt-16">
          <div className="max-w-5xl mx-auto text-center">
            <header className="mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Upgrade Your Prep
              </h2>
              <p className="text-lg text-slate-600">
                Unlock specialized MCQ tests and PDF resources for Aurethia.
              </p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              
              {/* Free Plan */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col transition-all hover:border-slate-300">
                <h3 className="text-xl font-semibold text-slate-800">Free</h3>
                <div className="my-6">
                  <span className="text-4xl font-bold">$0</span>
                </div>
                
                <ul className="text-left space-y-4 mb-8 flex-grow">
                  <li className="flex items-start text-slate-600 text-sm">
                    <CheckIcon className="text-green-500 mr-2 mt-0.5 shrink-0" /> 
                    <span>Access to topical past papers</span>
                  </li>
                  <li className="flex items-start text-slate-400 line-through text-sm">
                    <CrossIcon className="text-red-300 mr-2 mt-0.5 shrink-0" /> 
                    <span>MCQ quiz past paper test</span>
                  </li>
                  <li className="flex items-start text-slate-400 line-through text-sm">
                    <CrossIcon className="text-red-300 mr-2 mt-0.5 shrink-0" /> 
                    <span>Build PDFs</span>
                  </li>
                </ul>

                <button className="w-full py-3 px-6 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed">
                  Current Plan
                </button>
              </div>

              {/* Premium Plan */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-600 relative flex flex-col transform transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                  Best Value
                </div>
                
                <h3 className="text-xl font-semibold text-slate-800">Premium</h3>

                <div className="my-6">
                  <span className="text-4xl font-bold text-blue-600">
                    ${selectedPlan?.price || 0}
                  </span>
                  <span className="text-slate-500 ml-2 text-sm font-medium">
                    / {selectedPlan?.label || ""}
                  </span>
                </div>

                <div className="mb-8 group">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 text-left ml-1 tracking-wider">
                    Select Plan Duration
                  </label>

                  <select 
                    className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium text-slate-700"
                    onChange={(e) =>
                      setSelectedPlan(premiumPlan.durations[e.target.selectedIndex])
                    }
                  >
                    {premiumPlan?.durations.map((opt, idx) => (
                      <option key={idx} value={opt.price}>
                        {opt.label} - ${opt.price}
                      </option>
                    ))}
                  </select>
                </div>
                
                <ul className="text-left space-y-4 mb-8 flex-grow">
                  <li className="flex items-start text-slate-700 font-medium text-sm">
                    <CheckIcon className="text-blue-500 mr-2 mt-0.5 shrink-0" /> 
                    <span>Full access to topical papers</span>
                  </li>
                  <li className="flex items-start text-slate-700 font-medium text-sm">
                    <CheckIcon className="text-blue-500 mr-2 mt-0.5 shrink-0" /> 
                    <span>Full MCQ quiz database</span>
                  </li>
                  <li className="flex items-start text-slate-700 font-medium text-sm">
                    <CheckIcon className="text-blue-500 mr-2 mt-0.5 shrink-0" /> 
                    <span>Unlimited PDF Generation</span>
                  </li>
                </ul>

                <button 
                  onClick={() => handlePayment(premiumPlan?._id, selectedPlan?.label)}
                  className="w-full py-4 px-6 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Pay ${selectedPlan?.price || 0} & Upgrade
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const CheckIcon = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = ({ className }) => (
  <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default PricingPage;
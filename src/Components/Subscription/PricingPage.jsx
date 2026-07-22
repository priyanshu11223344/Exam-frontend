import React, { useEffect, useMemo, useState } from "react";
import { Check, Layers3 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth, useUser } from "@clerk/react";
import toast from "react-hot-toast";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import SearchableSelect from "../SearchableSelect";
import { fetchPlans } from "../../features/subscription_plans/planSlice";
import { fetchUser } from "../../features/user/userSlice";
import API from "../../api/axios";

const productCopy = {
  topical: "Topical questions for one exam board.",
  test_series: "Dated test series for a board and selected subjects.",
  complete: "Topical questions and the complete test-series workspace.",
  topical_builder: "Topical questions plus custom PDF test building.",
  legacy: "Full Aurethia learning access.",
};

const PricingPage = () => {
  const dispatch = useDispatch();
  const { plans, loading } = useSelector((state) => state.plans);
  const { getToken } = useAuth();
  const { user } = useUser();
  const [boards, setBoards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [board, setBoard] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [durations, setDurations] = useState({});
  const [processingPlan, setProcessingPlan] = useState("");

  useEffect(() => {
    dispatch(fetchPlans());
    API.get("/boards").then((response) => setBoards(response.data.data || [])).catch(() => {});
  }, [dispatch]);

  const activeProducts = useMemo(() => plans.filter((plan) => plan.productType !== "legacy" || plans.length === 1), [plans]);

  const changeBoard = async (value) => {
    setBoard(value);
    setSelectedSubjects([]);
    const selected = boards.find((item) => item.name === value);
    if (!selected) return setSubjects([]);
    const response = await API.get(`/subjects/board/${selected._id}`);
    setSubjects(response.data.data || []);
  };

  const buyPlan = async (plan) => {
    const duration = durations[plan._id] || plan.durations?.[0]?.label;
    const purchaseScope = { board, subjects: selectedSubjects };
    setProcessingPlan(plan._id);
    const notice = toast.loading("Preparing secure checkout...");
    try {
      const token = await getToken();
      const { data } = await API.post("/payment/create-order", {
        planId: plan._id,
        duration,
        purchaseScope,
        user: { clerkId: user?.id, name: user?.fullName || user?.firstName, email: user?.primaryEmailAddress?.emailAddress },
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (data.localPaymentBypass) {
        await dispatch(fetchUser({ getToken, clerkUser: user }));
        toast.success("Plan activated", { id: notice });
        return;
      }
      if (!window.Razorpay) throw new Error("Payment checkout could not load.");
      const checkout = new window.Razorpay({
        key: data.key, amount: data.amount, currency: "INR", name: "Aurethia",
        description: `${plan.name} · ${duration}`, order_id: data.orderId,
        prefill: { name: user?.fullName || "", email: user?.primaryEmailAddress?.emailAddress || "" },
        handler: async (payment) => {
          await API.post("/payment/verify-payment", {
            ...payment, planId: plan._id, durationLabel: duration, purchaseScope,
          }, { headers: { Authorization: `Bearer ${token}` } });
          await dispatch(fetchUser({ getToken, clerkUser: user }));
          toast.success("Payment successful", { id: notice });
        },
        modal: { ondismiss: () => toast.dismiss(notice) },
        theme: { color: "#4f46e5" },
      });
      checkout.open();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Payment failed", { id: notice });
    } finally {
      setProcessingPlan("");
    }
  };

  return <div className="flex min-h-screen bg-slate-50"><Sidebar /><div className="min-w-0 flex-1 md:ml-64"><Navbar /><main className="mx-auto max-w-7xl p-6 pt-28 md:p-12 md:pt-28">
    <div className="text-center"><p className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600">Four ways to learn</p><h1 className="mt-3 text-4xl font-black">Choose your Aurethia workspace</h1><p className="mx-auto mt-3 max-w-2xl text-slate-500">Your board and subject selection becomes part of the entitlement, so every dashboard stays focused and secure.</p></div>
    <div className="mx-auto mt-10 grid max-w-3xl gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2"><SearchableSelect label="Exam board" value={board} onChange={changeBoard} placeholder="Select board" options={boards.map((item) => [item.name, item.name])} /><SearchableSelect label="Subjects" value={selectedSubjects} onChange={setSelectedSubjects} placeholder={board ? "Select one or more" : "Select board first"} options={subjects.map((item) => [item.name, item.name])} disabled={!board} multiple /></div>
    {loading ? <p className="mt-12 text-center">Loading plans...</p> : <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{activeProducts.map((plan) => { const selectedDuration = plan.durations?.find((item) => item.label === durations[plan._id]) || plan.durations?.[0]; return <article key={plan._id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Layers3 /></div><p className="mt-5 text-xs font-black uppercase tracking-widest text-indigo-600">{plan.productType?.replaceAll("_", " ")}</p><h2 className="mt-2 text-xl font-black">{plan.name}</h2><p className="mt-2 min-h-12 text-sm text-slate-500">{productCopy[plan.productType] || productCopy.legacy}</p><ul className="mt-5 space-y-2">{(plan.features || []).map((feature) => <li key={feature} className="flex gap-2 text-sm font-semibold text-slate-600"><Check size={16} className="text-emerald-500" />{feature.replaceAll("_", " ")}</li>)}</ul><div className="mt-auto pt-6"><SearchableSelect value={selectedDuration?.label || ""} onChange={(value) => setDurations({ ...durations, [plan._id]: value })} options={(plan.durations || []).map((item) => [item.label, `${item.label} · ₹${item.price}`])} /><p className="mt-4 text-3xl font-black">₹{selectedDuration?.price || 0}</p><button disabled={processingPlan === plan._id} onClick={() => buyPlan(plan)} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:bg-slate-300">{processingPlan === plan._id ? "Opening..." : "Choose plan"}</button></div></article>; })}</div>}
  </main></div></div>;
};

export default PricingPage;

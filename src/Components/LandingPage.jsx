/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  Menu, 
  X, 
  GraduationCap, 
  ShieldCheck, 
  Zap,
  Users,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from "@clerk/react";
import logo from "../assets/Aurethia_logo.avif"
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ];
  const {user, isSignedIn, isLoaded } = useUser();
  const role = user?.publicMetadata?.role;
  console.log("role is",role);
  const navigate=useNavigate();
  return (
   
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div >
            <img src={logo} alt="Aurethia Logo" className="w-15 h-15" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-slate-900">Aurethia</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
            {/* 🔥 AUTH LOGIC */}
            {!isLoaded ? null : !isSignedIn ? (
              <button
                onClick={() => navigate("/login")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md"
              >
                Login
              </button>
            ) : (
              <UserButton
                afterSignOutUrl="/login"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-4 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              {/* 🔥 MOBILE AUTH */}
              <div className="pt-4 px-3">
                {!isSignedIn ? (
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold shadow-md"
                  >
                    Login
                  </button>
                ) : (
                  <div className="flex justify-center">
                    <UserButton afterSignOutUrl="/login" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
        <Icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  );

export default function LandingPage() {
    const navigate=useNavigate();
  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-6 border border-indigo-100">
                <Zap className="w-4 h-4" />
                Trusted by 50,000+ Students Worldwide
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                Master Your Exams with <span className="text-indigo-600">Confidence</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                The all-in-one platform for students to practice, track progress, and achieve top grades. Personalized learning paths powered by AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={()=>{
                    navigate("/home")
                }} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                  Start Practicing Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-0.5 active:scale-95">
                  View Demo
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-20 relative"
            >
              <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-100 aspect-video max-w-5xl">
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=2070" 
                  alt="Exam App Dashboard" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 md:top-10 md:-left-12 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Score Improvement</p>
                    <p className="text-lg font-bold text-slate-900">+42%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -right-6 md:bottom-10 md:-right-12 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Active Students</p>
                    <p className="text-lg font-bold text-slate-900">12.5k+</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-4">Why Choose Us</h2>
            <p className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Everything you need to succeed</p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform is designed by educators and top-performing students to provide the most effective study experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BookOpen}
              title="Smart Study Material"
              description="Access curated notes, flashcards, and summaries for over 500+ subjects and competitive exams."
              delay={0.1}
            />
            <FeatureCard 
              icon={Clock}
              title="Timed Mock Tests"
              description="Practice in a real exam environment with our advanced timer and distraction-free interface."
              delay={0.2}
            />
            <FeatureCard 
              icon={BarChart3}
              title="Deep Analytics"
              description="Identify your weak areas with detailed performance reports and topic-wise breakdown."
              delay={0.3}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Verified Content"
              description="All questions and answers are verified by subject matter experts to ensure 100% accuracy."
              delay={0.4}
            />
            <FeatureCard 
              icon={Users}
              title="Community Support"
              description="Join study groups and discuss difficult problems with thousands of fellow aspirants."
              delay={0.5}
            />
            <FeatureCard 
              icon={Zap}
              title="AI-Powered Insights"
              description="Get personalized recommendations on what to study next based on your previous performance."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-slate-900 mb-8">How it works</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Choose Your Goal', desc: 'Select the exam or subject you want to master from our extensive library.' },
                  { step: '02', title: 'Practice & Learn', desc: 'Take mock tests, solve previous year papers, and use our smart flashcards.' },
                  { step: '03', title: 'Analyze Progress', desc: 'Get instant feedback and see your performance improve over time.' },
                  { step: '04', title: 'Ace Your Exam', desc: 'Walk into the exam hall with confidence and achieve your dream score.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-100">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="bg-indigo-600 rounded-[3rem] p-8 lg:p-12 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-inner">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="font-bold text-slate-900">Current Performance</h4>
                    <span className="text-indigo-600 font-bold">84%</span>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Mathematics', value: 92, color: 'bg-green-500' },
                      { label: 'Physics', value: 78, color: 'bg-indigo-500' },
                      { label: 'Chemistry', value: 65, color: 'bg-amber-500' },
                      { label: 'Biology', value: 88, color: 'bg-blue-500' },
                    ].map((stat, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 font-medium">{stat.label}</span>
                          <span className="text-slate-900 font-bold">{stat.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${stat.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={`h-full ${stat.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-8 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                    View Full Report
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Ready to transform your <br className="hidden md:block" /> study experience?
              </h2>
              <p className="text-indigo-100 text-xl mb-12 max-w-2xl mx-auto">
                Join thousands of students who are already using Aurethia to achieve their academic goals. Start your 7-day free trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 active:scale-95 shadow-xl">
                  Get Started for Free
                </button>
                <button className="w-full sm:w-auto bg-indigo-500/30 text-white border border-indigo-400/30 hover:bg-indigo-500/50 px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 active:scale-95">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold font-display tracking-tight text-white">Aurethia</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empowering students with the tools and confidence to excel in every exam they take.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Mock Tests</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Updates</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2026 Aurethia Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

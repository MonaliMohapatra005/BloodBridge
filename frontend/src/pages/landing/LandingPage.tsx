import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ALL_BLOOD_GROUPS,
  BloodGroup,
  getCompatibleDonorsForPatient,
  getEligiblePatientGroupsForDonor,
} from '../../lib/bloodCompatibility';
import {
  Droplet,
  Heart,
  Shield,
  Activity,
  MapPin,
  Clock,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Compass,
  Zap,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero interactive blood selector state
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup>('O+');

  // Matrix interactive view toggle ('recipient' | 'donor')
  const [matrixMode, setMatrixMode] = useState<'recipient' | 'donor'>('recipient');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const compatibleDonors = getCompatibleDonorsForPatient(selectedBloodGroup);
  const eligibleRecipients = getEligiblePatientGroupsForDonor(selectedBloodGroup);

  const faqs = [
    {
      q: 'How does BloodBridge connect patients with emergency donors?',
      a: 'When an emergency request is created with the patient’s hospital location and blood type, BloodBridge immediately analyzes medical RBC compatibility and road distances using OSRM routing. It broadcasts real-time WebSocket alerts to nearby verified donors, establishing both a primary responder and backup reserves within minutes.',
    },
    {
      q: 'Is BloodBridge free to use?',
      a: 'Yes, 100% free and peer-to-peer. BloodBridge is a humanitarian emergency technology platform created to eliminate middleman delays, prevent blood shortages, and connect donors directly with hospital emergencies without any fees.',
    },
    {
      q: 'What is the difference between Primary and Backup donors?',
      a: 'To guarantee that a critical patient receives blood even if traffic or emergencies cause delays, BloodBridge pools respondents into Primary Donors (dispatched immediately to the hospital) and Backup Donors (on standby). If a primary donor cannot arrive, the highest-ranking backup is automatically promoted.',
    },
    {
      q: 'How is donor location and privacy protected?',
      a: 'Donor coordinates are used solely to calculate travel distance and ETA to the hospital. Exact addresses and personal numbers are never displayed publicly on an open directory; they are only shared in the secure, authenticated emergency room chat once a donor confirms participation.',
    },
    {
      q: 'How often can a healthy donor donate whole blood?',
      a: 'Medical guidelines recommend waiting at least 90 days (3 months) between whole blood donations to allow your red blood cell count and iron levels to fully regenerate. BloodBridge tracks this cooldown automatically and allows you to toggle your readiness anytime.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#17212B] flex flex-col selection:bg-blood-700 selection:text-white">
      {/* 1. TOP EMERGENCY RIBBON */}
      <div className="bg-gradient-to-r from-blood-800 via-blood-700 to-blood-900 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center flex items-center justify-center gap-2 shadow-sm">
        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
        <span className="font-bold tracking-wide uppercase text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
          Live Emergency Network
        </span>
        <span className="hidden sm:inline">
          Immediate Geolocation-Driven Blood Matching &bull; Zero Middleman Delays
        </span>
        <span className="sm:hidden">Immediate Peer-to-Peer Blood Matching</span>
      </div>

      {/* 2. STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-blood-700 flex items-center justify-center text-white shadow-md shadow-blood-700/30 group-hover:scale-105 transition-transform duration-200">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#17212B] leading-none">
                Blood<span className="text-blood-700">Bridge</span>
              </span>
              <span className="text-[10px] font-bold text-[#73808C] tracking-widest uppercase mt-0.5">
                Emergency Network
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#505D68]">
            <a href="#how-it-works" className="hover:text-blood-700 transition-colors">
              How It Works
            </a>
            <a href="#compatibility" className="hover:text-blood-700 transition-colors">
              Compatibility Matrix
            </a>
            <a href="#preview" className="hover:text-blood-700 transition-colors">
              Live Coordination
            </a>
            <a href="#features" className="hover:text-blood-700 transition-colors">
              Platform Features
            </a>
            <a href="#faq" className="hover:text-blood-700 transition-colors">
              FAQs
            </a>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3.5">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-bold text-[#17212B]">{user.fullName}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Blood Group {user.bloodGroup}
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blood-700 hover:bg-blood-800 text-white font-bold text-sm shadow-md shadow-blood-700/25 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#17212B] hover:text-blood-700 hover:bg-slate-100/80 transition-all"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm"
                >
                  Join as Donor
                </Link>

                <Link
                  to="/requests/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blood-700 hover:bg-blood-800 shadow-md shadow-blood-700/25 transition-all hover:-translate-y-0.5"
                >
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span>Request Blood</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-[#17212B] hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-5 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-3 font-semibold text-[#17212B] pt-2">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-blood-700 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#compatibility"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-blood-700 transition-colors"
              >
                Compatibility Matrix
              </a>
              <a
                href="#preview"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-blood-700 transition-colors"
              >
                Live Coordination
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-blood-700 transition-colors"
              >
                Platform Features
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-blood-700 transition-colors"
              >
                Frequently Asked Questions
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-blood-700 text-white font-bold text-center text-sm shadow-md shadow-blood-700/25 flex items-center justify-center gap-2"
                >
                  <span>Open Emergency Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/requests/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-xl bg-blood-700 text-white font-bold text-center text-sm shadow-md shadow-blood-700/25 flex items-center justify-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Emergency Blood Request</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-center text-sm"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-center text-sm"
                    >
                      Register Donor
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blood-50/70 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline and Call-To-Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 border border-blood-200 text-blood-700 text-xs sm:text-sm font-bold tracking-tight">
                <Sparkles className="w-4 h-4 text-blood-600" />
                <span>Next-Generation Healthcare Lifeline</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#17212B] tracking-tight leading-[1.15]">
                When Seconds Count, <br className="hidden sm:inline" />
                <span className="text-blood-700 relative">
                  BloodBridge
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-blood-300 -z-10"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10, 100 5"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
                </span>{' '}
                Connects Lives.
              </h1>

              <p className="text-base sm:text-lg text-[#505D68] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                An intelligent emergency blood coordination network matching critical hospital
                requests with nearby, medically verified donors in real time. Accurate road ETAs,
                instant multi-donor pooling, and zero middleman delay.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  to="/requests/create"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-blood-700 hover:bg-blood-800 text-white font-extrabold text-base shadow-xl shadow-blood-700/30 flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
                >
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span>Create Emergency Request</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-[#17212B] font-bold text-base border-2 border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-center gap-2.5 transition-all"
                >
                  <Heart className="w-5 h-5 text-blood-600 fill-blood-100" />
                  <span>Join as Community Donor</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm font-semibold text-[#73808C]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>100% Peer-to-Peer & Free</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified ABO & RhD Matching</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time OSRM Travel ETAs</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Blood Compatibility Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative">
                {/* Floating Badge */}
                <div className="absolute -top-3.5 right-6 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                  Interactive Matcher
                </div>

                <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blood-100 text-blood-700 flex items-center justify-center font-black">
                    <Droplet className="w-5 h-5 fill-blood-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#17212B]">
                      Check Blood Compatibility
                    </h3>
                    <p className="text-xs text-[#73808C]">
                      Select your blood group to view immediate medical match rules:
                    </p>
                  </div>
                </div>

                {/* Blood Group Selector Chips */}
                <div className="py-5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                    Select Blood Type:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ALL_BLOOD_GROUPS.map((group) => {
                      const isSelected = selectedBloodGroup === group;
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => setSelectedBloodGroup(group)}
                          className={`py-2.5 rounded-xl font-black text-sm transition-all duration-150 flex items-center justify-center ${
                            isSelected
                              ? 'bg-blood-700 text-white shadow-md shadow-blood-700/30 scale-105'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {group}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Match Results Display */}
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span>Who Can Donate To Patient ({selectedBloodGroup}):</span>
                      <span className="text-emerald-700 font-extrabold">
                        {compatibleDonors.length} Compatible Types
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {compatibleDonors.map((bg) => (
                        <span
                          key={bg}
                          className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200"
                        >
                          {bg}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                      <span>If You Donate as ({selectedBloodGroup}), You Can Save:</span>
                      <span className="text-blood-700 font-extrabold">
                        {eligibleRecipients.length} Recipient Types
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {eligibleRecipients.map((bg) => (
                        <span
                          key={bg}
                          className="px-2.5 py-1 rounded-lg text-xs font-black bg-blood-100 text-blood-800 border border-blood-200"
                        >
                          {bg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Special Tag for Universal Types */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  {selectedBloodGroup === 'O-' ? (
                    <span className="text-amber-800 font-semibold">
                      O- is the <strong>Universal Red Cell Donor</strong>: Critical for trauma emergencies.
                    </span>
                  ) : selectedBloodGroup === 'AB+' ? (
                    <span className="text-amber-800 font-semibold">
                      AB+ is the <strong>Universal Recipient</strong>: Can safely receive red blood cells from all types.
                    </span>
                  ) : (
                    <span>
                      Compatibility adheres strictly to standard RBC antigen matching protocols.
                    </span>
                  )}
                </div>

                {/* Action button inside card */}
                <div className="mt-5">
                  <Link
                    to={`/register`}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <span>Register as {selectedBloodGroup} Donor</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM METRICS & IMPACT BAR */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-black text-blood-700 tracking-tight">
                14+
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#17212B] mt-1">
                Verified Donors
              </div>
              <div className="text-xs text-[#73808C]">Ready on emergency standby</div>
            </div>

            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                8 / 8
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#17212B] mt-1">
                Blood Groups
              </div>
              <div className="text-xs text-[#73808C]">Complete ABO & RhD Coverage</div>
            </div>

            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                &lt; 15 min
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#17212B] mt-1">
                Fast Matching ETA
              </div>
              <div className="text-xs text-[#73808C]">OSRM road-distance routing</div>
            </div>

            <div className="text-center p-4">
              <div className="text-3xl sm:text-4xl font-black text-blood-700 tracking-tight">
                0 ₹
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#17212B] mt-1">
                100% Free Platform
              </div>
              <div className="text-xs text-[#73808C]">Humanitarian peer-to-peer</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3-STEP PIPELINE) */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase tracking-wider">
              Emergency Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17212B] tracking-tight">
              How BloodBridge Saves Lives in 3 Steps
            </h2>
            <p className="text-base text-[#505D68]">
              Engineered for extreme medical urgency, our coordination engine removes friction and
              connects patients with nearby donors seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative group">
              <div className="w-14 h-14 rounded-2xl bg-blood-50 text-blood-700 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-blood-700" />
              </div>
              <div className="space-y-3">
                <div className="text-xs font-black text-blood-700 uppercase tracking-widest">
                  Step 01
                </div>
                <h3 className="text-xl font-bold text-[#17212B]">
                  Broadcast Emergency Request
                </h3>
                <p className="text-sm text-[#505D68] leading-relaxed">
                  The patient or hospital attendant posts the blood type, units required, and pins
                  the exact hospital location using our interactive map.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Takes less than 30 seconds
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative group">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-amber-600" />
              </div>
              <div className="space-y-3">
                <div className="text-xs font-black text-amber-600 uppercase tracking-widest">
                  Step 02
                </div>
                <h3 className="text-xl font-bold text-[#17212B]">
                  Smart Match &amp; Multi-Pool
                </h3>
                <p className="text-sm text-[#505D68] leading-relaxed">
                  Algorithms instantly identify compatible blood groups, calculate OSRM drive
                  routes, and alert nearby donors. Donors accept as Primary or Backup reserves.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Automated backup failover protection
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between relative group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <div className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                  Step 03
                </div>
                <h3 className="text-xl font-bold text-[#17212B]">
                  Track Live ETA &amp; Chat
                </h3>
                <p className="text-sm text-[#505D68] leading-relaxed">
                  Both parties track live arrival status on Leaflet maps and coordinate hospital
                  meet-up points directly through encrypted in-app emergency chat.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
                Direct hospital coordination
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LIVE EMERGENCY COORDINATION PREVIEW */}
      <section id="preview" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase">
                <Activity className="w-3.5 h-3.5" />
                <span>Live Operational UI</span>
              </div>
              <h2 className="text-3xl font-black text-[#17212B] tracking-tight">
                Transparent Responders Pool &amp; Live Tracking
              </h2>
              <p className="text-sm sm:text-base text-[#505D68] leading-relaxed">
                When a hospital needs blood, multiple community donors respond. BloodBridge
                automatically assigns confirmed responders into <strong>Primary Donors</strong> and{' '}
                <strong>Backup Reserves</strong> to protect against any unexpected road delays or
                hospital cancellations.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#17212B]">Primary Donor Priority</h4>
                    <p className="text-xs text-[#73808C]">
                      First confirmed donor is marked Primary with calculated route ETA.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#17212B]">Automatic Backup Failover</h4>
                    <p className="text-xs text-[#73808C]">
                      If a primary donor withdraws, the best backup is instantly promoted with push notification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#17212B]">Emergency Room Chat</h4>
                    <p className="text-xs text-[#73808C]">
                      Instant WebSocket messaging between patient and confirmed responders.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Simulation Mockup Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#F7F8FA] rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-4">
                {/* Header Mockup */}
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blood-700 text-white flex items-center justify-center font-black">
                      O-
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#17212B]">
                        Urgent Blood Request #BR-8921
                      </div>
                      <div className="text-xs text-[#73808C] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blood-700" />
                        <span>Apollo Hospital, ICU Ward 4 &bull; 2 Units</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                    En Route
                  </span>
                </div>

                {/* Simulated Responder Pool */}
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                    Confirmed Responder Pool (2 Donors Active):
                  </div>

                  {/* Primary Donor Card */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500/80 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        P1
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#17212B]">Vikram A.</span>
                          <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded">
                            PRIMARY DONOR
                          </span>
                        </div>
                        <div className="text-xs text-[#73808C] flex items-center gap-2 mt-0.5">
                          <span>Blood: O-</span>
                          <span>&bull;</span>
                          <span>Distance: 2.4 km</span>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-bold">ETA: 7 mins</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      En Route
                    </span>
                  </div>

                  {/* Backup Donor Card */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                        B1
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#17212B]">Pooja R.</span>
                          <span className="px-2 py-0.5 text-[10px] font-black bg-slate-100 text-slate-700 rounded">
                            BACKUP DONOR
                          </span>
                        </div>
                        <div className="text-xs text-[#73808C] flex items-center gap-2 mt-0.5">
                          <span>Blood: O-</span>
                          <span>&bull;</span>
                          <span>Distance: 4.8 km</span>
                          <span>&bull;</span>
                          <span>ETA: 14 mins</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600">
                      Standby
                    </span>
                  </div>
                </div>

                {/* Simulated Chat Message Preview */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blood-100 text-blood-700 flex items-center justify-center font-bold shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 truncate">
                    <strong className="text-[#17212B]">Emergency Chat:</strong> &ldquo;Arriving at Main Gate Emergency Ward in 5 mins.&rdquo;
                  </div>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMPLETE BLOOD COMPATIBILITY REFERENCE MATRIX */}
      <section id="compatibility" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase tracking-wider">
              Medical Standards
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17212B] tracking-tight">
              Red Blood Cell (RBC) Compatibility Matrix
            </h2>
            <p className="text-base text-[#505D68]">
              BloodBridge strictly adheres to Red Blood Cell antigen transfusion rules to protect
              patient safety during emergency transfusions.
            </p>

            {/* Toggle Modes */}
            <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 shadow-sm mt-4">
              <button
                type="button"
                onClick={() => setMatrixMode('recipient')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  matrixMode === 'recipient'
                    ? 'bg-blood-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recipient Perspective (Who can donate to me?)
              </button>
              <button
                type="button"
                onClick={() => setMatrixMode('donor')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  matrixMode === 'donor'
                    ? 'bg-blood-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Donor Perspective (Who can I give blood to?)
              </button>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ALL_BLOOD_GROUPS.map((group) => {
              const matched =
                matrixMode === 'recipient'
                  ? getCompatibleDonorsForPatient(group)
                  : getEligiblePatientGroupsForDonor(group);

              return (
                <div
                  key={group}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-blood-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-700 font-black text-base flex items-center justify-center border border-blood-100">
                        {group}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase">
                          {matrixMode === 'recipient' ? 'Patient Type' : 'Donor Type'}
                        </div>
                        <div className="text-sm font-extrabold text-[#17212B]">
                          Blood Group {group}
                        </div>
                      </div>
                    </div>

                    {group === 'O-' && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        Universal
                      </span>
                    )}
                    {group === 'AB+' && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Universal
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 mb-2">
                      {matrixMode === 'recipient'
                        ? 'Compatible Donor Blood Types:'
                        : 'Eligible Patient Types:'}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {matched.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 text-xs font-black rounded bg-slate-100 text-slate-800 border border-slate-200"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CORE PLATFORM CAPABILITIES */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase tracking-wider">
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17212B] tracking-tight">
              Designed for Speed, Security &amp; Clinical Precision
            </h2>
            <p className="text-base text-[#505D68]">
              Every feature of BloodBridge is built to save precious minutes during critical medical
              emergencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-[#F7F8FA] border border-slate-200/90 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blood-100 text-blood-700 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                OSRM Real-World Road Distance
              </h3>
              <p className="text-sm text-[#505D68] leading-relaxed">
                Calculates actual drivable street distances and vehicular arrival times rather than
                misleading straight-line distance estimates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-[#F7F8FA] border border-slate-200/90 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Automated Multi-Donor Pooling
              </h3>
              <p className="text-sm text-[#505D68] leading-relaxed">
                Maintains primary responders alongside backup reserves so that if any donor faces
                an impediment, backup failover is instantaneous.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-[#F7F8FA] border border-slate-200/90 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Verified 90-Day Cooldown Protection
              </h3>
              <p className="text-sm text-[#505D68] leading-relaxed">
                Protects donor health by calculating medical whole-blood donation intervals (90 days)
                with a 1-click readiness toggle in the donor dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-[#F7F8FA] border border-slate-200/90 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Encrypted Emergency Room Chat
              </h3>
              <p className="text-sm text-[#505D68] leading-relaxed">
                Direct in-app messaging lets hospital attendants and donors coordinate ICU entry
                gates and donor room details privately.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-[#F7F8FA] border border-slate-200/90 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Zero-Polling Real-Time WebSockets
              </h3>
              <p className="text-sm text-[#505D68] leading-relaxed">
                Instant bi-directional alerts notify donors as soon as an emergency matches their
                blood group within their regional vicinity.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-[#F7F8FA] border border-slate-200/90 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#17212B]">
                Reliability Scoring System
              </h3>
              <p className="text-sm text-[#505D68] leading-relaxed">
                Rewards committed donors with transparent completion badges and reliability scoring,
                ensuring life-saving requests are handled responsibly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 text-blood-700 text-xs font-bold uppercase tracking-wider">
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#17212B] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-[#505D68]">
              Everything you need to know about emergency donor matching on BloodBridge.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-[#17212B] hover:text-blood-700 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-blood-700" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 text-sm text-[#505D68] leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION BANNER */}
      <section className="bg-gradient-to-br from-blood-800 via-blood-700 to-blood-900 text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Be The Bridge Between Life &amp; Loss</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Every 2 Seconds, Someone Needs Blood. <br className="hidden sm:inline" />
            Join BloodBridge Today.
          </h2>

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Whether you want to be registered as an emergency donor or you are currently facing a
            critical medical emergency, our network is here to help 24 hours a day.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/requests/create"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blood-800 hover:bg-slate-100 font-extrabold text-base shadow-xl transition-all hover:scale-105"
            >
              Post Emergency Request
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blood-950/40 hover:bg-blood-950/60 text-white font-bold text-base border-2 border-white/30 backdrop-blur-sm transition-all"
            >
              Register as Donor
            </Link>
          </div>
        </div>
      </section>

      {/* 11. HEALTHCARE COMPLIANCE FOOTER */}
      <footer className="bg-[#17212B] text-slate-400 text-sm py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Description */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blood-700 flex items-center justify-center text-white">
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  Blood<span className="text-blood-600">Bridge</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                BloodBridge is an emergency coordination network connecting verified blood donors
                with critical hospital patients in real time through intelligent geolocation and RBC
                compatibility algorithms.
              </p>
              <div className="pt-2 text-xs text-slate-400">
                Emergency Medical Services Helpline: <strong className="text-white">108</strong> &bull;
                National Blood Transfusion Helpline: <strong className="text-white">1075</strong>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#compatibility" className="hover:text-white transition-colors">
                    Compatibility Rules
                  </a>
                </li>
                <li>
                  <a href="#preview" className="hover:text-white transition-colors">
                    Live Tracking &amp; Chat
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Platform Features
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Frequently Asked Questions
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Portal Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">
                Access Portal
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Donor &amp; Patient Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Register as Life-Saving Donor
                  </Link>
                </li>
                <li>
                  <Link to="/requests/create" className="hover:text-white transition-colors">
                    Post Emergency Blood Request
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors">
                    Emergency Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Medical Disclaimer & Copyright */}
          <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 space-y-2 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <p className="max-w-3xl">
              <strong className="text-slate-300">Medical Disclaimer:</strong> BloodBridge is an
              independent emergency communication and coordination technology platform. BloodBridge
              does not store, collect, or test blood directly. All transfusions, cross-matching, and
              medical screenings must be carried out at certified blood banks or accredited hospital
              pathology facilities.
            </p>
            <div className="pt-2 sm:pt-0 shrink-0 text-slate-400">
              &copy; {new Date().getFullYear()} BloodBridge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


// utils/stateMachine.js — pure data, no "use client" needed

export const TRIAGE_TREE = {
  START: {
    id: "START",
    question: "What best describes your situation right now?",
    subtitle: "I'll route you to the right specialist in 3 questions.",
    options: [
      { label: "💻  My computer / laptop has a hardware problem", value: "hardware", next: "HARDWARE_Q1" },
      { label: "🌐  Network or internet issue",                   value: "network",  next: "NETWORK_Q1"  },
      { label: "🛡️  Virus, malware, or security concern",         value: "security", next: "SECURITY_Q1" },
      { label: "🔧  Software or OS not working properly",         value: "software", next: "SOFTWARE_Q1" },
      { label: "🏗️  I need a custom build or setup",              value: "custom",   next: "CUSTOM_END"  },
    ],
  },
  HARDWARE_Q1: {
    id: "HARDWARE_Q1",
    question: "What is the primary symptom?",
    options: [
      { label: "Won't power on at all",           value: "no_power", next: "HARDWARE_POWER"  },
      { label: "Overheating / fan very loud",     value: "heat",     next: "END_THERMAL"     },
      { label: "Screen cracked or no display",    value: "screen",   next: "END_SCREEN"      },
      { label: "Extremely slow performance",      value: "slow",     next: "END_UPGRADE"     },
      { label: "Physically damaged (drop/water)", value: "physical", next: "END_HW_PHYSICAL" },
    ],
  },
  HARDWARE_POWER: {
    id: "HARDWARE_POWER",
    question: "Does the device show any sign of life — LED flicker, brief beep, or fan spin?",
    options: [
      { label: "Yes — brief flicker, beep, or fan spins then stops", value: "partial", next: "END_HARDWARE_PARTIAL" },
      { label: "Completely dead — absolutely nothing",                value: "dead",    next: "END_HARDWARE_DEAD"   },
    ],
  },
  NETWORK_Q1: {
    id: "NETWORK_Q1",
    question: "What kind of network issue are you experiencing?",
    options: [
      { label: "No internet at all",                    value: "no_net", next: "NETWORK_Q2"   },
      { label: "Slow or unstable connection",           value: "slow",   next: "END_NET_SLOW" },
      { label: "Can't connect to local network",        value: "local",  next: "END_NET_LOCAL"},
      { label: "Setting up a new network from scratch", value: "setup",  next: "END_NET_SETUP"},
    ],
  },
  NETWORK_Q2: {
    id: "NETWORK_Q2",
    question: "Does the problem affect ALL devices or just one?",
    options: [
      { label: "All devices affected",  value: "all", next: "END_NET_ISP"    },
      { label: "Just this one device",  value: "one", next: "END_NET_DEVICE" },
    ],
  },
  SECURITY_Q1: {
    id: "SECURITY_Q1",
    question: "What exactly did you notice?",
    options: [
      { label: "Pop-ups or ads appearing everywhere",     value: "adware",     next: "END_SEC_ADWARE" },
      { label: "Files encrypted / ransom message showed", value: "ransomware", next: "END_SEC_RANSOM" },
      { label: "Suspicious login or account access",      value: "breach",     next: "END_SEC_BREACH" },
      { label: "I want a proactive security audit",       value: "audit",      next: "END_SEC_AUDIT"  },
    ],
  },
  SOFTWARE_Q1: {
    id: "SOFTWARE_Q1",
    question: "What is the core software issue?",
    options: [
      { label: "OS crashes / Blue Screen of Death",          value: "bsod",       next: "END_SW_BSOD"   },
      { label: "Need a fresh clean OS installation",         value: "os_install", next: "END_SW_OS"     },
      { label: "Application won't install or keeps crashing",value: "app",        next: "END_SW_APP"    },
      { label: "Driver issues / hardware not recognised",    value: "driver",     next: "END_SW_DRIVER" },
    ],
  },

  // ── Terminal nodes ──────────────────────────────────────────
  END_HARDWARE_PARTIAL: { id:"END_HARDWARE_PARTIAL", terminal:true, icon:"⚡", urgency:"HIGH",     service:"Motherboard / Power Rail Diagnostic",  description:"Partial power suggests a failing power rail, unseated GPU, or faulty CMOS. Requires bench testing.", price:"₦8,000",        duration:"2–3 hrs",   deposit:"₦3,000", category:"hardware" },
  END_HARDWARE_DEAD:    { id:"END_HARDWARE_DEAD",    terminal:true, icon:"🔬", urgency:"HIGH",     service:"Full Hardware Autopsy",                 description:"Complete diagnostic across PSU, motherboard, RAM, and storage to identify the failed component.",   price:"₦10,000",       duration:"3–4 hrs",   deposit:"₦4,000", category:"hardware" },
  END_THERMAL:          { id:"END_THERMAL",          terminal:true, icon:"❄️", urgency:"MEDIUM",   service:"Thermal Cleaning & Repaste",            description:"Deep clean, compressed-air dust extraction, fresh thermal compound, and fan inspection.",            price:"₦5,000",        duration:"1 hr",      deposit:"₦2,000", category:"hardware" },
  END_SCREEN:           { id:"END_SCREEN",           terminal:true, icon:"🖥️", urgency:"MEDIUM",   service:"Screen Replacement Consult",            description:"We source and replace your screen. Final price quoted after model and panel-type confirmation.",    price:"From ₦15,000",  duration:"24–48 hrs", deposit:"₦5,000", category:"hardware" },
  END_UPGRADE:          { id:"END_UPGRADE",          terminal:true, icon:"🚀", urgency:"LOW",      service:"RAM / SSD Performance Upgrade",         description:"Performance tune: upgrade RAM, swap HDD for SSD, optimise startup services and pagefile.",          price:"₦6,000 (labour)",duration:"2 hrs",    deposit:"₦2,500", category:"hardware" },
  END_HW_PHYSICAL:      { id:"END_HW_PHYSICAL",      terminal:true, icon:"🛠️", urgency:"HIGH",     service:"Physical Damage Assessment",            description:"Drop or liquid damage inspection. We assess, quote repair vs. data-recovery priority.",             price:"₦5,000 (assessment)",duration:"1–2 hrs",deposit:"₦5,000",category:"hardware" },
  END_NET_SLOW:         { id:"END_NET_SLOW",         terminal:true, icon:"📊", urgency:"MEDIUM",   service:"Network Performance Audit",             description:"Speed-test analysis, router config review, channel & band optimisation, QoS setup.",               price:"₦5,500",        duration:"1.5 hrs",   deposit:"₦2,000", category:"network"  },
  END_NET_LOCAL:        { id:"END_NET_LOCAL",        terminal:true, icon:"📡", urgency:"MEDIUM",   service:"LAN / Wi-Fi Troubleshooting",           description:"IP conflict resolution, DHCP config, network adapter reset, and driver verification.",             price:"₦5,000",        duration:"1.5 hrs",   deposit:"₦2,000", category:"network"  },
  END_NET_SETUP:        { id:"END_NET_SETUP",        terminal:true, icon:"🏗️", urgency:"LOW",      service:"Full Network Setup",                    description:"Router placement, SSID config, firewall rules, range extender placement, cable routing.",           price:"₦18,000",       duration:"Half day",  deposit:"₦7,000", category:"network"  },
  END_NET_ISP:          { id:"END_NET_ISP",          terminal:true, icon:"📞", urgency:"HIGH",     service:"ISP Fault Escalation Support",          description:"We liaise with your ISP, document the fault, and guide modem reset or line escalation.",           price:"₦3,500",        duration:"Remote",    deposit:"₦3,500", category:"network"  },
  END_NET_DEVICE:       { id:"END_NET_DEVICE",       terminal:true, icon:"🔌", urgency:"MEDIUM",   service:"Device Network Repair",                 description:"NIC driver reinstall, Winsock / TCP-IP stack reset, proxy/VPN conflict resolution.",               price:"₦4,500",        duration:"1 hr",      deposit:"₦2,000", category:"network"  },
  END_SEC_ADWARE:       { id:"END_SEC_ADWARE",       terminal:true, icon:"🛡️", urgency:"HIGH",     service:"Malware Removal & Cleanup",             description:"Full scan, adware/PUP removal, browser reset, startup entry cleanup, AV install.",                price:"₦6,000",        duration:"2 hrs",     deposit:"₦3,000", category:"security" },
  END_SEC_RANSOM:       { id:"END_SEC_RANSOM",       terminal:true, icon:"🚨", urgency:"CRITICAL", service:"Ransomware Emergency Response",          description:"Isolate device, assess encryption scope, attempt decryption-key recovery, clean and restore.",     price:"₦15,000",       duration:"4–8 hrs",   deposit:"₦7,500", category:"security" },
  END_SEC_BREACH:       { id:"END_SEC_BREACH",       terminal:true, icon:"🔐", urgency:"CRITICAL", service:"Account Breach Response",               description:"Evidence gathering, forced password rotation, session revocation, 2FA setup, audit trail.",        price:"₦8,000",        duration:"2–3 hrs",   deposit:"₦4,000", category:"security" },
  END_SEC_AUDIT:        { id:"END_SEC_AUDIT",        terminal:true, icon:"🔍", urgency:"LOW",      service:"Personal Security Audit",               description:"Password hygiene, browser extensions review, privacy settings hardening, VPN recommendation.",     price:"₦7,000",        duration:"2 hrs",     deposit:"₦3,000", category:"security" },
  END_SW_BSOD:          { id:"END_SW_BSOD",          terminal:true, icon:"💀", urgency:"HIGH",     service:"BSOD / Crash Diagnosis",                description:"Minidump analysis, driver conflict identification, memory test, file system integrity check.",      price:"₦7,000",        duration:"2–3 hrs",   deposit:"₦3,000", category:"software" },
  END_SW_OS:            { id:"END_SW_OS",            terminal:true, icon:"💿", urgency:"MEDIUM",   service:"Clean OS Installation",                 description:"Bootable media creation, clean install, driver pack, essential software setup, data backup first.",price:"₦8,000",        duration:"2–3 hrs",   deposit:"₦3,500", category:"software" },
  END_SW_APP:           { id:"END_SW_APP",           terminal:true, icon:"🔧", urgency:"LOW",      service:"Application Repair",                    description:"Dependency resolution, registry cleanup, installer conflict removal, compatibility mode fix.",      price:"₦4,000",        duration:"1 hr",      deposit:"₦2,000", category:"software" },
  END_SW_DRIVER:        { id:"END_SW_DRIVER",        terminal:true, icon:"⚙️", urgency:"MEDIUM",   service:"Driver Repair & Update",                description:"DDU clean removal, official driver sourcing and install, Device Manager audit.",                   price:"₦4,500",        duration:"1.5 hrs",   deposit:"₦2,000", category:"software" },
  CUSTOM_END:           { id:"CUSTOM_END",           terminal:true, icon:"🏗️", urgency:"LOW",      service:"Custom IT Project Consultation",         description:"Network setups, dev environments, homelab builds, server configs. We scope, price, and deliver.",  price:"Quote on Request",duration:"TBD",     deposit:"₦5,000", category:"custom"   },
};

export const URGENCY_CONFIG = {
  CRITICAL: { color: "#FF3366", label: "🚨 CRITICAL", bg: "rgba(255,51,102,0.12)"  },
  HIGH:     { color: "#FF6B35", label: "🔴 HIGH",     bg: "rgba(255,107,53,0.12)" },
  MEDIUM:   { color: "#FFB800", label: "🟡 MEDIUM",   bg: "rgba(255,184,0,0.10)"  },
  LOW:      { color: "#00FF88", label: "🟢 LOW",      bg: "rgba(0,255,136,0.10)"  },
};

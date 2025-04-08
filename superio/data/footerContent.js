// Placeholder routes used where specific pages don't exist yet
export default [
  {
    id: 1,
    title: "For Job Seekers", // Updated Title
    menuList: [
      { name: "Find ABA Jobs", route: "/jobs" }, // Corrected link
      { name: "Career Growth Resources", route: "#" }, // Placeholder
      { name: "Resume Tips for ABA Pros", route: "#" }, // Placeholder
      { name: "Candidate Dashboard", route: "/candidates-dashboard/dashboard" }, // Kept from original
    ],
  },
  {
    id: 2,
    title: "For Employers", // Kept Title
    menuList: [
      { name: "Post an ABA Job", route: "/employers-dashboard/post-jobs" }, // Renamed & Kept
      { name: "Why Hire Through Us?", route: "#" }, // Placeholder
      { name: "Pricing Plans", route: "/pricing" }, // Updated link
      { name: "Employer Dashboard", route: "/employers-dashboard/dashboard" }, // Kept
    ],
  },
  {
    id: 3,
    title: "My ABA Jobs", // Updated Title
    menuList: [
      { name: "Our Commitment", route: "/about" }, // Renamed About Us
      { name: "Contact Support", route: "/contact" }, // Renamed Contact
      { name: "Blog", route: "/blog" }, // Kept
    ],
  },
  // Removed original "Helpful Resources" section
  // Added new "Resources" section based on copy doc (Item 9, #44)
  {
    id: 4,
    title: "Resources",
    menuList: [
      { name: "Understanding Burnout", route: "#" }, // Placeholder
      { name: "CEU Opportunities (Links)", route: "#" }, // Placeholder
    ],
  },
];

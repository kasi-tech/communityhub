import Link from "next/link";

const quickLinks = [
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const getInvolved = [
  { href: "/onboarding", label: "Join as Member" },
  { href: "/donate", label: "Donate" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/events", label: "Attend Events" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
                CH
              </div>
              <span className="text-lg font-bold text-white">CommunityHub</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              A white-label community management platform for membership
              organizations, clubs, and associations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Get Involved
            </h3>
            <ul className="space-y-2">
              {getInvolved.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>info@communityhub.org</li>
              <li>+1 (555) 123-4567</li>
              <li>123 Community Lane</li>
              <li>Singapore 123456</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} CommunityHub. All rights reserved.
          </p>
          <p className="mt-1">
            Powered by{" "}
            <span className="font-medium text-indigo-400">CommunityHub</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

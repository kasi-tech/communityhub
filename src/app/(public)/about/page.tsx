import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_TENANT } from "@/config/tenant";

const LEADERS = [
  {
    name: "Dr. Ramesh Reddy",
    role: "President",
    initials: "RR",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Priya Sharma",
    role: "Secretary",
    initials: "PS",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Venkat Rao",
    role: "Treasurer",
    initials: "VR",
    color: "bg-green-100 text-green-700",
  },
];

export default function AboutPage() {
  const tenant = DEFAULT_TENANT;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">About Our Community</h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">
          {tenant.branding.tagline}
        </p>
      </section>

      {/* About content */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {tenant.name} is dedicated to fostering a vibrant, connected
            community that celebrates our shared heritage while embracing the
            diverse culture of Singapore. Since our founding, we have been a home
            for families, professionals, students, and cultural enthusiasts who
            value togetherness and mutual support.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Through cultural festivals, educational workshops, networking events,
            and community service initiatives, we create opportunities for our
            members to connect, learn, and grow together. Our programs span all
            ages — from children&apos;s language classes to senior social
            gatherings — ensuring everyone has a place in our community.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            We are proud to be a registered non-profit organization with over
            1,200 active members. Our dedicated team of volunteers and elected
            leaders work tirelessly to organize events, manage community
            resources, and advocate for our members&apos; interests. Together, we
            are building a legacy of cultural pride and community spirit for
            generations to come.
          </p>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Leadership Team
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {LEADERS.map((leader) => (
              <Card key={leader.role}>
                <CardContent className="flex flex-col items-center p-6 text-center">
                  {/* Avatar placeholder */}
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold ${leader.color}`}
                  >
                    {leader.initials}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {leader.name}
                  </h3>
                  <p className="text-sm text-gray-500">{leader.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { label: "Active Members", value: "1,200+" },
            { label: "Events Per Year", value: "30+" },
            { label: "Years of Service", value: "15+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-indigo-600">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

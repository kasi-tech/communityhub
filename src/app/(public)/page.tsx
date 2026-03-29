import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const upcomingEvents = [
  {
    id: "1",
    title: "Annual Community Gala",
    date: "April 15, 2026",
    location: "Grand Ballroom, Singapore",
    category: "Social",
    image: null,
  },
  {
    id: "2",
    title: "Youth Leadership Workshop",
    date: "April 22, 2026",
    location: "Community Center, Hall A",
    category: "Education",
    image: null,
  },
  {
    id: "3",
    title: "Cultural Festival 2026",
    date: "May 1, 2026",
    location: "Heritage Park",
    category: "Cultural",
    image: null,
  },
];

const stats = [
  { label: "Members", value: "2,500+", icon: "\uD83D\uDC65" },
  { label: "Events Hosted", value: "350+", icon: "\uD83D\uDCC5" },
  { label: "Volunteer Hours", value: "15,000+", icon: "\u23F0" },
  { label: "Years Active", value: "12", icon: "\u2B50" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 px-4 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to CommunityHub
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100 sm:text-xl">
            Connecting members, powering events, and building stronger
            communities together.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/events">
              <Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                Explore Events
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="ghost" size="lg" className="border border-white/30 text-white hover:bg-white/10">
                Join Us
              </Button>
            </Link>
          </div>
          {/* Countdown placeholder */}
          <div className="mt-10">
            <p className="text-sm text-indigo-200">Next Event In</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              {["12", "08", "45", "30"].map((val, i) => (
                <div key={i} className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <p className="text-2xl font-bold">{val}</p>
                  <p className="text-xs text-indigo-200">
                    {["Days", "Hours", "Mins", "Secs"][i]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="mt-1 text-sm text-gray-500">
              Don&apos;t miss out on what&apos;s happening next
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-md">
              {/* Image placeholder */}
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                <span className="text-4xl" aria-hidden="true">\uD83D\uDCC5</span>
              </div>
              <CardContent className="space-y-2">
                <Badge variant="info">{event.category}</Badge>
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>{event.date}</p>
                  <p>{event.location}</p>
                </div>
                <Link href={`/events/${event.id}`}>
                  <Button variant="ghost" size="sm" className="mt-2 w-full">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Our Community in Numbers
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="py-6">
                  <span className="text-3xl" aria-hidden="true">{stat.icon}</span>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

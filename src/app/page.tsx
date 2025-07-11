import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, image_url, date_time, location, pricing')
    .eq('approved', true)
    .order('date_time', { ascending: true });

  const freeEvents = events?.filter(
    e => e.pricing?.toLowerCase() === 'free'
  ) || [];

  const paidEvents = events?.filter(
    e => e.pricing && e.pricing.toLowerCase() !== 'free'
  ) || [];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      {/* Header */}
      <header className="border-b shadow-sm sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo-title.svg" alt="CMHOhio" width={120} height={40} priority />
          </Link>
          <nav className="flex space-x-4 text-sm font-medium">
            <Link href="/events" className="hover:text-neutral-700 transition">See Events</Link>
            <Link href="/events/new" className="hover:text-neutral-700 transition">Post Event</Link>
            <Link href="/auth" className="hover:text-neutral-700 transition">Log In</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 sm:py-28 bg-neutral-50">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight max-w-2xl">
          All Columbus Events. <span className="text-neutral-800">One Place.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg max-w-xl text-neutral-600">
          Discover what's happening or share your event with the city. Simple. Free. Local.
        </p>
        <Link
          href="/events"
          className="mt-8 inline-block rounded-full bg-neutral-900 text-white px-6 py-3 hover:bg-neutral-800 transition text-sm sm:text-base shadow"
        >
          Get Started
        </Link>
      </section>

      {/* Error */}
      {error && (
        <div className="text-center text-red-600 py-6">
          Error loading events. Please try again later.
        </div>
      )}

      {/* Free Events */}
      {!error && freeEvents.length > 0 && (
        <EventSection
          title="Free Events"
          color="text-green-700"
          events={freeEvents}
        />
      )}

      {/* Paid Events */}
      {!error && paidEvents.length > 0 && (
        <EventSection
          title="Paid Events"
          color="text-yellow-700"
          events={paidEvents}
        />
      )}

      {/* All Upcoming Events */}
      {!error && events && events.length > 0 && (
        <EventSection
          title="All Upcoming Events"
          color="text-neutral-900"
          events={events}
        />
      )}

      {!error && events?.length === 0 && (
        <div className="text-center text-neutral-500 py-12">
          No upcoming events yet. Check back soon!
        </div>
      )}

      {/* Footer */}
      <footer className="border-t bg-neutral-900 text-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm">&copy; 2025 CMHOhio. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/admin" className="hover:underline">Admin Login</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function EventSection({ title, color, events }: { title: string, color: string, events: any[] }) {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto w-full">
      <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-12 ${color}`}>
        {title}
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 shadow-sm hover:shadow-lg transition bg-white"
    >
      <div className="relative w-full h-64 sm:h-72 overflow-hidden">
        <Image
          src={event.image_url || 'https://placehold.co/600x400'}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 space-y-1">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="text-sm text-neutral-600">
          {event.date_time ? new Date(event.date_time).toLocaleDateString() : ''}
        </p>
        <p className="text-sm text-neutral-600">{event.location}</p>
      </div>
    </Link>
  );
}

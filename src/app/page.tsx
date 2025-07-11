import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

export default async function Home() {
  // Make a server-side supabase client (no cookies!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch only approved events
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, image_url, date_time, location')
    .eq('approved', true)
    .order('date_time', { ascending: true });

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between items-center px-6 py-4 border-b space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Image src="/logo-title.svg" alt="CMHOhio" width={120} height={40} priority />
        </div>
        <nav className="flex space-x-4 text-sm">
          <Link href="/events" className="hover:underline">See Events</Link>
          <Link href="/events/new" className="hover:underline">Post Event</Link>
          <Link href="/auth" className="hover:underline">Log In</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24 bg-neutral-50">
        <h1 className="text-4xl sm:text-6xl font-extrabold max-w-2xl leading-tight">
          All Columbus Events. One Place.
        </h1>
        <p className="mt-4 text-base sm:text-lg max-w-xl text-neutral-600">
          Discover what's happening or share your event with the city. Simple. Free. Local.
        </p>
        <Link
          href="/events"
          className="mt-8 inline-block px-6 py-3 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition rounded-full text-sm sm:text-base"
        >
          Get Started
        </Link>
      </section>

      {/* Events Grid */}
      <section className="px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10">
          Upcoming Events
        </h2>

        {error && (
          <p className="text-center text-red-600">Error loading events.</p>
        )}

        {!events || events.length === 0 ? (
          <p className="text-center text-neutral-500">
            No upcoming events yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group block overflow-hidden rounded-xl border shadow-sm hover:shadow-lg transition bg-white"
              >
                <img
                  src={event.image_url || '/placeholder.jpg'}
                  alt={event.title}
                  className="object-cover w-full h-56 sm:h-64 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                  <p className="text-sm text-neutral-600 mb-1">
                    {event.date_time ? new Date(event.date_time).toLocaleDateString() : ''}
                  </p>
                  <p className="text-sm text-neutral-600">{event.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-6 text-sm text-neutral-500 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p>© 2025 CMHOhio. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Facebook
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

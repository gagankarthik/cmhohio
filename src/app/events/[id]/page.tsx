import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Fetch only approved event by ID
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .eq('approved', true)
    .single();

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-white text-neutral-900">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-neutral-600 mb-6">This event may not be approved yet or may have been removed.</p>
        <Link
          href="/events"
          className="border border-neutral-900 px-4 py-2 rounded hover:bg-neutral-900 hover:text-white transition"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Event Details</h1>
        <Link
          href="/events"
          className="text-sm border border-neutral-900 px-3 py-1 rounded hover:bg-neutral-900 hover:text-white transition"
        >
          Close
        </Link>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {event.image_url && (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-64 object-cover rounded-lg shadow"
          />
        )}

        <div className="space-y-2">
          <h2 className="text-3xl font-bold">{event.title}</h2>
          <p className="text-neutral-600">
            {event.date_time ? new Date(event.date_time).toLocaleString() : ''}
          </p>
          <p className="text-neutral-700">{event.location}</p>
          {event.pricing && (
            <p className="text-neutral-800">
              <strong>Pricing:</strong> {event.pricing}
            </p>
          )}
          {event.about && (
            <p className="text-neutral-700 whitespace-pre-wrap">
              <strong>About:</strong> {event.about}
            </p>
          )}
          {event.contact_details && (
            <p className="text-neutral-700 whitespace-pre-wrap">
              <strong>Contact:</strong> {event.contact_details}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

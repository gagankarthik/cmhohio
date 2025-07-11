'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function UserEventsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [organization, setOrganization] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const userId = session.user.id;
      setUserEmail(String(session.user.email) || 'No email provided');

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_name')
        .eq('id', userId)
        .single();

      setOrganization(profile?.organization_name || '');

      // Get user events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting event: ' + error.message);
    } else {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-sm text-neutral-600">Logged in as: {userEmail}</p>
            {organization && (
              <p className="text-sm text-neutral-600">Organization: {organization}</p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 md:mt-0 border border-neutral-900 px-4 py-2 rounded hover:bg-neutral-900 hover:text-white transition"
          >
            Sign Out
          </button>
        </header>

        {/* New Event Button */}
        <div className="mb-8">
          <Link
            href="/events/new"
            className="inline-block bg-neutral-900 text-white px-5 py-3 rounded-full hover:bg-neutral-800 transition"
          >
            + Post New Event
          </Link>
        </div>

        {loading && <p className="text-center text-neutral-500">Loading your events...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && events.length === 0 && (
          <p className="text-center text-neutral-500">You have not posted any events yet.</p>
        )}

        {/* Events Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden"
            >
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="object-cover w-full h-56 sm:h-64"
                />
              )}

              <div className="flex-1 p-5 flex flex-col">
                <h2 className="text-xl font-bold mb-1">{event.title}</h2>
                <p className="text-sm text-neutral-600 mb-1">
                  {event.date_time ? new Date(event.date_time).toLocaleString() : ''}
                </p>
                <p className="text-sm text-neutral-600 mb-2">{event.location}</p>

                {event.pricing && (
                  <p className="text-sm text-neutral-800 mb-2"><strong>Pricing:</strong> {event.pricing}</p>
                )}

                {event.about && (
                  <p className="text-sm text-neutral-700 mb-2 line-clamp-4">{event.about}</p>
                )}

                {event.contact_details && (
                  <p className="text-sm text-neutral-700 mb-2">
                    <strong>Contact:</strong> {event.contact_details}
                  </p>
                )}

                <div className="flex gap-2 mt-auto pt-4">
                  <Link
                    href={`/events/edit/${event.id}`}
                    className="flex-1 border border-blue-600 text-blue-600 text-center px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 border border-red-600 text-red-600 px-3 py-2 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

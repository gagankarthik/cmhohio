'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [event, setEvent] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [pricing, setPricing] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [contactDetails, setContactDetails] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Event not found or access denied.');
      } else {
        setEvent(data);
        setTitle(data.title || '');
        setOrganisationName(data.organisation_name || '');
        setDateTime(data.date_time ? new Date(data.date_time).toISOString().slice(0,16) : '');
        setPricing(data.pricing || '');
        setLocation(data.location || '');
        setAbout(data.about || '');
        setContactDetails(data.contact_details || '');
      }

      setLoading(false);
    };

    if (id) fetchEvent();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let imageUrl = event.image_url;

      if (imageFile) {
        // Upload new image
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase
          .storage
          .from('event-images')
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrlData.publicUrl;
      }

      // Update event in DB
      const { error: updateError } = await supabase
        .from('events')
        .update({
          title,
          organisation_name: organisationName || null,
          date_time: dateTime ? new Date(dateTime).toISOString() : null,
          pricing,
          location,
          about,
          contact_details: contactDetails,
          image_url: imageUrl,
          approved: false  // Optional: re-approval required after edits
        })
        .eq('id', id);

      if (updateError) throw updateError;

      router.push('/events');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        {error}
        <div className="mt-4">
          <Link href="/events" className="underline text-blue-600">
            Back to My Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Event</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          placeholder="Event Title"
          required
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Organization Name (optional)"
          className="w-full border rounded px-3 py-2"
          value={organisationName}
          onChange={(e) => setOrganisationName(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border rounded px-3 py-2"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />

        <input
          type="text"
          placeholder="Pricing (e.g. Free / $20)"
          className="w-full border rounded px-3 py-2"
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          required
          className="w-full border rounded px-3 py-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <textarea
          placeholder="About Event"
          className="w-full border rounded px-3 py-2"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />

        <textarea
          placeholder="Contact Details"
          className="w-full border rounded px-3 py-2"
          value={contactDetails}
          onChange={(e) => setContactDetails(e.target.value)}
        />

        <div className="space-y-2">
          <label className="block text-sm text-neutral-600">
            Current Image:
          </label>
          {event.image_url && (
            <img
              src={event.image_url}
              alt="Event"
              className="w-full h-48 object-cover rounded"
            />
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          className="w-full border rounded px-3 py-2"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-neutral-900 text-white px-4 py-2 rounded hover:bg-neutral-800 transition"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

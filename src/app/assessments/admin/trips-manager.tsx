"use client";

import { useState, useEffect } from "react";

type LearningTrip = {
  id: string;
  slug: string;
  name: string;
  region: string;
  blurb: string;
  hero_image: string;
  hero_split_left: string;
  hero_split_right: string;
  hero_split_alt_left: string;
  hero_split_alt_right: string;
  highlights: string[];
  lengths: number[];
  custom_itinerary: Record<string, Array<{ title: string; lesson: string; activity: string }>>;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type TripsManagerProps = {
  token: string;
};

export default function TripsManager({ token }: TripsManagerProps) {
  const [trips, setTrips] = useState<LearningTrip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTrip, setEditingTrip] = useState<LearningTrip | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    region: "",
    blurb: "",
    hero_image: "",
    hero_split_left: "",
    hero_split_right: "",
    hero_split_alt_left: "",
    hero_split_alt_right: "",
    highlights: [] as string[],
    lengths: [14],
    custom_itinerary: {} as Record<string, Array<{ title: string; lesson: string; activity: string }>>,
    published: false,
    sort_order: 0,
  });

  const [highlightInput, setHighlightInput] = useState("");
  const [itineraryDay, setItineraryDay] = useState("");
  const [itineraryEntry, setItineraryEntry] = useState({ title: "", lesson: "", activity: "" });
  const [uploading, setUploading] = useState<string | null>(null); // tracks which field is uploading

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/trips", {
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Failed to fetch trips");
      const data = await res.json();
      setTrips(data.trips || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm("This will migrate all existing trips from code to database. Continue?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/trips/migrate", {
        method: "POST",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Migration failed");
      const data = await res.json();
      alert(data.message);
      setMigrated(true);
      await fetchTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      slug: "",
      name: "",
      region: "",
      blurb: "",
      hero_image: "",
      hero_split_left: "",
      hero_split_right: "",
      hero_split_alt_left: "",
      hero_split_alt_right: "",
      highlights: [],
      lengths: [14],
      custom_itinerary: {},
      published: false,
      sort_order: trips.length,
    });
    setEditingTrip(null);
    setShowForm(true);
  };

  const handleEdit = (trip: LearningTrip) => {
    setFormData({
      slug: trip.slug,
      name: trip.name,
      region: trip.region || "",
      blurb: trip.blurb || "",
      hero_image: trip.hero_image || "",
      hero_split_left: trip.hero_split_left || "",
      hero_split_right: trip.hero_split_right || "",
      hero_split_alt_left: trip.hero_split_alt_left || "",
      hero_split_alt_right: trip.hero_split_alt_right || "",
      highlights: trip.highlights || [],
      lengths: trip.lengths || [14],
      custom_itinerary: trip.custom_itinerary || {},
      published: trip.published,
      sort_order: trip.sort_order,
    });
    setEditingTrip(trip);
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = editingTrip ? `/api/admin/trips/${editingTrip.id}` : "/api/admin/trips";
      const method = editingTrip ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save trip");

      await fetchTrips();
      setShowForm(false);
      setEditingTrip(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save trip");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/trips/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      if (!res.ok) throw new Error("Failed to delete trip");
      await fetchTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip");
    } finally {
      setLoading(false);
    }
  };

  const togglePublished = async (trip: LearningTrip) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ ...trip, published: !trip.published }),
      });
      if (!res.ok) throw new Error("Failed to toggle published status");
      await fetchTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update trip");
    } finally {
      setLoading(false);
    }
  };

  const addHighlight = () => {
    if (!highlightInput.trim()) return;
    setFormData(prev => ({ ...prev, highlights: [...prev.highlights, highlightInput.trim()] }));
    setHighlightInput("");
  };

  const removeHighlight = (index: number) => {
    setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  const addItineraryEntry = () => {
    if (!itineraryDay || !itineraryEntry.title) return;
    setFormData(prev => ({
      ...prev,
      custom_itinerary: {
        ...prev.custom_itinerary,
        [itineraryDay]: [...(prev.custom_itinerary[itineraryDay] || []), itineraryEntry],
      },
    }));
    setItineraryEntry({ title: "", lesson: "", activity: "" });
  };

  const removeItineraryDay = (day: string) => {
    setFormData(prev => {
      const { [day]: removed, ...rest } = prev.custom_itinerary;
      return { ...prev, custom_itinerary: rest };
    });
  };

  const addLength = (length: number) => {
    if (!formData.lengths.includes(length)) {
      setFormData(prev => ({ ...prev, lengths: [...prev.lengths, length].sort((a, b) => a - b) }));
    }
  };

  const removeLength = (length: number) => {
    setFormData(prev => ({ ...prev, lengths: prev.lengths.filter(l => l !== length) }));
  };

  const handleImageUpload = async (file: File, imageType: "hero_image" | "hero_split_left" | "hero_split_right") => {
    if (!formData.slug) {
      setError("Please enter a slug first before uploading images");
      return;
    }

    setUploading(imageType);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("tripSlug", formData.slug);
      uploadFormData.append("imageType", imageType);

      const res = await fetch("/api/admin/trips/upload", {
        method: "POST",
        headers: {
          "x-admin-token": token,
        },
        body: uploadFormData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setFormData(prev => ({ ...prev, [imageType]: data.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Learning Trips Management</h2>
        <div className="flex gap-2">
          {!migrated && trips.length === 0 && (
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Migrate Existing Trips
            </button>
          )}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
          >
            Create New Trip
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && <p className="text-slate-400">Loading...</p>}

      {/* Trips List */}
      {!showForm && (
        <div className="space-y-3">
          {trips.map(trip => (
            <div key={trip.id} className="bg-slate-800 rounded-lg p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{trip.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${trip.published ? "bg-green-600" : "bg-gray-600"}`}>
                    {trip.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{trip.slug}</p>
                <p className="text-sm text-slate-300 mt-2">{trip.blurb?.substring(0, 150)}...</p>
                <div className="flex gap-2 mt-2 text-xs text-slate-400">
                  <span>Region: {trip.region || "N/A"}</span>
                  <span>•</span>
                  <span>Highlights: {trip.highlights?.length || 0}</span>
                  <span>•</span>
                  <span>Lengths: {trip.lengths?.join(", ") || "14"} days</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => togglePublished(trip)}
                  disabled={loading}
                  className="px-3 py-1 bg-slate-700 text-white text-sm rounded hover:bg-slate-600 disabled:opacity-50"
                >
                  {trip.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleEdit(trip)}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(trip.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {trips.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <p>No trips yet. {!migrated ? "Click 'Migrate Existing Trips' to import from code, or " : ""}Click 'Create New Trip' to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Trip Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{editingTrip ? "Edit Trip" : "Create New Trip"}</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTrip(null);
              }}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold mb-2">Slug (URL-friendly ID)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full rounded bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
                placeholder="florida-nyc"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Trip Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
                placeholder="Florida + New York City"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-semibold mb-2">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className="w-full rounded bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
                placeholder="North America"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-semibold mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full rounded bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Blurb */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description (Blurb)</label>
            <textarea
              value={formData.blurb}
              onChange={(e) => setFormData(prev => ({ ...prev, blurb: e.target.value }))}
              className="w-full rounded bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
              rows={3}
              placeholder="Brief description of the trip..."
            />
          </div>

          {/* Hero Images */}
          <div className="space-y-4">
            <h4 className="font-semibold">Hero Images</h4>

            {/* Single Hero Image */}
            <div className="bg-slate-900 p-4 rounded-lg">
              <label className="block text-sm font-medium mb-2">Single Hero Image</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.hero_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_image: e.target.value }))}
                    className="w-full rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm mb-2"
                    placeholder="https://... (paste URL)"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">or upload:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "hero_image");
                      }}
                      disabled={uploading === "hero_image" || !formData.slug}
                      className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-teal-600 file:text-white hover:file:bg-teal-700 disabled:opacity-50"
                    />
                    {uploading === "hero_image" && <span className="text-xs text-teal-400">Uploading...</span>}
                  </div>
                </div>
                {formData.hero_image && (
                  <div className="w-24 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                    <img src={formData.hero_image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center text-xs text-slate-400 py-2">
              — OR use split hero (two side-by-side images) —
            </div>

            {/* Split Hero Images */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Left Image */}
              <div className="bg-slate-900 p-4 rounded-lg">
                <label className="block text-sm font-medium mb-2">Hero Split - Left</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.hero_split_left}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_split_left: e.target.value }))}
                    className="w-full rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                    placeholder="https://... (paste URL)"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">or upload:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "hero_split_left");
                      }}
                      disabled={uploading === "hero_split_left" || !formData.slug}
                      className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-teal-600 file:text-white hover:file:bg-teal-700 disabled:opacity-50"
                    />
                    {uploading === "hero_split_left" && <span className="text-xs text-teal-400">Uploading...</span>}
                  </div>
                  {formData.hero_split_left && (
                    <div className="w-full h-20 bg-slate-700 rounded overflow-hidden">
                      <img src={formData.hero_split_left} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={formData.hero_split_alt_left}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_split_alt_left: e.target.value }))}
                    className="w-full rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                    placeholder="Alt text for left image"
                  />
                </div>
              </div>

              {/* Right Image */}
              <div className="bg-slate-900 p-4 rounded-lg">
                <label className="block text-sm font-medium mb-2">Hero Split - Right</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.hero_split_right}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_split_right: e.target.value }))}
                    className="w-full rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                    placeholder="https://... (paste URL)"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">or upload:</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, "hero_split_right");
                      }}
                      disabled={uploading === "hero_split_right" || !formData.slug}
                      className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-teal-600 file:text-white hover:file:bg-teal-700 disabled:opacity-50"
                    />
                    {uploading === "hero_split_right" && <span className="text-xs text-teal-400">Uploading...</span>}
                  </div>
                  {formData.hero_split_right && (
                    <div className="w-full h-20 bg-slate-700 rounded overflow-hidden">
                      <img src={formData.hero_split_right} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={formData.hero_split_alt_right}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_split_alt_right: e.target.value }))}
                    className="w-full rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                    placeholder="Alt text for right image"
                  />
                </div>
              </div>
            </div>

            {!formData.slug && (
              <p className="text-xs text-amber-400">Enter a slug first to enable image uploads</p>
            )}
          </div>

          {/* Trip Lengths */}
          <div>
            <label className="block text-sm font-semibold mb-2">Trip Lengths (days)</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.lengths.map(length => (
                <span key={length} className="px-3 py-1 bg-teal-600 rounded text-sm flex items-center gap-2">
                  {length} days
                  <button onClick={() => removeLength(length)} className="hover:text-red-300">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => addLength(7)} className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">Add 7 days</button>
              <button onClick={() => addLength(10)} className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">Add 10 days</button>
              <button onClick={() => addLength(14)} className="px-3 py-1 bg-slate-700 rounded text-sm hover:bg-slate-600">Add 14 days</button>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-sm font-semibold mb-2">Highlights</label>
            <div className="space-y-2 mb-3">
              {formData.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded">
                  <span className="flex-1 text-sm">{highlight}</span>
                  <button onClick={() => removeHighlight(idx)} className="text-red-400 hover:text-red-300">Remove</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHighlight()}
                className="flex-1 rounded bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
                placeholder="Add a highlight..."
              />
              <button onClick={addHighlight} className="px-4 py-2 bg-teal-600 rounded text-sm hover:bg-teal-700">Add</button>
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <label className="block text-sm font-semibold mb-2">Custom Itinerary</label>
            <div className="space-y-3 mb-4">
              {Object.keys(formData.custom_itinerary).sort((a, b) => parseInt(a) - parseInt(b)).map(day => (
                <div key={day} className="bg-slate-900 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">Day {day}</h5>
                    <button onClick={() => removeItineraryDay(day)} className="text-red-400 hover:text-red-300 text-sm">Remove Day</button>
                  </div>
                  <div className="space-y-2">
                    {formData.custom_itinerary[day].map((entry, idx) => (
                      <div key={idx} className="text-sm bg-slate-800 p-2 rounded">
                        <div className="font-medium">{entry.title}</div>
                        <div className="text-slate-400">Lesson: {entry.lesson}</div>
                        <div className="text-slate-400">Activity: {entry.activity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 p-3 rounded space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value={itineraryDay}
                  onChange={(e) => setItineraryDay(e.target.value)}
                  className="rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                  placeholder="Day #"
                />
                <input
                  type="text"
                  value={itineraryEntry.title}
                  onChange={(e) => setItineraryEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="col-span-3 rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                  placeholder="Session title"
                />
              </div>
              <input
                type="text"
                value={itineraryEntry.lesson}
                onChange={(e) => setItineraryEntry(prev => ({ ...prev, lesson: e.target.value }))}
                className="w-full rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                placeholder="Lesson content"
              />
              <input
                type="text"
                value={itineraryEntry.activity}
                onChange={(e) => setItineraryEntry(prev => ({ ...prev, activity: e.target.value }))}
                className="w-full rounded bg-slate-800 border border-slate-600 px-3 py-2 text-sm"
                placeholder="Activity description"
              />
              <button onClick={addItineraryEntry} className="px-4 py-2 bg-teal-600 rounded text-sm hover:bg-teal-700 w-full">
                Add to Itinerary
              </button>
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4"
            />
            <label htmlFor="published" className="text-sm font-semibold">Published (visible on website)</label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingTrip(null);
              }}
              className="px-6 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !formData.slug || !formData.name}
              className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Trip"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

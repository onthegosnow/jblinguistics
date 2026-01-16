"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PortalUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  languages: string[];
  active: boolean;
  created_at: string;
};

type Upload = {
  id: string;
  kind: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  created_at: string;
};

type UserWithUploads = {
  user: PortalUser & { photo_url?: string };
  uploads: Upload[];
};

const STORAGE_KEY = "jb_admin_token";

export default function AdminUsersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithUploads | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setToken(stored);
  }, []);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/portal/admin/users", {
        headers: { "x-admin-token": token },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserUploads = async (userId: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/portal/admin/users/${userId}/uploads`, {
        headers: { "x-admin-token": token },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch uploads");
      }

      const data = await res.json();
      setSelectedUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load uploads");
    } finally {
      setLoading(false);
    }
  };

  const setAsPhoto = async (userId: string, uploadId: string) => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/portal/admin/users/${userId}/uploads`, {
        method: "POST",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uploadId, action: "set_as_photo" }),
      });

      if (!res.ok) {
        throw new Error("Failed to set photo");
      }

      alert("Photo updated successfully!");
      fetchUserUploads(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set photo");
    } finally {
      setLoading(false);
    }
  };

  const deleteUpload = async (userId: string, uploadId: string) => {
    if (!token || !confirm("Delete this upload?")) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/portal/admin/users/${userId}/uploads`, {
        method: "POST",
        headers: {
          "x-admin-token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uploadId, action: "delete" }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete upload");
      }

      alert("Upload deleted!");
      fetchUserUploads(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Login Required</h1>
          <input
            type="password"
            placeholder="Admin Token"
            className="w-full border rounded px-3 py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = e.currentTarget.value.trim();
                if (val) {
                  localStorage.setItem(STORAGE_KEY, val);
                  setToken(val);
                }
              }
            }}
          />
          <p className="text-sm text-slate-600 mt-2">Press Enter to login</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Manage User Photos</h1>
          <Link href="/portal" className="text-teal-600 hover:underline">
            ← Back to Portal
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Portal Users ({users.length})</h2>
            {loading && <p className="text-slate-600">Loading...</p>}

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => fetchUserUploads(user.id)}
                  className={`w-full text-left px-4 py-3 rounded border transition ${
                    selectedUser?.user.id === user.id
                      ? "bg-teal-50 border-teal-500"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-slate-600">{user.email}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Roles: {user.roles.join(", ")} • Active: {user.active ? "Yes" : "No"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white rounded-lg shadow p-6">
            {selectedUser ? (
              <>
                <h2 className="text-xl font-semibold mb-2">{selectedUser.user.name}</h2>
                <p className="text-sm text-slate-600 mb-4">{selectedUser.user.email}</p>

                {selectedUser.user.photo_url && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Current Photo:</p>
                    <div className="relative w-32 h-32 bg-slate-100 rounded border">
                      {selectedUser.user.photo_url.endsWith(".pdf") ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-600">
                          PDF (Not an image!)
                        </div>
                      ) : (
                        <img
                          src={selectedUser.user.photo_url}
                          alt={selectedUser.user.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.alt = "Failed to load";
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold mt-6 mb-3">Uploads ({selectedUser.uploads.length})</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedUser.uploads.map((upload) => {
                    const isImage = upload.mime_type.startsWith("image/");
                    const isPDF = upload.mime_type.includes("pdf");

                    return (
                      <div key={upload.id} className="border rounded p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{upload.filename}</div>
                            <div className="text-xs text-slate-600 mt-1">
                              Type: {upload.kind} • {upload.mime_type}
                            </div>
                            <div className="text-xs text-slate-500">
                              {(upload.size / 1024).toFixed(1)} KB •{" "}
                              {new Date(upload.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            {isImage && (
                              <button
                                onClick={() => setAsPhoto(selectedUser.user.id, upload.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 disabled:opacity-50"
                              >
                                Set as Photo
                              </button>
                            )}
                            <button
                              onClick={() => deleteUpload(selectedUser.user.id, upload.id)}
                              disabled={loading}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isPDF && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            ⚠️ This is a PDF, not a photo. Consider deleting if it was meant to be a profile
                            picture.
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {selectedUser.uploads.length === 0 && (
                    <p className="text-slate-500 text-sm">No uploads found for this user.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 py-12">
                Select a user to view their uploads
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

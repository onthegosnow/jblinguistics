"use client";

import { useEffect, useState } from "react";

type Organization = {
  id: string;
  name: string;
  slug: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  city?: string;
  country?: string;
  contractedHoursPerMonth?: number;
  contractedServices?: string[];
  billingRateHourly?: number;
  active: boolean;
  createdAt: string;
};

type OrgDetails = {
  organization: Organization;
  admins: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
    lastLoginAt?: string;
  }>;
  employees: Array<{
    id: string;
    studentId: string;
    studentName?: string;
    department?: string;
    status: string;
  }>;
  currentMonthHours: {
    totalHours: number;
    billableHours: number;
    sessionCount: number;
  };
};

const SERVICE_OPTIONS = [
  { value: "language_training", label: "Language Training" },
  { value: "translation", label: "Translation" },
  { value: "interpretation", label: "Interpretation" },
  { value: "localization", label: "Localization" },
];

export default function OrganizationsManager({ token }: { token: string }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    city: "",
    country: "",
    contractedHoursPerMonth: "",
    contractedServices: ["language_training"],
    billingRateHourly: "",
    notes: "",
    adminName: "",
    adminEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      const res = await fetch("/api/portal/admin/organizations", {
        headers: { "x-portal-token": token },
      });
      if (!res.ok) throw new Error("Failed to load organizations");
      const data = await res.json();
      setOrganizations(data.organizations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrgDetails(orgId: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/portal/admin/organizations/${orgId}`, {
        headers: { "x-portal-token": token },
      });
      if (!res.ok) throw new Error("Failed to load organization");
      const data = await res.json();
      setSelectedOrg(data);
      setShowDetailModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organization");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/portal/admin/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-portal-token": token,
        },
        body: JSON.stringify({
          name: formData.name,
          primaryContactName: formData.primaryContactName || undefined,
          primaryContactEmail: formData.primaryContactEmail || undefined,
          primaryContactPhone: formData.primaryContactPhone || undefined,
          city: formData.city || undefined,
          country: formData.country || undefined,
          contractedHoursPerMonth: formData.contractedHoursPerMonth
            ? parseInt(formData.contractedHoursPerMonth)
            : undefined,
          contractedServices: formData.contractedServices,
          billingRateHourly: formData.billingRateHourly
            ? parseFloat(formData.billingRateHourly)
            : undefined,
          notes: formData.notes || undefined,
          adminName: formData.adminName || undefined,
          adminEmail: formData.adminEmail || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create organization");
      }

      const data = await res.json();

      // Show success with admin credentials if created
      if (data.adminAccount?.tempPassword) {
        alert(
          `Organization created!\n\nAdmin login credentials sent to ${data.adminAccount.email}\n\nTemporary password: ${data.adminAccount.tempPassword}`
        );
      }

      setShowCreateModal(false);
      setFormData({
        name: "",
        primaryContactName: "",
        primaryContactEmail: "",
        primaryContactPhone: "",
        city: "",
        country: "",
        contractedHoursPerMonth: "",
        contractedServices: ["language_training"],
        billingRateHourly: "",
        notes: "",
        adminName: "",
        adminEmail: "",
      });
      loadOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  }

  function handleServiceToggle(service: string) {
    setFormData((prev) => ({
      ...prev,
      contractedServices: prev.contractedServices.includes(service)
        ? prev.contractedServices.filter((s) => s !== service)
        : [...prev.contractedServices, service],
    }));
  }

  if (loading) {
    return <div className="text-slate-400 p-8">Loading organizations...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Corporate Clients</h2>
          <p className="text-sm text-slate-400">
            Manage organizations and their language training contracts
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Organization
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Organizations Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        {organizations.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No organizations yet. Create one to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Contract</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Services</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{org.name}</div>
                    <div className="text-sm text-slate-400">
                      {org.city && org.country ? `${org.city}, ${org.country}` : org.city || org.country || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{org.primaryContactName || "—"}</div>
                    <div className="text-sm text-slate-400">{org.primaryContactEmail || ""}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">
                      {org.contractedHoursPerMonth ? `${org.contractedHoursPerMonth} hrs/mo` : "—"}
                    </div>
                    {org.billingRateHourly && (
                      <div className="text-sm text-slate-400">${org.billingRateHourly}/hr</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {org.contractedServices?.map((service) => (
                        <span
                          key={service}
                          className="inline-block px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded"
                        >
                          {service.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded ${
                        org.active
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {org.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => loadOrgDetails(org.id)}
                      disabled={detailLoading}
                      className="text-teal-400 hover:text-teal-300 text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Add Corporate Client</h3>
            </div>

            <form onSubmit={handleCreateOrg} className="p-6 space-y-6">
              {/* Organization Info */}
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-3">Organization Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-3">Primary Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.primaryContactName}
                      onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={formData.primaryContactEmail}
                      onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.primaryContactPhone}
                      onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-3">Contract Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Hours/Month</label>
                    <input
                      type="number"
                      value={formData.contractedHoursPerMonth}
                      onChange={(e) => setFormData({ ...formData, contractedHoursPerMonth: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Billing Rate ($/hr)</label>
                    <input
                      type="number"
                      value={formData.billingRateHourly}
                      onChange={(e) => setFormData({ ...formData, billingRateHourly: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Contracted Services</label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_OPTIONS.map((service) => (
                        <label
                          key={service.value}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            formData.contractedServices.includes(service.value)
                              ? "bg-teal-600 text-white"
                              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.contractedServices.includes(service.value)}
                            onChange={() => handleServiceToggle(service.value)}
                            className="sr-only"
                          />
                          {service.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Account */}
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-3">Portal Admin Account</h4>
                <p className="text-xs text-slate-400 mb-3">
                  Create a login for the client to access their portal
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Admin Name</label>
                    <input
                      type="text"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Admin Email</label>
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="Will receive login credentials"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white h-20"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 text-white rounded-lg"
                >
                  {submitting ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {showDetailModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedOrg.organization.name}</h3>
                <p className="text-sm text-slate-400">
                  {selectedOrg.organization.city && selectedOrg.organization.country
                    ? `${selectedOrg.organization.city}, ${selectedOrg.organization.country}`
                    : ""}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Month Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400">This Month Sessions</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedOrg.currentMonthHours.sessionCount}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400">Billable Hours</div>
                  <div className="text-2xl font-bold text-teal-400">
                    {selectedOrg.currentMonthHours.billableHours.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400">Contract Hours</div>
                  <div className="text-2xl font-bold text-white">
                    {selectedOrg.organization.contractedHoursPerMonth || "—"}
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-3">Contract Details</h4>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Billing Rate:</span>
                    <span className="text-white">
                      {selectedOrg.organization.billingRateHourly
                        ? `$${selectedOrg.organization.billingRateHourly}/hr`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Services:</span>
                    <div className="flex gap-1">
                      {selectedOrg.organization.contractedServices?.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded">
                          {s.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Portal Admins */}
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-3">Portal Admins</h4>
                {selectedOrg.admins.length === 0 ? (
                  <p className="text-slate-400 text-sm">No admins configured.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedOrg.admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-white">{admin.name}</div>
                          <div className="text-sm text-slate-400">{admin.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded">
                            {admin.role}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${
                              admin.active
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {admin.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Employees */}
              <div>
                <h4 className="text-sm font-medium text-teal-400 mb-3">
                  Enrolled Employees ({selectedOrg.employees.length})
                </h4>
                {selectedOrg.employees.length === 0 ? (
                  <p className="text-slate-400 text-sm">No employees enrolled yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrg.employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-white">{emp.studentName}</div>
                          <div className="text-sm text-slate-400">{emp.department || "—"}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            emp.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : emp.status === "on_leave"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

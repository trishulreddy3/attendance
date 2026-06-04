import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/Field";
import { Plus, Trash2 } from "lucide-react";
import { BRANCHES } from "@/lib/store";

export const Route = createFileRoute("/admin/faculty")({
  component: AdminFaculty,
});

function AdminFaculty() {
  const queryClient = useQueryClient();
  const { data: faculties = [], isLoading } = useQuery({
    queryKey: ["admin", "faculty"],
    queryFn: () => api.getAllFaculty(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faculty"] });
      toast.success("Faculty deleted successfully");
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete faculty"),
  });

  const addMutation = useMutation({
    mutationFn: (data: any) => api.addFaculty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faculty"] });
      toast.success("Faculty added successfully");
      setIsAdding(false);
      setFormData({ name: "", email: "", mobile: "", password: "", branch: "CSE" });
    },
    onError: (e: any) => toast.error(e.message || "Failed to add faculty"),
  });

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "", branch: "CSE" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-6 text-muted-foreground animate-pulse">Loading faculty...</div>;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Faculty</h1>
          <p className="text-muted-foreground">Add, update, or remove faculty members.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {isAdding ? "Cancel" : <><Plus className="size-4" /> Add Faculty</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-medium text-lg">Add New Faculty</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Field label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Field label="Mobile" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
            <Field label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <label className="space-y-1.5 text-sm font-medium">
              Branch
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" disabled={addMutation.isPending} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {addMutation.isPending ? "Adding..." : "Save Faculty"}
          </button>
        </form>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Branch</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((f: any) => (
                <tr key={f.id} className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 font-medium">{f.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="text-foreground">{f.email}</span>
                      <span>{f.mobile}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {f.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${f.name}?`)) {
                          deleteMutation.mutate(f.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="inline-flex size-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      title="Delete Faculty"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {faculties.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No faculty found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { FiUser, FiSettings, FiDownload, FiLogOut } from "react-icons/fi";

interface UserProfile {
  name: string;
  email: string;
  createdAt: string;
  analysesCount: number;
  bookmarkedCount: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      setProfile(data);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "markdown") => {
    try {
      const response = await fetch(`/api/export?format=${format}`);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unpack-analysis.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`Analysis exported as ${format.toUpperCase()}`, "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      showToast("Logged out successfully", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-playfulWhite flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-playfulRed border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-playfulWhite py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64">
            <Card className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-playfulPink rounded-full flex items-center justify-center mb-4">
                  <FiUser className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-playfulBlack">{profile?.name}</h2>
                <p className="text-playfulGray">{profile?.email}</p>
              </div>
              <Tabs
                tabs={[
                  { label: "Profile", value: "profile" },
                  { label: "Settings", value: "settings" },
                  { label: "Export", value: "export" },
                ]}
                value={activeTab}
                onChange={setActiveTab}
                className="flex-col space-y-2"
              />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card className="p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-playfulBlack">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-playfulGray mb-2">Name</label>
                      <Input value={profile?.name} disabled fullWidth />
                    </div>
                    <div>
                      <label className="block text-playfulGray mb-2">Email</label>
                      <Input value={profile?.email} disabled fullWidth />
                    </div>
                    <div>
                      <label className="block text-playfulGray mb-2">Member Since</label>
                      <Input value={new Date(profile?.createdAt || "").toLocaleDateString()} disabled fullWidth />
                    </div>
                    <div>
                      <label className="block text-playfulGray mb-2">Analyses</label>
                      <Input value={`${profile?.analysesCount} repositories`} disabled fullWidth />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-playfulBlack">Account Settings</h3>
                  <div className="space-y-4">
                    <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                      <FiSettings className="w-5 h-5" />
                      Change Password
                    </Button>
                    <Button variant="outline" fullWidth className="flex items-center justify-center gap-2 text-playfulRed border-playfulRed">
                      <FiLogOut className="w-5 h-5" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "export" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-playfulBlack">Export Options</h3>
                  <div className="space-y-4">
                    <Button
                      variant="outline"
                      fullWidth
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleExport("pdf")}
                    >
                      <FiDownload className="w-5 h-5" />
                      Export as PDF
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      className="flex items-center justify-center gap-2"
                      onClick={() => handleExport("markdown")}
                    >
                      <FiDownload className="w-5 h-5" />
                      Export as Markdown
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
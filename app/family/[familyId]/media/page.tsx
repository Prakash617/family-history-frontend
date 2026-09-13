"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  Plus,
  Upload,
  FileText,
  Calendar,
  X,
  Trash2,
  ExternalLink,
  Download,
  User as UserIcon,
  Search,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
import { MediaItem, Person } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function FamilyMediaPage() {
  const params = useParams();
  const familyId = params.familyId as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAuthenticated, login } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mediaTypeFilter, setMediaTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

  // Upload Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<"PHOTO" | "DOCUMENT" | "CERTIFICATE" | "OTHER">("PHOTO");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoggingInDemo, setIsLoggingInDemo] = useState(false);

  // Clean preview URL when file changes or component unmounts
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Fetch Media Items
  const { data: mediaData, isLoading } = useQuery<{ results: MediaItem[] }>({
    queryKey: ["family-media", familyId],
    queryFn: () => apiRequest<{ results: MediaItem[] }>(`/media/?family=${familyId}`),
  });

  // Fetch People in this family to enable tagging
  const { data: peopleData } = useQuery<{ results: Person[] }>({
    queryKey: ["family-people", familyId],
    queryFn: () => apiRequest<{ results: Person[] }>(`/people/?family=${familyId}`),
  });

  const mediaItems = mediaData?.results || [];
  const people = peopleData?.results || [];

  // Helper to resolve full media file URL
  const resolveMediaUrl = (item: MediaItem) => {
    const target = item.url || item.file;
    if (!target) return "";
    if (target.startsWith("http://") || target.startsWith("https://")) {
      return target;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const host = apiBase.replace(/\/api\/v1\/?$/, "");
    return `${host}${target.startsWith("/") ? "" : "/"}${target}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Quick Demo Login helper for convenience
  const handleDemoLogin = async () => {
    setIsLoggingInDemo(true);
    try {
      const data = await apiRequest<{ access: string; refresh: string; user: any }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email: "demo@familytree.local", password: "Demo1234!" }),
      });
      login(data.access, data.refresh, data.user);
      toast({
        title: "Signed In Successfully (लगइन सफल भयो)",
        description: `Logged in as ${data.user.full_name || data.user.email}`,
        type: "success",
      });
      setUploadError(null);
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err?.message || "Failed to log in with demo credentials.",
        type: "error",
      });
    } finally {
      setIsLoggingInDemo(false);
    }
  };

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !title.trim()) {
        throw new Error("Title and File are required.");
      }
      const formData = new FormData();
      formData.append("family", familyId);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("media_type", mediaType);
      if (selectedPersonId) {
        formData.append("person", selectedPersonId);
      }
      formData.append("file", file);

      return apiRequest<MediaItem>("/media/", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ["family-media", familyId] });
      toast({
        title: "Media Uploaded (मिडिया अपलोड भयो)",
        description: `"${newItem.title}" has been added to the family archive.`,
        type: "success",
      });
      setUploadModalOpen(false);
      setTitle("");
      setDescription("");
      setSelectedPersonId("");
      setFile(null);
      setUploadError(null);
    },
    onError: (err: any) => {
      const msg = err instanceof ApiError ? err.message : err?.message || "Failed to upload media item.";
      setUploadError(msg);
      toast({
        title: "Upload Failed (अपलोड असफल भयो)",
        description: msg,
        type: "error",
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/media/${id}/`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family-media", familyId] });
      toast({
        title: "Media Deleted (मिडिया हटाइयो)",
        description: "The media item has been removed.",
        type: "success",
      });
      setItemToDelete(null);
      if (selectedPhoto && selectedPhoto.id === itemToDelete?.id) {
        setSelectedPhoto(null);
      }
    },
    onError: (err: any) => {
      toast({
        title: "Delete Failed",
        description: err?.message || "Could not delete media item. Ensure you have permission.",
        type: "error",
      });
    },
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (!isAuthenticated) {
      setUploadError("You must be logged in to upload files. Please sign in below.");
      return;
    }
    if (!title.trim()) {
      setUploadError("Please provide a title for this media item.");
      return;
    }
    if (!file) {
      setUploadError("Please choose a file to upload.");
      return;
    }
    uploadMutation.mutate();
  };

  // Filter & Search Logic
  const filteredMedia = mediaItems.filter((item) => {
    const matchesType = mediaTypeFilter === "ALL" || item.media_type === mediaTypeFilter;
    if (!matchesType) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = item.title?.toLowerCase().includes(query);
    const matchesDesc = item.description?.toLowerCase().includes(query);
    const matchesPerson = item.person_detail?.full_name?.toLowerCase().includes(query);
    return matchesTitle || matchesDesc || matchesPerson;
  });

  // Counts for tabs
  const photoCount = mediaItems.filter((m) => m.media_type === "PHOTO").length;
  const docCount = mediaItems.filter((m) => m.media_type === "DOCUMENT").length;
  const certCount = mediaItems.filter((m) => m.media_type === "CERTIFICATE").length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar familyId={familyId} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                Photographs & Historical Documents
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Preserve heirloom photos, birth certificates, and archival artifacts of your lineage.
              </p>
            </div>

            <Button
              onClick={() => {
                setUploadError(null);
                setUploadModalOpen(true);
              }}
              className="gap-1.5 text-xs shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Upload Item (मिडिया थप्नुहोस्)
            </Button>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            {/* Filter tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              <button
                onClick={() => setMediaTypeFilter("ALL")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  mediaTypeFilter === "ALL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                All Items ({mediaItems.length})
              </button>
              <button
                onClick={() => setMediaTypeFilter("PHOTO")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  mediaTypeFilter === "PHOTO"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Photos ({photoCount})
              </button>
              <button
                onClick={() => setMediaTypeFilter("DOCUMENT")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  mediaTypeFilter === "DOCUMENT"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Documents ({docCount})
              </button>
              <button
                onClick={() => setMediaTypeFilter("CERTIFICATE")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                  mediaTypeFilter === "CERTIFICATE"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                Certificates ({certCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search media, member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
              Loading family media archive...
            </div>
          ) : filteredMedia.length === 0 ? (
            <Card className="border-dashed border-2 border-border p-12 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-foreground">
                  {searchQuery ? "No media items match your search" : "No media items in this collection"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms or filters."
                    : "Preserve historical family photographs, citizenship cards, deeds, and birth records."}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={() => setUploadModalOpen(true)} className="gap-1.5 text-xs">
                  <Upload className="h-4 w-4" />
                  Upload First Item
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => {
                const mediaUrl = resolveMediaUrl(item);
                return (
                  <Card
                    key={item.id}
                    onClick={() => setSelectedPhoto(item)}
                    className="group overflow-hidden border-border hover:shadow-lg transition-all cursor-pointer select-none flex flex-col bg-card"
                  >
                    <div className="aspect-square bg-muted/40 relative overflow-hidden flex items-center justify-center border-b border-border/50">
                      {item.media_type === "PHOTO" ? (
                        <img
                          src={mediaUrl}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback if image fails to render
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="p-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-1.5">
                          <FileText className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-200" />
                          <Badge variant="outline" className="text-[10px] font-semibold tracking-wider uppercase">
                            {item.media_type}
                          </Badge>
                        </div>
                      )}

                      {/* Quick Delete Overlay Button */}
                      <button
                        title="Delete media item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white/80 hover:text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 z-10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Tagged person pill */}
                      {item.person_detail && (
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded truncate flex items-center gap-1">
                          <UserIcon className="h-3 w-3 shrink-0 text-primary-foreground" />
                          <span className="truncate">{item.person_detail.full_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <h4 className="font-medium text-xs text-foreground truncate" title={item.title}>
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5" title={item.description}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        {item.file_size > 0 && <span>{formatFileSize(item.file_size)}</span>}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Lightbox / Media Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Controls Top-Right */}
            <div className="absolute -top-12 right-0 flex items-center gap-2">
              <a
                href={resolveMediaUrl(selectedPhoto)}
                download
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-md transition-colors"
                title="Download / Open file"
              >
                <Download className="h-5 w-5" />
              </a>

              <button
                onClick={() => setItemToDelete(selectedPhoto)}
                className="p-1.5 text-red-400 hover:text-red-300 bg-black/40 hover:bg-red-950/60 rounded-md transition-colors"
                title="Delete item"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-md transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Display Body */}
            {selectedPhoto.media_type === "PHOTO" ? (
              <img
                src={resolveMediaUrl(selectedPhoto)}
                alt={selectedPhoto.title}
                className="max-h-[75vh] w-auto rounded-lg shadow-2xl object-contain"
              />
            ) : (
              <div className="bg-card p-8 rounded-lg text-center space-y-4 max-w-md w-full border border-border shadow-2xl">
                <FileText className="h-16 w-16 mx-auto text-primary" />
                <h3 className="font-bold text-lg text-foreground">{selectedPhoto.title}</h3>
                {selectedPhoto.description && (
                  <p className="text-sm text-muted-foreground">{selectedPhoto.description}</p>
                )}
                <div className="pt-2 flex justify-center gap-2">
                  <a href={resolveMediaUrl(selectedPhoto)} target="_blank" rel="noreferrer">
                    <Button className="gap-1.5 text-xs">
                      <ExternalLink className="h-4 w-4" />
                      Open Full Document
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Photo Metadata Footer */}
            <div className="mt-3 text-center text-white space-y-1 max-w-xl">
              <h3 className="font-semibold text-base">{selectedPhoto.title}</h3>
              {selectedPhoto.description && (
                <p className="text-xs text-white/80">{selectedPhoto.description}</p>
              )}
              <div className="flex items-center justify-center gap-3 text-[11px] text-white/60 pt-1">
                {selectedPhoto.person_detail && (
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> {selectedPhoto.person_detail.full_name}
                  </span>
                )}
                <span>Added: {new Date(selectedPhoto.created_at).toLocaleDateString()}</span>
                {selectedPhoto.file_size > 0 && <span>{formatFileSize(selectedPhoto.file_size)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => {
          if (!uploadMutation.isPending) {
            setUploadModalOpen(false);
            setUploadError(null);
          }
        }}
        title="Upload Family Media (मिडिया अपलोड)"
        description="Select a photograph, document scan, citizenship card, or certificate."
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {/* Auth Warning if Not Authenticated */}
          {!isAuthenticated && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Sign in required:</strong> Only authenticated members can upload photos and historical documents to this family archive.
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoggingInDemo}
                  onClick={handleDemoLogin}
                  className="text-xs h-7 gap-1 border-amber-500/40 text-amber-700 dark:text-amber-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isLoggingInDemo ? "Signing in..." : "Sign in as Demo User"}
                </Button>
                <Link href="/login" className="text-xs text-primary underline hover:opacity-80">
                  Or go to login
                </Link>
              </div>
            </div>
          )}

          {/* Inline Error Message */}
          {uploadError && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Title (शीर्षक) <span className="text-destructive">*</span>
            </label>
            <Input
              required
              placeholder="e.g. 1960 Wedding Portrait, Citizenship Card"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Media Type & Tag Member Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Media Type (प्रकार)</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as any)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="PHOTO">Photograph (तस्विर)</option>
                <option value="DOCUMENT">Document (कागजात)</option>
                <option value="CERTIFICATE">Certificate (प्रमाणपत्र)</option>
                <option value="OTHER">Other Artifact (अन्य)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Tag Member (सदस्य सम्बद्ध गर्नुहोस्)</label>
              <select
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- No specific member tagged --</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} {p.preferred_name ? `(${p.preferred_name})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description / Notes (विवरण)</label>
            <Input
              placeholder="Notes on who is in the photo, year, or location"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* File Picker & Thumbnail Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              File (फाइल छान्नुहोस्) <span className="text-destructive">*</span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-lg border border-border p-2 flex items-center gap-3 bg-secondary/30">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-16 w-16 object-cover rounded-md border border-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-foreground">{file?.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatFileSize(file?.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                >
                  Change
                </Button>
              </div>
            ) : file ? (
              <div className="relative rounded-lg border border-border p-3 flex items-center gap-3 bg-secondary/30">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-foreground">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                >
                  Change
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/60 hover:bg-secondary/20 transition-all">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs font-medium text-foreground">Click to browse or drag file here</span>
                <span className="text-[11px] text-muted-foreground mt-1">Supports JPG, PNG, WEBP, PDF</span>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending || !file || !title.trim()}
              className="gap-1.5"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Media (अपलोड गर्नुहोस्)"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <Modal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          title="Confirm Delete (मिडिया हटाउनुहोस्)"
          description="Are you sure you want to delete this media item? This action cannot be undone."
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                You are about to permanently delete <strong>{itemToDelete.title}</strong>.
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setItemToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(itemToDelete.id)}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

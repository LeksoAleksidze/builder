import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog";
import { Button } from "@d2d-ui/ui/button";
import { Alert, AlertDescription } from "@d2d-ui/ui/alert";
import { Loader2, Upload, Trash2, ExternalLink, X, AlertTriangle } from "lucide-react";
import { DOMAIN_URL } from "../../../../shared/services/api";

interface FileModalGalleryProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FileItem {
    url: string;
    createdAt: string;
}

export const FileModalGallery: React.FC<FileModalGalleryProps> = ({ isOpen, onClose }) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [confirmFile, setConfirmFile] = useState<FileItem | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const token = localStorage.getItem("authToken");

    const fetchFiles = () => {
        setLoading(true);
        fetch(`${DOMAIN_URL}/sequence/all`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((data) => {
                setFiles(data?.body || []);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load files.");
                setLoading(false);
            });
    };

    useEffect(() => {
        if (isOpen) fetchFiles();
    }, [isOpen]);

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const res = await fetch(`${DOMAIN_URL}/sequence/upload`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await res.json();

            if (!res.ok || !result.status) throw new Error(result.body.message || "Upload failed.");
            setError("");
            setFile(null);
            fetchFiles();
        } catch (err: any) {
            setError(err.message || "Upload error.");
            setLoading(false);
        }
    };

    const confirmDelete = (item: FileItem) => {
        setConfirmFile(item);
    };

    const handleDeleteConfirmed = async () => {
        if (!confirmFile) return;
        const fileName = confirmFile.url.split("/").pop();
        if (!fileName) return;

        try {
            setDeleting(true);
            const res = await fetch(`${DOMAIN_URL}/sequence/delete/${fileName}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Delete failed.");

            setDeleting(false);
            setConfirmFile(null);
            fetchFiles();
        } catch (err: any) {
            setError(err.message || "Failed to delete file.");
            setDeleting(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            File Gallery
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Upload Section */}
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="flex-1 text-sm border border-input rounded-lg p-2.5 bg-background text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                            />
                            <Button
                                onClick={handleUpload}
                                disabled={loading || !file}
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-1" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </div>

                        {error && (
                            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* File List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">Loading files...</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {files.length > 0 ? (
                                    files.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="min-w-0 flex-1 mr-3">
                                                <div className="font-medium text-sm text-foreground truncate">
                                                    {item.url.split("/").pop()}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {item.createdAt}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button variant="outline" size="sm" className="h-8">
                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                        Open
                                                    </Button>
                                                </a>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                    onClick={() => confirmDelete(item)}
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No files uploaded yet.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={!!confirmFile} onOpenChange={(open) => { if (!open) setConfirmFile(null); }}>
                <DialogContent className="max-w-sm" onPointerDownOutside={(e) => deleting && e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <Trash2 className="h-5 w-5 text-red-600" />
                            Delete Confirmation
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Are you sure?
                                </p>
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    Delete <strong>{confirmFile?.url.split("/").pop()}</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setConfirmFile(null)} disabled={deleting}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteConfirmed}
                                disabled={deleting}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

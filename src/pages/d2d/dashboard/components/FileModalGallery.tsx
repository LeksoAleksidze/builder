import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@d2d-ui/ui/dialog";
import { Button } from "@d2d-ui/ui/button";
import { Alert, AlertDescription } from "@d2d-ui/ui/alert";
import { Loader2, Upload, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
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
                <DialogContent className="dialog-content max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>File Gallery</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Upload Section */}
                        <div className="flex items-center gap-2.5 p-3 rounded-[0.625rem] border border-border/50 bg-muted/20">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="flex-1 text-[13px] text-foreground file:mr-2.5 file:py-1.5 file:px-3 file:rounded-[0.4rem] file:border-0 file:text-[12px] file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:transition-colors"
                            />
                            <Button
                                onClick={handleUpload}
                                disabled={loading || !file}
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shrink-0"
                            >
                                {loading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Upload className="h-3.5 w-3.5 mr-1" />
                                        Upload
                                    </>
                                )}
                            </Button>
                        </div>

                        {error && (
                            <Alert className="border-red-200/60 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30 rounded-[0.5rem]">
                                <AlertDescription className="text-red-700 dark:text-red-300 text-[13px]">{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* File List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-[13px] text-muted-foreground">Loading files...</span>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {files.length > 0 ? (
                                    files.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2.5 border border-border/40 rounded-[0.5rem] bg-card hover:bg-accent/40 transition-colors duration-100"
                                        >
                                            <div className="min-w-0 flex-1 mr-3">
                                                <div className="font-medium text-[13px] text-foreground truncate">
                                                    {item.url.split("/").pop()}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                    {item.createdAt}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button variant="outline" size="sm">
                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                        Open
                                                    </Button>
                                                </a>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200/60 dark:hover:bg-red-950/20 dark:hover:border-red-800/40"
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
                                    <div className="text-center py-10 text-muted-foreground text-[13px]">
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
                <DialogContent className="dialog-content max-w-sm" onPointerDownOutside={(e) => deleting && e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            Delete Confirmation
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-950/20 rounded-[0.5rem] border border-red-200/50 dark:border-red-800/30">
                            <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-[13px] font-medium text-red-800 dark:text-red-200">
                                    Are you sure?
                                </p>
                                <p className="text-[12px] text-red-600/80 dark:text-red-300/80 leading-relaxed">
                                    Delete <strong>{confirmFile?.url.split("/").pop()}</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-border/50">
                            <Button variant="outline" size="sm" onClick={() => setConfirmFile(null)} disabled={deleting}>
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleDeleteConfirmed}
                                disabled={deleting}
                                variant="destructive"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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

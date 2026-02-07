import React, { useEffect, useState } from "react";
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

    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modalWrapper}>
                <div style={styles.modal}>
                    {/* Header */}
                    <div style={styles.header}>
                        <h2>
                            <span role="img" aria-label="folder icon">📂</span> File Gallery
                        </h2>
                        <button onClick={onClose} style={styles.closeBtn}>
                            &times;
                        </button>
                    </div>

                    {/* Content */}
                    <div style={styles.modalContent}>
                        <div style={styles.uploadSection}>
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                style={styles.fileInput}
                            />
                            <button onClick={handleUpload} style={styles.uploadBtn} disabled={loading}>
                                ⬆️ Upload
                            </button>
                        </div>

                        {error && <p style={styles.error}>{error}</p>}

                        {loading ? (
                            <div style={styles.loading}>⏳ Loading files...</div>
                        ) : (
                            <div style={styles.fileList}>
                                {files.length > 0 ? (
                                    files.map((item, idx) => (
                                        <div key={idx} style={styles.fileCard}>
                                            <div>
                                                <strong style={styles.fileName}>{item.url.split("/").pop()}</strong>
                                                <div style={styles.date}>{item.createdAt}</div>
                                            </div>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={styles.link}
                                                >
                                                    Open
                                                </a>
                                                <button
                                                    onClick={() => confirmDelete(item)}
                                                    style={styles.deleteBtn}
                                                    disabled={loading}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={styles.emptyMessage}>No files uploaded yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {confirmFile && (
                <div style={styles.confirmOverlay}>
                    <div style={styles.confirmBox}>
                        <h3 style={{ marginBottom: "10px" }}>Are you sure?</h3>
                        <p style={{ color: "#555", marginBottom: "20px" }}>
                            Do you really want to delete <strong>{confirmFile.url.split("/").pop()}</strong>?<br />
                            This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                            <button
                                onClick={() => setConfirmFile(null)}
                                style={styles.cancelBtn}
                                disabled={deleting}
                            >
                                ❌ Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmed}
                                style={{
                                    ...styles.confirmDeleteBtn,
                                    opacity: deleting ? 0.7 : 1,
                                    cursor: deleting ? "not-allowed" : "pointer"
                                }}
                                disabled={deleting}
                            >
                                {deleting ? "⏳ Deleting..." : "🗑️ Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    overlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
    modalWrapper: { animation: "scaleIn 0.25s ease-in-out" },
    modal: { backgroundColor: "#fff", borderRadius: "16px", width: "580px", maxHeight: "85vh", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", overflow: "hidden" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 25px", borderBottom: "1px solid #e0e0e0" },
    closeBtn: { background: "linear-gradient(45deg, #ff6b6b, #f06595)", border: "none", fontSize: "24px", cursor: "pointer", color: "#fff", borderRadius: "50%", width: "36px", height: "36px" },
    modalContent: { padding: "20px 25px", overflowY: "auto" },
    uploadSection: { display: "flex", gap: "15px", alignItems: "center", marginBottom: "20px" },
    fileInput: { flex: 1, fontSize: "16px", border: "1px solid #ddd", borderRadius: "8px", padding: "10px" },
    uploadBtn: { backgroundColor: "#28a745", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" },
    deleteBtn: { backgroundColor: "#dc3545", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500" },
    link: { backgroundColor: "#007bff", color: "#fff", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "500" },
    error: { color: "#d9534f", fontSize: "14px", marginBottom: "15px", backgroundColor: "#fdd", padding: "10px", borderRadius: "8px" },
    fileList: { display: "flex", flexDirection: "column", gap: "12px" },
    fileCard: { padding: "15px", border: "1px solid #e0e0e0", borderRadius: "10px", backgroundColor: "#f9f9f9", display: "flex", justifyContent: "space-between", alignItems: "center" },
    fileName: { fontSize: "16px", color: "#333", maxWidth: "300px", overflow: "hidden", display: 'block' },
    date: { fontSize: "12px", color: "#888", marginTop: "4px" },
    emptyMessage: { textAlign: "center", padding: "30px", color: "#888", fontStyle: "italic", fontSize: "16px" },
    loading: { textAlign: "center", padding: "30px", fontSize: "18px", color: "#555" },
    confirmOverlay: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 },
    confirmBox: { backgroundColor: "#fff", borderRadius: "12px", padding: "30px 40px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", textAlign: "center", maxWidth: "400px" },
    cancelBtn: { backgroundColor: "#6c757d", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500" },
    confirmDeleteBtn: { backgroundColor: "#dc3545", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500" },
};

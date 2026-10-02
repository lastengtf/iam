"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
}

export interface AdminContextType {
  showToast: (message: string, type?: "success" | "info") => void;
  requestConfirm: (options: ConfirmOptions) => void;
}

const AdminContext = createContext<AdminContextType>({
  showToast: () => {},
  requestConfirm: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Konfirmasi",
    cancelLabel: "Batal",
    isDanger: false,
    onConfirm: () => {},
  });

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  const requestConfirm = (options: ConfirmOptions) => {
    setConfirmModal({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel || "Konfirmasi",
      cancelLabel: options.cancelLabel || "Batal",
      isDanger: options.isDanger ?? false,
      onConfirm: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        options.onConfirm();
      },
    });
  };

  return (
    <AdminContext.Provider value={{ showToast, requestConfirm }}>
      {children}

      {/* Global Toast Banner */}
      {notification && (
        <div className={`admin-toast-banner ${notification.type}`}>
          ✓ {notification.message}
        </div>
      )}

      {/* Global Confirmation Modal */}
      {confirmModal.isOpen && (
        <div
          className="admin-confirm-overlay"
          onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="admin-confirm-box"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-confirm-header">
              <div className={`admin-confirm-icon ${confirmModal.isDanger ? "danger" : ""}`}>
                {confirmModal.isDanger ? "⚠️" : "ℹ️"}
              </div>
              <div>
                <h3 className="admin-confirm-title">{confirmModal.title}</h3>
              </div>
            </div>

            <div className="admin-confirm-body">
              <p className="admin-confirm-message">{confirmModal.message}</p>
            </div>

            <div className="admin-confirm-footer">
              <button
                type="button"
                className="admin-confirm-cancel-btn"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              >
                {confirmModal.cancelLabel || "Batal"}
              </button>
              <button
                type="button"
                className={`admin-confirm-action-btn ${confirmModal.isDanger ? "danger" : ""}`}
                onClick={confirmModal.onConfirm}
              >
                {confirmModal.confirmLabel || "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
}

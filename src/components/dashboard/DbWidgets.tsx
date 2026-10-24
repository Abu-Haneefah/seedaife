// DbWidgets shell - full implementation deferred
import React from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export type DashboardShellProps = { children?: React.ReactNode };

export function EmptyState({ message = 'No data' }: { message?: string }) {
  return <div className="dashboard-empty">{message}</div>;
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-rows">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill status-${status}`}>{status}</span>;
}

export function ConfirmDialog({
  open, title, message, onCancel, onConfirm
}: {
  open: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button onClick={onCancel}>Cancel</button>
          <button className="dialog-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export function Pill({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) {
  return <span className={`pill pill-${variant}`}>{children}</span>;
}

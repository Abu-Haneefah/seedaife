// DashboardShell shell - full implementation deferred
import React from 'react';

export default function DashboardShell({ children }: { children?: React.ReactNode }) {
  return <div className="dashboard-shell">{children}</div>;
}

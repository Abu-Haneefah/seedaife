export function StatusPill({ status }: { status: string }) {
  const cls = "status-pill status-" + status;
  return <span className={cls}>{status}</span>;
}

// Small shared UI primitives for the Orbikt shell. Intentionally minimal and
// unopinionated; richer components (shadcn/ui) can layer on top later.

import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Integration status panel. Used where a module is external, prototype, or
 * pending — it states the integration source clearly instead of leaving an
 * empty placeholder or a TODO. This is the Blueprint-sanctioned way to show
 * "not yet wired" surfaces.
 */
export function IntegrationNotice({
  title,
  source,
  children,
  link,
}: {
  title: string;
  source: string;
  children?: ReactNode;
  link?: { label: string; url: string };
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-orbit-500" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        整合來源 · {source}
      </p>
      {children && (
        <div className="mt-3 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      )}
      {link && (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 rounded-lg bg-orbit-50 px-3 py-1.5 text-sm font-medium text-orbit-700 hover:bg-orbit-100"
        >
          {link.label}
          <span aria-hidden>↗</span>
        </a>
      )}
    </Card>
  );
}

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAdminAuditLogs } from '@/hooks/use-admin';

function formatDate(value?: string | null) {
  if (!value) return 'Unknown date';

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function prettyJson(value: any) {
  if (!value) return 'No metadata';

  try {
    if (typeof value === 'string') {
      return JSON.stringify(JSON.parse(value), null, 2);
    }

    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getActionLabel(action?: string) {
  if (!action) return 'Unknown action';

  return action
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminAuditLogsPage() {
  const { data: logs, isLoading, isError } = useAdminAuditLogs();

  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const auditLogs = useMemo(() => logs ?? [], [logs]);

  const entityTypes = useMemo(() => {
    return Array.from(
      new Set(
        auditLogs
          .map((log: any) => log.entityType)
          .filter(Boolean),
      ),
    ).sort();
  }, [auditLogs]);

  const actions = useMemo(() => {
    return Array.from(
      new Set(
        auditLogs
          .map((log: any) => log.action)
          .filter(Boolean),
      ),
    ).sort();
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return auditLogs.filter((log: any) => {
      const matchesEntity = entityFilter
        ? log.entityType === entityFilter
        : true;

      const matchesAction = actionFilter
        ? log.action === actionFilter
        : true;

      const text = [
        log.action,
        log.entityType,
        log.entityId,
        log.actorUserId,
        prettyJson(log.metadataJson),
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery = q ? text.includes(q) : true;

      return matchesEntity && matchesAction && matchesQuery;
    });
  }, [auditLogs, actionFilter, entityFilter, query]);

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Admin audit logs
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Audit logs
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-[#5F5A53]">
            Review important administrative actions such as user role changes,
            property approvals, blog changes, review moderation and content
            updates.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to admin dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">
                Total logs
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {isLoading ? '...' : auditLogs.length}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">
                Filtered
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {isLoading ? '...' : filteredLogs.length}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">
                Entity types
              </div>

              <div className="mt-3 text-4xl font-semibold text-[#1F2328]">
                {isLoading ? '...' : entityTypes.length}
              </div>
            </div>
          </div>

          {isError ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load audit logs.
            </div>
          ) : null}
        </section>

        <section className="rounded-[34px] border border-[#E8DED0] bg-white p-6 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px_260px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search action, entity, actor or metadata"
              className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none"
            />

            <select
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
              className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none"
            >
              <option value="">All entity types</option>
              {entityTypes.map((entity: any) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none"
            >
              <option value="">All actions</option>
              {actions.map((action: any) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="space-y-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9]"
              />
            ))
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log: any) => (
              <article
                key={log.id}
                className="rounded-[28px] border border-[#E8DED0] bg-white p-6 shadow-[0_18px_50px_rgba(31,35,40,0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#8A7660]">
                      {log.entityType ?? 'SYSTEM'}
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-[#1F2328]">
                      {getActionLabel(log.action)}
                    </h2>
                  </div>

                  <div className="rounded-full bg-[#FCFBF9] px-4 py-2 text-xs text-[#6F675F]">
                    {formatDate(log.createdAt)}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 text-sm text-[#5F5A53] md:grid-cols-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                      Actor user id
                    </div>

                    <div className="mt-2 break-all text-[#1F2328]">
                      {log.actorUserId ?? 'System'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                      Entity id
                    </div>

                    <div className="mt-2 break-all text-[#1F2328]">
                      {log.entityId ?? 'N/A'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#8A7660]">
                      Log id
                    </div>

                    <div className="mt-2 break-all text-[#1F2328]">
                      {log.id}
                    </div>
                  </div>
                </div>

                <details className="mt-5 rounded-[22px] bg-[#FCFBF9] p-5">
                  <summary className="cursor-pointer text-sm font-medium text-[#1F2328]">
                    Metadata
                  </summary>

                  <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#5F5A53]">
                    {prettyJson(log.metadataJson)}
                  </pre>
                </details>
              </article>
            ))
          ) : (
            <div className="rounded-[28px] border border-[#E8DED0] bg-[#FCFBF9] p-8 text-center text-sm text-[#5F5A53]">
              No audit logs found.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
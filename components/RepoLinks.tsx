/** Source repositories of this project, shown on every authenticated page. */
export const REPOS = [
  {
    label: "Frontend",
    hint: "Next.js · UI",
    href: "https://github.com/Wai-Theetat/ToC-Assignment-Front",
  },
  {
    label: "Backend",
    hint: "FastAPI · regex masking",
    href: "https://github.com/Wai-Theetat/ToC-Assignment-Back",
  },
] as const;

function GithubIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function RepoLinks({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {REPOS.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-[#7a9790] underline-offset-2 hover:text-[#147a60] hover:underline"
          >
            <GithubIcon />
            {label}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {REPOS.map(({ label, hint, href }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2.5 rounded-xl border border-[#e0ebe5] bg-white px-3 py-2.5 transition hover:border-[#c8ecd9] hover:bg-[#f5f9f7]"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f5f9f7] text-[#52716a]">
            <GithubIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.8125rem] font-semibold text-[#0d1f1c]">{label}</span>
            <span className="block truncate text-[0.7rem] text-[#7a9790]">{hint}</span>
          </span>
          <svg className="h-3.5 w-3.5 shrink-0 text-[#a0b5af]" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M6 3h7v7M13 3 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      ))}
    </div>
  );
}

/** Compact one-line footer variant, used under the auth forms. */
export function RepoLinksFooter() {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7a9790]">
      <span>Source:</span>
      {REPOS.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 font-medium text-[#52716a] underline-offset-2 hover:text-[#147a60] hover:underline"
        >
          <GithubIcon />
          {label} repo
        </a>
      ))}
    </p>
  );
}

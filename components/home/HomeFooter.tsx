import Image from 'next/image';

export function HomeFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-serif text-base text-foreground">Delphy</span>
          {' — it only ever asks.'}
        </p>

        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
            Powered by
          </span>
          <a
            href="https://agora.io/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            aria-label="Visit Agora's website"
          >
            <Image
              src="/agora-logo-rgb-blue.svg"
              alt="Agora"
              width={72}
              height={20}
              className="h-5 w-auto"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function HelpPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Help</h1>

      {/* Quick Start */}
      <section className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Quick Start</h2>
        <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
          <li>Go to <strong className="text-white">Settings</strong> and choose a preset structure (or create a blank tournament).</li>
          <li>Go to <strong className="text-white">Players</strong> to add everyone playing and assign them to seats.</li>
          <li>Go to <strong className="text-white">Prize</strong> to set buy-in amounts — the payout table fills in automatically.</li>
          <li>Return to <strong className="text-white">Timer</strong> and press <Kbd>Space</Kbd> (or the Play button) to start the clock.</li>
          <li>Optionally open a second browser tab to <code className="text-green-400">/remote</code> for a full-screen table clock.</li>
        </ol>
      </section>

      {/* Pages */}
      <section className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-4">
        <h2 className="text-lg font-semibold text-white">Pages</h2>

        <PageHelp title="Timer">
          The main view. Shows the current countdown, blind level, and upcoming blinds.
          Use the controls to start, pause, skip forward, or go back a level.
          A full-screen break overlay appears automatically when a break level starts.
        </PageHelp>

        <PageHelp title="Blinds">
          Edit the blind structure for the tournament. Each row is a level — you can set
          small blind, big blind, ante, and duration. Toggle <em>BBA</em> (Big Blind Ante)
          for a single ante paid by the big blind. Add break rows between play levels.
          Choose a built-in preset from the top to replace the current structure.
        </PageHelp>

        <PageHelp title="Players">
          Add players by name. Click a player to edit their info or record a rebuy / add-on.
          Use the <strong className="text-white">Eliminate</strong> button when a player busts —
          finishing positions are tracked automatically in reverse elimination order.
        </PageHelp>

        <PageHelp title="Tables">
          Assign players to physical table seats. Click any empty seat and choose a player
          from the list. Use <strong className="text-white">Auto-Balance</strong> to spread
          players evenly across tables, or <strong className="text-white">Consolidate</strong>
          to close a table when the field shrinks.
        </PageHelp>

        <PageHelp title="Prize">
          Set the buy-in, rebuy, and add-on amounts. Choose a rake (flat or percentage).
          The gross and net prize pool update live as players rebuy. The payout table
          scales automatically to the number of entrants — you can override the number of
          paid positions or individual percentages.
        </PageHelp>

        <PageHelp title="Settings">
          Configure tournament name, starting stack, and late registration cutoff.
          Pick an alert sound and adjust volume. Load or delete previously saved tournaments.
        </PageHelp>
      </section>

      {/* Keyboard shortcuts */}
      <section className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
        <p className="text-xs text-gray-500">Active on the Timer page.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Shortcut keys={['Space']}   label="Start / Pause timer" />
          <Shortcut keys={['→']}       label="Skip to next level" />
          <Shortcut keys={['←']}       label="Go to previous level" />
          <Shortcut keys={['+']}       label="Add 1 minute to current level" />
          <Shortcut keys={['-']}       label="Remove 1 minute from current level" />
        </div>
      </section>

      {/* Remote timer */}
      <section className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-2">
        <h2 className="text-lg font-semibold text-white">Remote Timer</h2>
        <p className="text-sm text-gray-300">
          Open <code className="text-green-400">/remote</code> in any other tab or window on
          the same device to get a full-screen, no-controls clock — ideal for a laptop propped
          at the poker table. The remote display syncs automatically via the browser's
          BroadcastChannel API; no network setup required.
        </p>
        <p className="text-sm text-gray-300">
          A QR code linking to the remote page is available at the bottom of the Timer view.
        </p>
      </section>

      {/* Persistence */}
      <section className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-2">
        <h2 className="text-lg font-semibold text-white">Saving &amp; Loading</h2>
        <p className="text-sm text-gray-300">
          Tournaments are saved automatically to your browser's local storage every few seconds.
          The <strong className="text-white">Settings</strong> page lists all saved tournaments —
          click one to load it, or delete tournaments you no longer need.
        </p>
        <p className="text-sm text-gray-300">
          Because saves are stored in the browser, clearing site data will erase them.
          Export is not yet supported but is planned for a future release.
        </p>
      </section>
    </div>
  );
}

/* ── Small helper components ─────────────────────────────────────────── */

function PageHelp({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-green-400">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{children}</p>
    </div>
  );
}

function Shortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </div>
      <span className="text-sm text-gray-300">{label}</span>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5
      rounded bg-gray-700 border border-gray-600 text-xs font-mono text-gray-200">
      {children}
    </kbd>
  );
}

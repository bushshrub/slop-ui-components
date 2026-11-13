import { useRef, useSyncExternalStore, type ReactNode } from 'react'
import { ConfirmModal } from './Modal'

export interface ConfirmOptions {
  /** The question, e.g. "Delete chat?". */
  title: ReactNode
  /** Muted line under the title. */
  description?: ReactNode
  /** Label of the confirming button, e.g. "Delete chat". Say what happens. */
  confirmLabel: string
  /** Uses the danger button and alertdialog role. */
  destructive?: boolean
  /** Longer content under the title. */
  body?: ReactNode
  /**
   * Runs when the user confirms, before the modal closes. If it returns a promise the buttons are held
   * until it settles; if it rejects the modal stays open.
   */
  onConfirm?: () => void | Promise<void>
}

interface Pending {
  options: ConfirmOptions
  resolve: (confirmed: boolean) => void
}

let pending: Pending | null = null
const listeners = new Set<() => void>()

function set(next: Pending | null) {
  pending = next
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Asks the user to confirm, from anywhere (event handlers, stores, code outside React). Resolves `true`
 * when they confirm and `false` when they cancel or dismiss. Needs one `<ConfirmHost />` mounted in the app.
 * A second call while one is open cancels the first.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  pending?.resolve(false)
  return new Promise((resolve) => set({ options, resolve }))
}

/** Mount once near the root of the app. Shows the modal for `confirm()`. */
export function ConfirmHost() {
  const current = useSyncExternalStore(subscribe, () => pending, () => null)
  // Keeps the text in place while the modal animates out
  const shown = useRef<ConfirmOptions | null>(null)
  if (current) shown.current = current.options
  const options = shown.current
  if (!options) return null
  const settle = (confirmed: boolean) => {
    if (!current) return
    current.resolve(confirmed)
    if (pending === current) set(null)
  }
  return (
    <ConfirmModal
      isOpen={current != null}
      onOpenChange={(open) => !open && settle(false)}
      title={options.title}
      description={options.description}
      confirmLabel={options.confirmLabel}
      destructive={options.destructive}
      onConfirm={async () => {
        await options.onConfirm?.()
        settle(true)
      }}
    >
      {options.body}
    </ConfirmModal>
  )
}

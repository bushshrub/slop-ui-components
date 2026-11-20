import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react'
import { Form } from 'react-aria-components'
import { useStrings } from '../../lib/strings'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { Modal, type ModalProps } from './Modal'

export interface FormDialogProps extends Omit<ModalProps, 'footer' | 'role' | 'children' | 'flush'> {
  /** Label of the submit button, e.g. "Create server". Say what happens. */
  submitLabel: string
  /** Label of the cancel button. Default "Cancel". */
  cancelLabel?: string
  /** Uses the danger button, for a form that deletes or revokes something. */
  destructive?: boolean
  /**
   * Called with the form's values when it is submitted and every field is valid. Return a promise to hold the
   * dialog open with a spinner on the submit button; it closes when the promise resolves. If it rejects, the
   * error's message shows above the fields and the dialog stays open to fix and retry.
   */
  onSubmit: (data: FormData) => void | Promise<void>
  /** The fields. Give each a `name`, which is its key in the FormData. */
  children: ReactNode
}

/**
 * A dialog holding a form: fields in the body, Cancel and a submit button at the bottom. Enter in a field submits;
 * required and invalid fields are flagged before `onSubmit` runs. Use inside `DialogTrigger` like Modal.
 */
export function FormDialog({ submitLabel, cancelLabel, destructive, onSubmit, children, ...props }: FormDialogProps) {
  const strings = useStrings()
  const id = useId()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  return (
    <Modal
      {...props}
      footer={(close) => (
        <>
          <Button onPress={close}>{cancelLabel ?? strings.cancel}</Button>
          <Button type="submit" form={id} variant={destructive ? 'danger' : 'primary'} isPending={pending}>
            {submitLabel}
          </Button>
        </>
      )}
    >
      {(close) => {
        const submit = async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          if (pending) return
          setPending(true)
          setError(undefined)
          try {
            await onSubmit(new FormData(e.currentTarget))
            close()
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
          } finally {
            setPending(false)
          }
        }
        return (
          <Form id={id} onSubmit={submit} className="flex flex-col gap-4">
            <ResetOnClose onClose={() => setError(undefined)} />
            {error && <Alert tone="danger">{error}</Alert>}
            {children}
          </Form>
        )
      }}
    </Modal>
  )
}

/** Clears the last error when the dialog closes, so it does not greet the next opening. */
function ResetOnClose({ onClose }: { onClose: () => void }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => onClose, [])
  return null
}

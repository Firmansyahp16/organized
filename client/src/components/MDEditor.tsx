import { useEffect, useRef } from "react";

type Props = {
  id: string;
  title: string;
  open: boolean;
  onClose: () => void;
  mutation: () => Promise<void>;
  children: React.ReactNode;
};

export function MDEditor({
  id,
  title,
  open,
  onClose,
  mutation,
  children,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog className="modal" id={id} ref={dialogRef} onClose={onClose}>
      <div className="modal-box min-w-1/6 max-w-full grid">
        <h3 className="font-bold text-lg text-center">{title}</h3>
        <div className="space-y-5">{children}</div>
        <div className="modal-action">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              await mutation();
              dialogRef.current?.close();
              onClose();
            }}
          >
            Save
          </button>
          <button
            className="btn btn-error btn-outline"
            onClick={() => {
              dialogRef.current?.close();
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

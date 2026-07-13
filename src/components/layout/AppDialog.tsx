import { useId, useRef } from 'react';
import { IconAlertTriangle, IconClose, IconInfo } from '../icons';
import { useModalAccessibility } from './useModalAccessibility';

export interface AppDialogRequest {
  title: string;
  message: string;
  tone?: 'default' | 'danger';
  confirmLabel?: string;
  cancelLabel?: string;
  copyText?: string;
  onConfirm?: () => void;
}

interface Props {
  request: AppDialogRequest;
  onClose: () => void;
}

export function AppDialog({ request, onClose }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const copyRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useModalAccessibility(true, onClose, request.copyText ? copyRef : undefined);

  const confirm = () => {
    onClose();
    request.onConfirm?.();
  };

  return (
    <div className="modal-overlay app-dialog-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal app-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`app-dialog-icon${request.tone === 'danger' ? ' app-dialog-icon-danger' : ''}`} aria-hidden="true">
          {request.tone === 'danger' ? <IconAlertTriangle size={20} /> : <IconInfo size={20} />}
        </div>
        <button className="product-selector-close app-dialog-close" onClick={onClose} title="Close" aria-label="Close dialog">
          <IconClose size={18} />
        </button>
        <h2 className="app-dialog-title" id={titleId}>{request.title}</h2>
        <p className="app-dialog-message" id={descriptionId}>{request.message}</p>
        {request.copyText && (
          <textarea
            ref={copyRef}
            className="app-dialog-copy-field"
            value={request.copyText}
            readOnly
            rows={4}
            aria-label="Share link"
            onFocus={(event) => event.currentTarget.select()}
          />
        )}
        <div className="app-dialog-actions">
          {(request.onConfirm || request.copyText) && (
            <button className="btn-secondary" onClick={onClose}>{request.cancelLabel ?? 'Cancel'}</button>
          )}
          {request.copyText ? (
            <button className="btn-primary" onClick={() => copyRef.current?.select()}>Select link</button>
          ) : request.onConfirm ? (
            <button className={request.tone === 'danger' ? 'btn-danger app-dialog-confirm' : 'btn-primary'} onClick={confirm}>
              {request.confirmLabel ?? 'Continue'}
            </button>
          ) : (
            <button className="btn-primary" onClick={onClose}>{request.confirmLabel ?? 'OK'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

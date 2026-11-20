import { useLingui } from '@lingui/react/macro';
import { Plus } from 'lucide-react';
import { use } from 'react';

import { Button } from '@/components/Button/Button';
import { Dialog } from '@/components/Dialog/Dialog';
import {
  type ItemActions,
  ItemActionsContext,
} from '@/features/lanyard/components/blocks/itemActions';
import { itemTitle } from '@/features/lanyard/components/blocks/itemTitle';
import { MediaBlock } from '@/features/lanyard/components/blocks/MediaBlock/MediaBlock';
import { hostOf } from '@/lib/normalise';
import { cn } from '@/lib/utils';

import {
  ADD_BUTTON,
  ADDING,
  useInPlaceEditing,
} from '../../hooks/useInPlaceEditing';
import type { MediaFields } from '../../hooks/useKeptRecordsDraft';
import { MediaForm } from '../MediaForm/MediaForm';
import { RecordEditActions } from '../RecordEditActions/RecordEditActions';
import * as styles from './MediaEditor.styles';
import type { MediaEditorProps } from './MediaEditor.types';

/** No show/hide controls: only when rendered outside the editor. */
const NO_ACTIONS: ItemActions = {
  isHidden: () => false,
  renderToggle: () => null,
};

/**
 * The Podcasts and videos block as the owner edits it (#118): each entry
 * is their own record, edited or added in a dialog and deleted in place.
 * Every change waits for Save.
 */
export function MediaEditor({
  items,
  records,
  disabled,
  talksUrl,
  className,
}: MediaEditorProps) {
  const { t, i18n } = useLingui();
  const parent = use(ItemActionsContext) ?? NO_ACTIONS;
  const { open, announcement, target, start, close, moveFocus } =
    useInPlaceEditing();
  const editing =
    open && open !== ADDING
      ? items.find((item) => item.key === open)
      : undefined;
  const nameOf = (fields: MediaFields) => fields.title || hostOf(fields.url);

  const actions: ItemActions = {
    ...parent,
    renderEdit: (itemKey, title) => (
      <RecordEditActions
        title={title}
        disabled={disabled}
        editRef={target(itemKey)}
        onEdit={() => start(itemKey)}
        onDelete={() => {
          records.removeMedia(itemKey);
          moveFocus(ADD_BUTTON, t`${title} deleted`);
        }}
      />
    ),
  };

  const editingTitle = editing ? itemTitle('media', editing, i18n) : '';
  const { key: _key, ...initial } = editing ?? { key: '' };

  return (
    <div className={cn(styles.editor, className)}>
      {items.length > 0 ? (
        <ItemActionsContext value={actions}>
          <MediaBlock items={items} />
        </ItemActionsContext>
      ) : (
        <p className={styles.empty}>{t`Nothing to show yet`}</p>
      )}
      <Button
        ref={target(ADD_BUTTON)}
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => start(ADDING)}
        className={styles.add}
      >
        <Plus aria-hidden="true" />
        {t`Add a podcast or video`}
      </Button>
      <Dialog
        open={open === ADDING || editing !== undefined}
        onOpenChange={(next) => {
          if (!next) close();
        }}
        title={editing ? t`Edit ${editingTitle}` : t`Add a podcast or video`}
      >
        <MediaForm
          talksUrl={talksUrl}
          initial={editing ? (initial as MediaFields) : undefined}
          disabled={disabled}
          onSubmit={(fields) => {
            const name = nameOf(fields);
            if (editing) {
              records.updateMedia(editing.key, fields);
              close(t`${name} updated`);
            } else {
              records.addMedia(fields);
              close(t`${name} added`);
            }
          }}
          onCancel={() => close()}
        />
      </Dialog>
      <p role="status" className={styles.announcer}>
        {announcement}
      </p>
    </div>
  );
}

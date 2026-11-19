import { useLingui } from '@lingui/react/macro';
import { Plus } from 'lucide-react';
import { use } from 'react';

import { Button } from '@/components/Button/Button';
import { MediaBlock } from '@/features/lanyard/components/blocks/MediaBlock/MediaBlock';
import {
  type ItemActions,
  ItemActionsContext,
} from '@/features/lanyard/components/blocks/itemActions';
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
 * The Media block as the owner edits it (#118): every podcast and video is
 * their own record, so each can be edited and deleted in place, and new
 * ones added below. Every change waits for Save.
 */
export function MediaEditor({
  items,
  records,
  disabled,
  className,
}: MediaEditorProps) {
  const { t } = useLingui();
  const parent = use(ItemActionsContext) ?? NO_ACTIONS;
  const { open, announcement, target, form, start, finish } =
    useInPlaceEditing();
  const byKey = new Map(items.map((item) => [item.key, item]));
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
          finish(ADD_BUTTON, t`${title} deleted`);
        }}
      />
    ),
    renderEditor: (itemKey) => {
      const item = byKey.get(itemKey);
      if (!item || open !== itemKey) return null;
      const { key: _key, ...initial } = item;
      return (
        <div ref={form} className={styles.form}>
          <MediaForm
            initial={initial}
            disabled={disabled}
            onSubmit={(fields) => {
              records.updateMedia(itemKey, fields);
              const name = nameOf(fields);
              finish(itemKey, t`${name} updated`);
            }}
            onCancel={() => finish(itemKey)}
          />
        </div>
      );
    },
  };

  return (
    <div className={cn(styles.editor, className)}>
      {items.length > 0 ? (
        <ItemActionsContext value={actions}>
          <MediaBlock items={items} />
        </ItemActionsContext>
      ) : (
        <p className={styles.empty}>{t`Nothing to show yet`}</p>
      )}
      {open === ADDING ? (
        <div ref={form} className={styles.form}>
          <MediaForm
            disabled={disabled}
            onSubmit={(fields) => {
              records.addMedia(fields);
              const name = nameOf(fields);
              finish(ADD_BUTTON, t`${name} added`);
            }}
            onCancel={() => finish(ADD_BUTTON)}
          />
        </div>
      ) : (
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
      )}
      <p role="status" className={styles.announcer}>
        {announcement}
      </p>
    </div>
  );
}

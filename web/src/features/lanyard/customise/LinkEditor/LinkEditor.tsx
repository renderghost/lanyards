import { useLingui } from '@lingui/react/macro';
import { Plus } from 'lucide-react';
import { use } from 'react';

import { Button } from '@/components/Button/Button';
import { LinksBlock } from '@/features/lanyard/components/blocks/LinksBlock/LinksBlock';
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
import type { LinkFields } from '../../hooks/useKeptRecordsDraft';
import { RecordEditActions } from '../RecordEditActions/RecordEditActions';
import { WebLinkForm } from '../WebLinkForm/WebLinkForm';
import * as styles from './LinkEditor.styles';
import type { LinkEditorProps } from './LinkEditor.types';

/** No show/hide controls: only when rendered outside the editor. */
const NO_ACTIONS: ItemActions = {
  isHidden: () => false,
  renderToggle: () => null,
};

/**
 * The Links block as the owner edits it (#118). Their own links can be
 * edited and deleted in place, and new ones added below; links from Sifa
 * and Bluesky can only be hidden here. Every change waits for Save.
 */
export function LinkEditor({
  items,
  records,
  disabled,
  className,
}: LinkEditorProps) {
  const { t } = useLingui();
  const parent = use(ItemActionsContext) ?? NO_ACTIONS;
  const { open, announcement, target, form, start, finish } =
    useInPlaceEditing();
  /** Each of the owner's own links' record key, by item key. */
  const own = new Map(
    items.flatMap((item) => (item.ownKey ? [[item.key, item.ownKey]] : []))
  );
  const fieldsOf = (recordKey: string): LinkFields | undefined => {
    const link = records.records.webLinks.find(
      (entry) => entry.key === recordKey
    );
    return link && { url: link.url, ...(link.title && { title: link.title }) };
  };
  const nameOf = (fields: LinkFields) => fields.title || hostOf(fields.url);

  const actions: ItemActions = {
    ...parent,
    renderEdit: (itemKey, title) => {
      const recordKey = own.get(itemKey);
      if (!recordKey) return null;
      return (
        <RecordEditActions
          title={title}
          disabled={disabled}
          editRef={target(recordKey)}
          onEdit={() => start(recordKey)}
          onDelete={() => {
            records.removeLink(recordKey);
            finish(ADD_BUTTON, t`${title} deleted`);
          }}
        />
      );
    },
    renderEditor: (itemKey) => {
      const recordKey = own.get(itemKey);
      const initial = recordKey ? fieldsOf(recordKey) : undefined;
      if (!recordKey || open !== recordKey || !initial) return null;
      return (
        <div ref={form} className={styles.form}>
          <WebLinkForm
            initial={initial}
            disabled={disabled}
            onSubmit={(fields) => {
              records.updateLink(recordKey, fields);
              const name = nameOf(fields);
              finish(recordKey, t`${name} updated`);
            }}
            onCancel={() => finish(recordKey)}
          />
        </div>
      );
    },
  };

  return (
    <div className={cn(styles.editor, className)}>
      {items.length > 0 ? (
        <ItemActionsContext value={actions}>
          <LinksBlock items={items} />
        </ItemActionsContext>
      ) : (
        <p className={styles.empty}>{t`Nothing to show yet`}</p>
      )}
      {open === ADDING ? (
        <div ref={form} className={styles.form}>
          <WebLinkForm
            disabled={disabled}
            onSubmit={(fields) => {
              records.addLink(fields);
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
          {t`Add a link`}
        </Button>
      )}
      <p role="status" className={styles.announcer}>
        {announcement}
      </p>
    </div>
  );
}

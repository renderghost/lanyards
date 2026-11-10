import { useCombobox } from 'downshift';
import { useEffect, useState } from 'react';

import { type HandleSuggestion, searchHandles } from '@/lib/atproto/typeahead';
import { cn } from '@/lib/utils';

import { TYPEAHEAD_DEBOUNCE_MS } from './HandleCombobox.constants';
import * as styles from './HandleCombobox.styles';
import type { HandleComboboxProps } from './HandleCombobox.types';

export function HandleCombobox({
  id,
  label,
  value,
  onChange,
  onBlur,
  onLookupError,
  hint,
  error,
  required,
  disabled,
  inputRef,
}: HandleComboboxProps) {
  const [items, setItems] = useState<HandleSuggestion[]>([]);

  useEffect(() => {
    // Each new value cancels the previous lookup, so a slow response for an
    // older query can never overwrite newer results.
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchHandles(value, controller.signal).then(
        (suggestions) => {
          if (!controller.signal.aborted) setItems(suggestions);
        },
        (lookupError: unknown) => {
          if (controller.signal.aborted) return;
          setItems([]);
          onLookupError?.(lookupError);
        }
      );
    }, TYPEAHEAD_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, onLookupError]);

  const {
    isOpen,
    highlightedIndex,
    getLabelProps,
    getInputProps,
    getMenuProps,
    getItemProps,
  } = useCombobox<HandleSuggestion>({
    items,
    inputId: id,
    inputValue: value,
    itemToString: (item) => item?.handle ?? '',
    onInputValueChange: ({ inputValue }) => onChange(inputValue ?? ''),
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) onChange(selectedItem.handle);
    },
  });

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  const showMenu = isOpen && items.length > 0;

  return (
    <div className={styles.field}>
      <label {...getLabelProps()} className={styles.label}>
        {label}
      </label>
      <div className={styles.anchor}>
        <input
          {...getInputProps({
            ref: inputRef,
            onBlur,
            disabled,
            required,
            type: 'text',
            autoComplete: 'username',
            autoCapitalize: 'none',
            autoCorrect: 'off',
            spellCheck: false,
            'aria-required': required || undefined,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': describedBy,
          })}
          className={cn(styles.input, error && styles.inputInvalid)}
        />
        <ul {...getMenuProps()} hidden={!showMenu} className={styles.menu}>
          {showMenu &&
            items.map((item, index) => (
              <li
                key={item.did}
                {...getItemProps({ item, index })}
                className={cn(
                  styles.option,
                  highlightedIndex === index && styles.optionActive
                )}
              >
                {item.avatar ? (
                  <img src={item.avatar} alt="" className={styles.avatar} />
                ) : (
                  <span className={styles.avatar} aria-hidden="true" />
                )}
                <span className={styles.names}>
                  {item.displayName && (
                    <span className={styles.displayName}>
                      {item.displayName}
                    </span>
                  )}
                  <span className={styles.handle}>@{item.handle}</span>
                </span>
              </li>
            ))}
        </ul>
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

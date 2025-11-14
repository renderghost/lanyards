'use client';

import { useState } from 'react';
import * as styles from './WorksSection.styles';
import { WorksSectionProps } from './WorksSection.types';
import { WORK_TYPES, EMPTY_STATE_TEXT } from './WorksSection.constants';

export const WorksSection: React.FC<WorksSectionProps> = ({
  works,
  onAdd,
  onDelete,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [doi, setDoi] = useState('');
  const [type, setType] = useState('journal-article');

  const handleAdd = () => {
    setDoi('');
    setType('journal-article');
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!doi.trim()) return;

    setIsSaving(true);
    try {
      await onAdd(doi.trim(), type);
      setIsAdding(false);
      setDoi('');
      setType('journal-article');
    } catch (error) {
      console.error('Error adding work:', error);
      // TODO: Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (workDoi: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) return;
    try {
      await onDelete(workDoi);
    } catch (error) {
      console.error('Error deleting work:', error);
    }
  };

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>
          Publications ({works.length})
        </h2>
        {!isAdding && (
          <button onClick={handleAdd} className={styles.addButton}>
            + Add DOI
          </button>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isAdding && (
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            {/* DOI */}
            <div className={styles.fieldGroup}>
              <label htmlFor="doi" className={styles.label}>
                DOI
              </label>
              <input
                id="doi"
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="e.g., 10.1038/nature12373"
                className={styles.input}
                autoFocus
              />
            </div>

            {/* Type */}
            <div className={styles.fieldGroup}>
              <label htmlFor="type" className={styles.label}>
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={styles.select}
              >
                {WORK_TYPES.map((workType) => (
                  <option key={workType.value} value={workType.value}>
                    {workType.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !doi.trim()}
                className={styles.addButton}
              >
                {isSaving ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {works.length === 0 && !isAdding ? (
          <p className={styles.emptyState}>{EMPTY_STATE_TEXT}</p>
        ) : (
          <div className={styles.worksList}>
            {works.map((work) => (
              <div key={work.doi} className={styles.workItem}>
                <div className={styles.workInfo}>
                  <p className={styles.workTitle}>
                    {work.title || work.doi}
                  </p>
                  {work.authors && work.authors.length > 0 && (
                    <p className={styles.workMeta}>
                      {work.authors.join(', ')}
                    </p>
                  )}
                  {(work.journal || work.publicationDate) && (
                    <p className={styles.workMeta}>
                      {[work.journal, work.publicationDate]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(work.doi)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

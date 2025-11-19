'use client';

import { useState } from 'react';
import * as styles from './BasicInfoSection.styles';
import { BasicInfoSectionProps, BasicInfoData } from './BasicInfoSection.types';
import {
  HONORIFIC_OPTIONS,
  EMPTY_STATE_TEXT,
} from './BasicInfoSection.constants';
import { HonorificValue } from '@/types';

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  honorifics = [],
  location,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [selectedHonorifics, setSelectedHonorifics] =
    useState<HonorificValue[]>(honorifics);
  const [country, setCountry] = useState(location?.country || '');
  const [city, setCity] = useState(location?.city || '');

  const hasData = honorifics.length > 0 || location;

  const handleEdit = () => {
    // Reset form to current values
    setSelectedHonorifics(honorifics);
    setCountry(location?.country || '');
    setCity(location?.city || '');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data: BasicInfoData = {
        honorifics: selectedHonorifics,
        location:
          country || city
            ? {
                country,
                city: city || undefined,
              }
            : undefined,
      };
      await onSave(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving basic info:', error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHonorific = (honorific: HonorificValue) => {
    setSelectedHonorifics((prev) =>
      prev.includes(honorific)
        ? prev.filter((h) => h !== honorific)
        : [...prev, honorific]
    );
  };

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Basic Information</h2>
        {!isEditing && (
          <button onClick={handleEdit} className={styles.editButton}>
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {/* Honorifics */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Honorifics</label>
            <div className={styles.checkboxGroup}>
              {HONORIFIC_OPTIONS.map((honorific) => (
                <label key={honorific} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedHonorifics.includes(honorific)}
                    onChange={() => toggleHonorific(honorific)}
                    className={styles.checkbox}
                  />
                  <span className="text-sm leading-tight">{honorific}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Country */}
          <div className={styles.fieldGroup}>
            <label htmlFor="country" className={styles.label}>
              Country (ISO Code)
            </label>
            <input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., US, GB, IE"
              className={styles.input}
              maxLength={2}
            />
          </div>

          {/* City */}
          <div className={styles.fieldGroup}>
            <label htmlFor="city" className={styles.label}>
              City (Optional)
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Dublin"
              className={styles.input}
            />
          </div>

          {/* Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={styles.editButton}
            >
              {isSaving ? 'Saving...' : 'Save'}
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
      ) : (
        <div className={styles.content}>
          {!hasData ? (
            <p className={styles.emptyState}>{EMPTY_STATE_TEXT}</p>
          ) : (
            <>
              {honorifics.length > 0 && (
                <p className={styles.infoItem}>
                  Honorifics: {honorifics.join(', ')}
                </p>
              )}
              {location && (
                <p className={styles.infoItem}>
                  Location:{' '}
                  {[location.city, location.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};

import { msg } from '@lingui/core/macro';

import type { OpenToValue } from '@/lib/sources/sifa/sifa.types';

export const OPEN_TO_LABELS: Record<OpenToValue, ReturnType<typeof msg>> = {
  fullTimeRoles: msg`Full-time roles`,
  partTimeRoles: msg`Part-time roles`,
  contractRoles: msg`Contract roles`,
  commissions: msg`Commissions`,
  boardPositions: msg`Board positions`,
  mentoringOthers: msg`Mentoring others`,
  beingMentored: msg`Being mentored`,
  collaborations: msg`Collaborations`,
  speakingEngagements: msg`Speaking engagements`,
};

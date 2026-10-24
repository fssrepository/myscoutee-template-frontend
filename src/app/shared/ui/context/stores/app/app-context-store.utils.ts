import type { HelpCenterRevisionDto } from '../../../../core/contracts/content/content.interface';

import type { HelpCenterStateDto } from '../../../../core/contracts/content/content.interface';
export function cloneHelpCenterState(state: HelpCenterStateDto): HelpCenterStateDto {
  return {
    activeRevision: state.activeRevision ? cloneHelpCenterRevision(state.activeRevision) : null,
    revisions: state.revisions.map(revision => cloneHelpCenterRevision(revision)),
    auditTrail: state.auditTrail.map(entry => ({ ...entry })),
    availableLanguages: state.availableLanguages.map(language => ({ ...language })),
    guideFields: state.guideFields.map(field => ({ ...field }))
  };
}

export function cloneHelpCenterRevision(revision: HelpCenterRevisionDto): HelpCenterRevisionDto {
  return {
    ...revision,
    sections: revision.sections.map(section => ({
      ...section,
      imageUrls: [...(section.imageUrls ?? [])],
      details: [...(section.details ?? [])],
      points: [...(section.points ?? [])]
    }))
  };
}

import { describe, it, expect, vi } from 'vitest';
import { EntryPageComponent } from './entry-page.component';

describe.each(['demo', 'firebase'] as const)('%s standalone MCP entry preserves current account consent', kind => {
 function context(consent: unknown) {
  return Object.assign(Object.create(EntryPageComponent.prototype), {
    location: { loadSavedCoordinates: vi.fn().mockResolvedValue(null) },
   route:{snapshot:{queryParamMap:new Map<string,string>([['redirect','/mcp/authorize']])}},
   session:{currentSession:()=>kind === 'demo' ? {kind,userId:'member'} : {kind,profile:{id:'firebase-id'}}},
   selector:{closeDemoBootstrapSelector:vi.fn()},
   users:{checkLocationEligibility:vi.fn().mockResolvedValue({eligible:true}),loadUserById:vi.fn().mockResolvedValue({id:'member',name:'Member'})},
   privacy:{activeRevision:()=>({id:'privacy',version:2}),loadConsent:vi.fn().mockResolvedValue(consent),syncAnonymousEntryConsent:vi.fn().mockResolvedValue(true)},
   router:{navigateByUrl:vi.fn().mockResolvedValue(true)}
  });
 }
 const finish=(value:unknown)=>(EntryPageComponent.prototype as unknown as {finishEntry:()=>Promise<void>}).finishEntry.call(value);
 it('does not overwrite current saved choices with browser entry choices',async()=>{
  const value=context({revisionId:'privacy',revisionVersion:2,source:'settings',approvedOptionalSectionIds:['optional']});
  await finish(value);
  expect(value.privacy.syncAnonymousEntryConsent).not.toHaveBeenCalled();expect(value.router.navigateByUrl).toHaveBeenCalledWith('/mcp/authorize');
 });
 it('initializes consent for an account that has none',async()=>{
  const value=context(null);await finish(value);
  expect(value.privacy.syncAnonymousEntryConsent).toHaveBeenCalledExactlyOnceWith('member',{id:'privacy',version:2});
 });
 it('requires acceptance after a new revision ID and keeps saved choices after accepting it',async()=>{
  const value=context({revisionId:'privacy-v1',revisionVersion:1,approvedOptionalSectionIds:['old-optional']});
  value.privacy.syncAnonymousEntryConsent.mockResolvedValue(false);
  await expect(finish(value)).rejects.toThrow('Consent required.');
  expect(value.router.navigateByUrl).not.toHaveBeenCalled();
  value.privacy.syncAnonymousEntryConsent.mockResolvedValue(true);
  await finish(value);
  expect(value.router.navigateByUrl).toHaveBeenCalledWith('/mcp/authorize');
  value.privacy.loadConsent.mockResolvedValue({revisionId:'privacy',revisionVersion:2,approvedOptionalSectionIds:[]});
  value.privacy.syncAnonymousEntryConsent.mockClear();
  await finish(value);
  expect(value.privacy.syncAnonymousEntryConsent).not.toHaveBeenCalled();
 });
 it('does not enter with an old consent and no acceptance of the current revision',async()=>{
  const value=context({revisionId:'privacy',revisionVersion:1});value.privacy.syncAnonymousEntryConsent.mockResolvedValue(false);
  await expect(finish(value)).rejects.toThrow('Consent required.');expect(value.router.navigateByUrl).not.toHaveBeenCalled();
 });
});

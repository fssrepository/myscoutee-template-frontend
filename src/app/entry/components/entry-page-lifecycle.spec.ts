import { signal } from '@angular/core';
import { describe, it, expect, vi } from 'vitest';
import { EntryPageComponent } from './entry-page.component';
import { UserDto } from '../../shared/core/contracts/accounts/user.interface';

describe('entry account lifecycle', () => {
 function fixture(status: UserDto['profileStatus']='deleted') {
  const user={...new UserDto(),id:'member',name:'Member',profileStatus:status,previousProfileStatus:'friends only',deletedAtIso:new Date().toISOString()};
  const context=Object.assign(Object.create(EntryPageComponent.prototype),{
   route:{snapshot:{queryParamMap:new Map<string,string>()}},
   session:{currentSession:()=>({kind:'demo',userId:'member'}),logout:vi.fn().mockResolvedValue(undefined)},
   users:{loadUserById:vi.fn().mockResolvedValue(user),saveUserProfile:vi.fn(async user=>user),checkLocationEligibility:vi.fn().mockResolvedValue({eligible:true})},
   selector:{closeDemoBootstrapSelector:vi.fn()},profiles:{setActiveUserId:vi.fn(),setActiveUserProfile:vi.fn()},
   privacy:{activeRevision:()=>({id:'privacy',version:1}),loadConsent:vi.fn().mockResolvedValue({revisionId:'privacy',revisionVersion:1})},
   dialogs:{open:vi.fn()},i18n:{translateParams:()=> 'Restore your account'},deployment:{branding:()=>({productName:'Templates'})},
   editor:{begin:vi.fn()},destroyRef:{destroyed:false},profileEditorHostComponent:signal(null),
   popupAdapters:{load:vi.fn().mockResolvedValue({ProfileEditorHostComponent:class {}})},injector:{get:vi.fn()},router:{navigateByUrl:vi.fn().mockResolvedValue(true)},error:signal('')
  });
  context.injector.get.mockReturnValue(context.editor);
  return {context,user};
 }
 it('waits for confirmation, restores the previous status and keeps the same account',async()=>{
  const {context,user}=fixture();const pending=context.finishEntry();
  await vi.waitFor(()=>expect(context.dialogs.open).toHaveBeenCalledOnce());
  expect(context.users.saveUserProfile).not.toHaveBeenCalled();expect(context.router.navigateByUrl).not.toHaveBeenCalled();
  await context.dialogs.open.mock.calls[0][0].onConfirm();await pending;
  expect(context.users.saveUserProfile).toHaveBeenCalledExactlyOnceWith({...user,profileStatus:'friends only',previousProfileStatus:null,deletedAtIso:null});
  expect(context.router.navigateByUrl).toHaveBeenCalledWith('/home');
 });
 it('cancel logs out without restoring; a failed save stays available for retry',async()=>{
  const {context}=fixture();const pending=context.finishEntry();
  await vi.waitFor(()=>expect(context.dialogs.open).toHaveBeenCalled());const dialog=context.dialogs.open.mock.calls[0][0];
  context.users.saveUserProfile.mockRejectedValueOnce(new Error('offline'));
  await expect(dialog.onConfirm()).rejects.toThrow('offline');expect(context.router.navigateByUrl).not.toHaveBeenCalled();
  await dialog.onCancel();await pending;expect(context.session.logout).toHaveBeenCalledOnce();expect(context.profiles.setActiveUserId).toHaveBeenCalledWith('');
 });
 it('does not offer reactivation after the native thirty-day window',async()=>{
  const {context,user}=fixture();user.deletedAtIso=new Date(Date.now()-31*86400000).toISOString();await context.finishEntry();
  expect(context.dialogs.open).not.toHaveBeenCalled();expect(context.users.saveUserProfile).not.toHaveBeenCalled();expect(context.session.logout).toHaveBeenCalledOnce();
 });
 it('restoring a blocked account does not turn it into an active member',async()=>{
  const {context,user}=fixture();user.previousProfileStatus='blocked';const pending=context.finishEntry();
  await vi.waitFor(()=>expect(context.dialogs.open).toHaveBeenCalled());await context.dialogs.open.mock.calls[0][0].onConfirm();await pending;
  expect(context.users.saveUserProfile.mock.calls[0][0].profileStatus).toBe('blocked');expect(context.router.navigateByUrl).not.toHaveBeenCalled();expect(context.session.logout).toHaveBeenCalledOnce();
 });
 it('opens the small onboarding form without a write and enters only after its save',async()=>{
  const {context,user}=fixture('onboarding');await context.finishEntry();
  expect(context.users.saveUserProfile).not.toHaveBeenCalled();expect(context.router.navigateByUrl).not.toHaveBeenCalled();
  expect(context.editor.begin).toHaveBeenCalledOnce();await context.editor.begin.mock.calls[0][0].onSaved({...user,profileStatus:'public'});
  expect(context.router.navigateByUrl).toHaveBeenCalledWith('/home');
 });
 it('retains the MCP consent request after login and ignores external redirect targets',async()=>{
  const {context}=fixture('public');
  const target='/mcp/authorize?client_id=client&state=retained';context.route.snapshot.queryParamMap.set('redirect',target);
  await context.finishEntry();expect(context.router.navigateByUrl).toHaveBeenLastCalledWith(target);
  for(const unsafe of ['https://example.test','//example.test','/entry','/home/../../outside']){
   context.route.snapshot.queryParamMap.set('redirect',unsafe);await context.finishEntry();expect(context.router.navigateByUrl).toHaveBeenLastCalledWith('/home');
  }
 });
 it('hydrates the profile and checks consent before a local MCP authorization redirect',async()=>{
  const {context,user}=fixture('public');
  context.localMode=true;context.users.peekCachedUserById=vi.fn(()=>user);
  context.route.snapshot.queryParamMap.set('redirect','/mcp/authorize?client_id=client');
  await context.finishEntry();
  expect(context.users.loadUserById).toHaveBeenCalledExactlyOnceWith('member');
  expect(context.privacy.loadConsent).toHaveBeenCalledExactlyOnceWith('member','privacy',1);
  expect(context.router.navigateByUrl).toHaveBeenCalledWith('/mcp/authorize?client_id=client');
 });

});

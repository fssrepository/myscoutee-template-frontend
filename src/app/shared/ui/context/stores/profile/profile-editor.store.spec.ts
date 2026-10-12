import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileEditorStore } from './profile-editor.store';
import { UserProfileStore } from './user-profile.store';
import { UsersService } from '../../../../core/base/services/accounts/users.service';
import { UserDto } from '../../../../core/contracts/accounts/user.interface';

describe('minimal profile editing', () => {
 let editor: ProfileEditorStore, profiles: UserProfileStore;
 const save = vi.fn();
 beforeEach(() => {
  TestBed.resetTestingModule(); save.mockReset();
  TestBed.configureTestingModule({providers:[{provide:UsersService,useValue:{saveUserProfile:save}}]});
  profiles=TestBed.inject(UserProfileStore); editor=TestBed.inject(ProfileEditorStore);
  profiles.setActiveUserProfile({...new UserDto(),id:'a',name:'Alex Morgan',city:'Berlin',images:['original'],
   locationCoordinates:{latitude:52.52,longitude:13.4},notificationPreferences:{muted:true},
   notificationDevices:[{deviceId:'device-a',notificationsEnabled:true}],activities:{chats:4}});
 });
 it('changes only the edited fields and keeps the latest stored counters and hidden profile values', async () => {
  editor.begin(); editor.draft.set({name:'  New Name  ',images:['replacement']});
  const current={...profiles.activeUserProfile()!,activities:{chats:5}};
  profiles.setUserProfile(current); save.mockResolvedValue(current);
  await editor.save();
  expect(save).toHaveBeenCalledExactlyOnceWith({...current,name:'New Name',initials:'NN',images:['replacement']});
  expect(editor.open()).toBe(false);
 });
 it('cancel does not mutate stored data; an empty image list is saved as removal', async () => {
  editor.begin();editor.draft.set({name:'Discard',images:[]});editor.close();
  expect(profiles.activeUserProfile()?.name).toBe('Alex Morgan');expect(save).not.toHaveBeenCalled();
  editor.begin();expect(editor.draft().images).toEqual(['original']);
  editor.draft.update(draft=>({...draft,images:[]}));save.mockResolvedValue(profiles.activeUserProfile());await editor.save();
  expect(save.mock.calls[0][0].images).toEqual([]);
 });
 it('blocks save during upload and prevents a draft from saving to another active account', async () => {
  editor.begin();editor.uploading.set(true);await editor.save();editor.close();
  expect(save).not.toHaveBeenCalled();expect(editor.open()).toBe(true);
  editor.uploading.set(false);profiles.setActiveUserProfile({...new UserDto(),id:'b',name:'Sam'});await editor.save();
  TestBed.tick();
  expect(save).not.toHaveBeenCalled();
  expect(editor.open()).toBe(false);expect(editor.draft()).toEqual({name:'',images:[]});
 });
 it('preserves a failed draft for retry and rejects blank names', async () => {
  editor.begin();editor.draft.set({name:' ',images:[]});await editor.save();expect(save).not.toHaveBeenCalled();
  editor.draft.set({name:'New Name',images:[]});save.mockRejectedValueOnce(new Error('offline'));await editor.save();
  expect(editor.open()).toBe(true);expect(editor.error()).toBe('profile.save.failed');expect(editor.saving()).toBe(false);
  save.mockResolvedValue(profiles.activeUserProfile());await editor.save();expect(editor.open()).toBe(false);
 });
 it('completes onboarding only after explicit save and clears its purge timestamp', async () => {
  profiles.setActiveUserProfile({...profiles.activeUserProfile()!,profileStatus:'onboarding',deletedAtIso:'2026-10-11T00:00:00Z'});
  const onSaved=vi.fn().mockResolvedValue(undefined),onCancel=vi.fn().mockResolvedValue(undefined);
  editor.begin({onSaved,onCancel});expect(save).not.toHaveBeenCalled();
  save.mockImplementation(async value=>value);await editor.save();
  expect(save.mock.calls[0][0]).toMatchObject({profileStatus:'public',deletedAtIso:null});
  expect(onSaved).toHaveBeenCalledOnce();expect(onCancel).not.toHaveBeenCalled();
 });
 it('cancels onboarding without publishing or clearing its retained draft', async () => {
  profiles.setActiveUserProfile({...profiles.activeUserProfile()!,profileStatus:'onboarding'});
  const onSaved=vi.fn().mockResolvedValue(undefined),onCancel=vi.fn().mockResolvedValue(undefined);
  editor.begin({onSaved,onCancel});editor.close();
  expect(save).not.toHaveBeenCalled();expect(onSaved).not.toHaveBeenCalled();expect(onCancel).toHaveBeenCalledOnce();
  expect(profiles.activeUserProfile()?.profileStatus).toBe('onboarding');
 });

});

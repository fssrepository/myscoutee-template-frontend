import { TestBed } from '@angular/core/testing';
import { LocalMemoryDb } from '../../../../common/app.db';
import type { AppMemorySchema } from '../../../common/memory.schema';
import { UserDto } from '../../../../contracts/accounts/user.interface';
import type { NotificationRecord } from '../../entity/notifications/notification.entity';
import { LocalNotificationsRepository } from './notifications.repository';

describe('selected native notification mutations',()=>{
 let state:AppMemorySchema,repo:LocalNotificationsRepository;
 const notification=(id:string,recipientUserId='alice'):NotificationRecord=>({id,recipientUserId,kind:'chat-message',category:'chat',title:'Message',message:id,createdAtIso:'2026-10-11T10:00:00Z',sourceType:'chat',sourceId:'chat',payload:{messageId:id},revision:1});
 beforeEach(()=>{
  state={users:{ids:['alice','bob'],byId:{alice:{...new UserDto(),id:'alice'},bob:{...new UserDto(),id:'bob'}}},notifications:{byId:{},ids:[],idsByRecipientUserId:{},mutedByUserId:{},seededUserIds:[]}} as unknown as AppMemorySchema;
  TestBed.configureTestingModule({providers:[{provide:LocalMemoryDb,useValue:{read:()=>state,write:(fn:(state:AppMemorySchema)=>AppMemorySchema)=>state=fn(state)}}]});
  repo=TestBed.inject(LocalNotificationsRepository);
 });
 afterEach(()=>TestBed.resetTestingModule());
 it('keeps retries idempotent and forbids reading another account notification',()=>{
  repo.append([notification('a'),notification('a'),notification('b','bob')]);
  expect(repo.unreadCount('alice')).toBe(1);expect(state.users.byId['alice'].activities.notifications).toBe(1);
  expect(repo.markRead('bob','a')).toBeNull();
  repo.markRead('alice','a');repo.markRead('alice','a');
  expect(repo.unreadCount('alice')).toBe(0);expect(repo.unreadCount('bob')).toBe(1);
 });
 it('keeps stable cursor pages and reconciles read rows through delta sync',()=>{
  repo.append([notification('a'),notification('b'),notification('c')]);
  const first=repo.queryPage('alice',{page:0,pageSize:2,filters:{bucket:'new'}});
  const next=repo.queryPage('alice',{page:1,pageSize:2,cursor:first.nextCursor,filters:{bucket:'new'}});
  expect(new Set([...first.records,...next.records].map(x=>x.id)).size).toBe(3);
  const read=first.records[0];repo.markRead('alice',read.id);
  const delta=repo.sync('alice',{bucket:'new',limit:2,knownItems:first.records.map(x=>({id:x.id,revision:x.revision??1})),loadedTail:null});
  expect(delta.removedIds).toContain(read.id);expect(delta.total).toBe(2);expect(delta.unreadCount).toBe(2);
 });
 it('marks only the matching chat message and preserves other notifications',()=>{
  repo.append([notification('a'),notification('b'),{...notification('c'),sourceId:'other-chat'}]);
  repo.markUnreadBySource('alice','chat-message','chat','chat',['a']);
  expect(repo.isUnread('alice','a')).toBe(false);expect(repo.isUnread('alice','b')).toBe(true);
  repo.markUnreadBySource('alice','chat-message','chat','chat');
  expect(repo.unreadCount('alice')).toBe(1);expect(repo.isUnread('alice','c')).toBe(true);
 });
 it('muting changes preferences without deleting rows or their unread count',()=>{
  repo.append([notification('a')]);repo.setMuted('alice',true);
  expect(repo.muted('alice')).toBe(true);expect(state.users.byId['alice'].notificationPreferences?.muted).toBe(true);
  expect(repo.unreadCount('alice')).toBe(1);expect(repo.queryPage('alice',{page:0,pageSize:20,filters:{bucket:'new'}}).records).toHaveLength(1);
 });
});

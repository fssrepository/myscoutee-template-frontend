import { TestBed } from '@angular/core/testing';
import { LocalMemoryDb } from '../../../../common/app.db';
import { UserDto } from '../../../../contracts/accounts/user.interface';
import type { ChatMessageDto } from '../../../../contracts/chat/chat.interface';
import type { AppMemorySchema } from '../../../common/memory.schema';
import { SeedChatsRepository } from '../../../seed/repositories/chat/chats-seed.repository';
import { LocalChatsRepository } from './chats.repository';
import users from '../../../seed/data/users.json';

describe('selected native personal chat persistence',()=>{
 const first='100000000000000000000001',second='100000000000000000000002';
 let state:AppMemorySchema,repository:LocalChatsRepository;
 beforeEach(()=>{
  state={notifications:{byId:{},ids:[],idsByRecipientUserId:{},mutedByUserId:{},seededUserIds:[]},users:{ids:users.map(user=>user.id),byId:Object.fromEntries(users.map(user=>[user.id,{...new UserDto(),...user} as UserDto]))},chats:{byId:{},ids:[]},chatMessages:{byId:{},ids:[],idsByChatKey:{}},contacts:{chatAccessById:{}},sampleCards:{byId:{},ids:[]},helpCenter:{} as AppMemorySchema['helpCenter']};
  TestBed.configureTestingModule({providers:[{provide:LocalMemoryDb,useValue:{read:()=>state,write:(update:(value:AppMemorySchema)=>AppMemorySchema)=>{state=update(state);},flushToIndexedDb:()=>Promise.resolve()}}]});
  TestBed.inject(SeedChatsRepository).seedDefaults();repository=TestBed.inject(LocalChatsRepository);
 });
 afterEach(()=>TestBed.resetTestingModule());
 function chat(actor=first){return repository.queryActivitiesChatPage(actor,{page:0,pageSize:20}).items[0];}
 function message(id='owned-message'):ChatMessageDto{return{id,clientId:id,sender:'Alex Morgan',senderAvatar:{id:first,initials:'AM',gender:'man'},text:'Saved message',time:'12:00',sentAtIso:'2026-10-11T10:00:00Z',mine:true,readBy:[]};}
 it('seeds identical participant histories once and keeps changed messages on re-entry',()=>{
  expect(repository.queryChatMessagesPage(chat(),{page:0,pageSize:50}).items).toHaveLength(2);
  repository.appendChatMessage(chat(),message());
  TestBed.inject(SeedChatsRepository).seedDefaults();
  expect(repository.queryChatMessagesPage(chat(),{page:0,pageSize:50}).items).toHaveLength(3);
  expect(repository.queryChatMessagesPage(chat(second),{page:0,pageSize:50}).items).toHaveLength(3);
 });
 it('does not duplicate a retry and does not allow a peer to edit the sender message',()=>{
  repository.appendChatMessage(chat(),message());repository.appendChatMessage(chat(),message());
  expect(repository.queryChatMessagesPage(chat(),{page:0,pageSize:50}).items).toHaveLength(3);
  expect(()=>repository.updateChatMessage(chat(second),'owned-message',{text:'Not mine'})).toThrow('Forbidden');
 });
 it('propagates edits, read receipts and deletion to both owner copies',()=>{
  repository.appendChatMessage(chat(),message());
  repository.updateChatMessage(chat(),'owned-message',{text:'Edited'});
  expect(repository.queryChatMessagesPage(chat(second),{page:0,pageSize:50}).items.find(item=>item.id==='owned-message')?.text).toBe('Edited');
  repository.markChatRead(chat(second),second,['owned-message']);
  expect(repository.queryChatMessagesPage(chat(),{page:0,pageSize:50}).items.find(item=>item.id==='owned-message')?.readBy.map(reader=>reader.id)).toContain(second);
  repository.updateChatMessage(chat(),'owned-message',{deleted:true});
  for(const actor of [first,second]){
   const deleted=repository.queryChatMessagesPage(chat(actor),{page:0,pageSize:50}).items.find(item=>item.id==='owned-message');
   expect(deleted?.deletedAtIso).toBeTruthy();expect(deleted?.text).toBe('');
  }
 });
 it('keeps consent required for direct messages and keeps another account outside the conversation',()=>{
  expect(repository.queryChatItemById('100000000000000000000003',chat().id)).toBeNull();
  state.contacts.chatAccessById={};
  expect(()=>repository.appendChatMessage(chat(),message())).toThrow('requires approval');
 });
});

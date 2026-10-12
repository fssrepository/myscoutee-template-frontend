import { Injectable, inject } from '@angular/core';
import { LocalMemoryDb } from '../../../../common/app.db';
import { LocalChatThreadMapper } from '../../../source/mappers/chat/chat-thread.mapper';
import { LocalChatMessageMapper } from '../../../source/mappers/chat/chat-message.mapper';
import type { ChatMessageDto } from '../../../../contracts/chat/chat.interface';
import type { ContactChatAccessRecord } from '../../../source/entity/accounts/profile.entity';
import chats from '../../data/chats.json';
import messages from '../../data/chatMessages.json';
import access from '../../data/contactChatAccess.json';
@Injectable({providedIn:'root'})
export class SeedChatsRepository {
 private readonly db=inject(LocalMemoryDb);
 seedDefaults():void {
  const state=this.db.read();
  const next={...state,chats:structuredClone(state.chats),chatMessages:structuredClone(state.chatMessages),contacts:structuredClone(state.contacts)};
  for(const {_id,...chat} of chats) {
   const key=LocalChatThreadMapper.buildRecordKey(chat.ownerUserId,chat.id);
   if(next.chats.byId[key]) continue;
   next.chats.byId[key]={...chat, channelType:'contact'};
   next.chats.ids.push(key);
   for(const message of messages.filter(message=>message.chatId===chat.id)) {
    const dto:ChatMessageDto={...message, mine:message.senderAvatar.id===chat.ownerUserId,
     senderAvatar:{...message.senderAvatar,gender:state.users.byId[message.senderAvatar.id].gender},
     readBy:message.readBy.map(reader=>({...reader,gender:state.users.byId[reader.id].gender}))};
    const record=LocalChatMessageMapper.toRecord(chat.ownerUserId,chat.id,dto);
    const chatKey=LocalChatMessageMapper.chatKey(chat.ownerUserId,chat.id);
    next.chatMessages.byId[record.recordId]=record;
    next.chatMessages.ids.push(record.recordId);
    (next.chatMessages.idsByChatKey[chatKey]??=[]).push(record.recordId);
   }
  }
  for(const {_id,...record} of access) {
   if(!next.contacts.chatAccessById?.[_id]) (next.contacts.chatAccessById??={})[_id]={...record,id:_id} as ContactChatAccessRecord;
  }
  this.db.write(()=>next);
 }
}

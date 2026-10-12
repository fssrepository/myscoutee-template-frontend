import type { ChatCallRequest } from '../../../../contracts/chat/chat-call.interface';
import { Injectable, inject } from '@angular/core';
import { UiDateUtils, type ListQuery } from '@fssrepository/myscoutee-components';
import { AppUtils } from '../../../../base/app-utils';
import { RouteDelayService } from '../../../../base/services/platform/route-delay.service';
import { LocalChatsRepository } from '../../repositories/chat/chats.repository';
import { LocalUsersRepository } from '../../repositories/accounts/users.repository';
import { LocalNotificationsRepository } from '../../repositories/notifications/notifications.repository';
import { LocalChatThreadMapper } from '../../mappers/chat/chat-thread.mapper';
import { UserProfileStore } from '../../../../../ui/context/stores/profile/user-profile.store';
import type { ChatThreadRecord } from '../../entity/chat/chat.entity';
import type { ChatDTO, ChatMessageDto, ChatMessageAttachment, ChatMessageMutation, ChatLiveEvent, ChatFeedFilters, ChatReadReceipt } from '../../../../contracts';
@Injectable({providedIn:'root'})
export class LocalChatsService {
 private readonly chats=inject(LocalChatsRepository);
 private readonly users=inject(LocalUsersRepository);
 private readonly notifications=inject(LocalNotificationsRepository);
 private readonly profiles=inject(UserProfileStore);
 private readonly delay=inject(RouteDelayService);
 private async ready():Promise<string> {
  const actor=this.profiles.activeUserId();
  await this.delay.waitForRouteDelay('/activities/chats');
  if(!actor || actor!==this.profiles.activeUserId()) throw new Error('Chat session changed');
  return actor;
 }
 async queryActivitiesChatPage(userId:string,query:ListQuery<ChatFeedFilters>,signal?:AbortSignal) {
  const actor=await this.ready();signal?.throwIfAborted();
  if(userId!==actor) throw new Error('Chat session changed');
  const page=this.chats.queryActivitiesChatPage(actor,query);
  return {...LocalChatThreadMapper.toDtoPage(page),items:this.chatDtosWithMembers(page.items)};
 }
 async queryChatById(chatId:string):Promise<ChatDTO|null> {
  const actor=await this.ready(), record=this.chats.queryChatItemById(actor,chatId);
  return record ? this.chatDtosWithMembers([record])[0] : null;
 }
 private chatDtosWithMembers(records:readonly ChatThreadRecord[]):ChatDTO[] {
  const usersById=new Map(this.users.queryAllUsers().map(user=>[user.id,user]));
  return LocalChatThreadMapper.toDtoList(records).map(dto=>({...dto,
   members:[...new Set((dto.memberIds??[]).map(id=>id.trim()).filter(Boolean))].flatMap(id=>{
    const user=usersById.get(id);
    if(!user)return [];
    const name=user.name.trim()||id;
    const gender=user.gender;
    return [{id,name,initials:user.initials.trim()||AppUtils.initialsFromText(name),gender,imageUrl:AppUtils.firstImageUrl(user.images)}];
   })
  }));
 }
 async queryChatMessagesPage(chat:ChatDTO,query:ListQuery) {
  const actor=await this.ready(),record=this.chats.queryChatItemById(actor,chat.id);
  if(!record) throw new Error('Chat unavailable');
  const page=this.chats.queryChatMessagesPage(record,query);
  const unread=page.items.filter(message=>!message.mine&&!message.readBy.some(reader=>reader.id===actor)).map(message=>message.id);
  const readReceipt=await this.markReadInRepository(record,actor,unread,!query.cursor&&query.page===0);
  return {...page,readReceipt,notificationUnread:this.notifications.unreadCount(actor)};
 }
 async sendChatMessage(chat:ChatDTO,text:string,clientId?:string):Promise<ChatMessageDto|null> {
  return this.sendChatMessageWithAttachments(chat,text,[],clientId);
 }
 async sendChatMessageWithAttachments(chat:ChatDTO,text:string,attachments:readonly ChatMessageAttachment[],clientId?:string,replyTo?:ChatMessageDto['replyTo']):Promise<ChatMessageDto|null> {
  const actor=await this.ready(), record=this.chats.queryChatItemById(actor,chat.id), user=this.users.queryUserById(actor);
  if(!record||!user) throw new Error('Chat unavailable');
  const normalized=AppUtils.convertAsciiEmojis(text.trim());
  if(!normalized&&!attachments.length) return null;
  const now=new Date();
  const saved=this.chats.appendChatMessage(record,{
   id:clientId??crypto.randomUUID(),clientId,sender:user.name,
   senderAvatar:{id:actor,initials:user.initials,gender:user.gender,imageUrl:user.images?.[0]??null},
   text:normalized,time:now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),sentAtIso:UiDateUtils.toIsoDateTime(now),mine:true,readBy:[],attachments:attachments.map(attachment=>({...attachment})),replyTo:replyTo?{...replyTo}:null
  });
  await this.chats.flushToIndexedDb();return saved;
 }
 async updateChatMessage(chat:ChatDTO,messageId:string,mutation:ChatMessageMutation):Promise<ChatMessageDto|null> {
  const actor=await this.ready(),record=this.chats.queryChatItemById(actor,chat.id);
  if(!record) throw new Error('Chat unavailable');
  const normalized=typeof mutation.text==='string'?{...mutation,text:AppUtils.convertAsciiEmojis(mutation.text.trim())}:mutation;
  const saved=this.chats.updateChatMessage(record,messageId,normalized);
  await this.chats.flushToIndexedDb();return saved;
 }
 async markChatRead(chat:ChatDTO,messageIds:readonly string[]):Promise<ChatReadReceipt|null> {
  const actor=await this.ready(),record=this.chats.queryChatItemById(actor,chat.id);
  if(!record) throw new Error('Chat unavailable');
  return this.markReadInRepository(record,actor,messageIds);
 }
 private async markReadInRepository(chat:ChatDTO,actor:string,messageIds:readonly string[],wholeChannel=false):Promise<ChatReadReceipt|null> {
  const read=this.chats.markChatRead(chat,actor,messageIds,wholeChannel);
  if(!read) return null;
  this.notifications.markUnreadBySource(actor,'chat-message','chat',chat.id,wholeChannel?undefined:read.messageIds);
  await this.chats.flushToIndexedDb();
  return {userId:read.reader.id,userInitials:read.reader.initials,userGender:read.reader.gender,userImageUrl:read.reader.imageUrl,messageIds:read.messageIds,readAtIso:read.readAtIso,unread:read.unread};
 }
 async sendChatTyping(_chat:ChatDTO,_typing:boolean):Promise<void>{return;}
 async sendChatCall(_chat:ChatDTO,_request:ChatCallRequest):Promise<void>{throw new Error('Calls require a backend-connected chat session.');}
 // The native local adapter has no backend WebSocket; the UI applies its own completed writes.
 async watchChatEvents(_chat:ChatDTO,_listener:(event:ChatLiveEvent)=>void):Promise<()=>void>{return ()=>{};}
}

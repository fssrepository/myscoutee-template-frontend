import { MatIconModule } from '@angular/material/icon';
import { ActivityChatSingleRowConverter } from '../../../shared/ui/converters/chat/activity-chat-single-row.converter';
import { AppRuntimeStore } from '../../../shared/ui/context/stores/app/app-runtime.store';
import { Component, computed, effect, inject, ElementRef, EventEmitter, Output, OnDestroy, signal, untracked, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NotificationCenterStore } from '../../../shared/ui/context/stores/notification/notification-center.store';
import { FormsModule } from '@angular/forms';
import { defer, from, of } from 'rxjs';
import { SmartListComponent, SingleRowComponent, I18nPipe, UiDateUtils, AppMenuComponent, AppMenuTriggerComponent, PopupComponent, DialogStore, type PopupModel, type AppMenuTrigger, type AppMenuItemSelectEvent, type AppMenuModel, type SmartListConfig, type SmartListLoadPage, type SingleRowData } from '@fssrepository/myscoutee-components';
import type { ChatDTO, ChatMessageDto, ChatLiveEvent, ChatReadReceipt, ChatMessageMutation, ChatTypingIndicator } from '../../../shared/core/contracts';
import { ChatsService } from '../../../shared/core/base/services/chat/chats.service';
import { UserProfileStore } from '../../../shared/ui/context/stores/profile/user-profile.store';
import { ChatCallService } from '../../../shared/core/base/services/chat/chat-call.service';
import { ChatCallPopupComponent } from '../../../shared/ui/components/chat-call-popup/chat-call-popup.component';
import { ChatMessageMenuConverter, type ChatMessageMenuContext } from '../../../shared/ui/converters/chat/chat-message-menu.converter';
import { AppUtils } from '../../../shared/core/base/app-utils';
@Component({selector:'app-template-chat',standalone:true,imports:[MatIconModule,FormsModule,SmartListComponent,SingleRowComponent,I18nPipe,AppMenuComponent,AppMenuTriggerComponent,PopupComponent,ChatCallPopupComponent],templateUrl:'./chat.component.html',changeDetection: ChangeDetectionStrategy.Eager,
styleUrl:'./chat.component.scss'})
export class ChatComponent implements OnDestroy {
 @Output() readonly closed = new EventEmitter<void>();
 private readonly runtime = inject(AppRuntimeStore);
 private readonly dialogs = inject(DialogStore);
 protected readonly membersOpen = signal(false);
 protected readonly listPopupModel: PopupModel = { title: "chats", size: 'wide', height: 'full', bodyLayout: 'fill', headerTone: 'accent', onClose: () => this.closed.emit() };
 protected readonly chatPopupModel = computed<PopupModel>(() => {
  const chat = this.selected();
  return { title: chat?.title ?? '', translateTitle: false, size: 'wide', height: 'full', bodyLayout: 'fill', headerTone: 'accent',
   ariaLabel: chat?.title, closeAriaLabel: "chat.popup.close.aria", backdropTone: 'dim',
   toolbarControls: [
    { id: 'chat-call', align: 'end', icon: this.calls.available() ? 'call' : 'phone_disabled',
      mirrorIcon: !this.calls.available(), palette: this.calls.available() ? 'green' : 'danger',
      ariaLabel: 'chat.call.open', disabled: !this.calls.available() || !this.calls.supported() },
    { kind: 'menu', id: 'chat-header-actions', align: 'end', menuKind: 'inline', items: [
      { id: 'chat-header-members', layout: 'image-stack', palette: 'blue', ariaLabel: "members",
        imageStack: (chat?.members ?? []).map(member => ({id: member.id, imageUrl: member.imageUrl, imageAlt: member.name ?? member.initials, imageFallback: member.initials})), imageStackMaxVisible: 4 },
      { id: 'chat-header-pins', icon: 'push_pin', palette: 'default', ariaLabel: "chat.pins.open.aria" }
    ] }
   ], onClose: () => this.close(),
   onAction: event => { if (event.action.id === 'chat-call') this.calls.show(); },
   onMenuSelect: event => { if (event.itemSelect.id === 'chat-header-pins') this.pinsOpen.set(true);
    else if (event.itemSelect.id === 'chat-header-members') this.membersOpen.set(true); }
  };
 });
 protected readonly membersModel: PopupModel = { title: "members", size: 'small', height: 'auto', headerTone: 'accent', closeOnBackdrop: true, onClose: () => this.membersOpen.set(false) };
 protected readonly membersConfig: SmartListConfig<NonNullable<ChatDTO['members']>[number]> = { pageSize: 20, showStickyHeader: false, listLayout: 'stack', headerProgress: {enabled: false}, trackBy: (_i,member) => member.id };
 protected readonly loadMembers: SmartListLoadPage<NonNullable<ChatDTO['members']>[number]> = query => {
  const members = this.selected()?.members ?? [];
  return of({items: members.slice(query.page * query.pageSize, (query.page + 1) * query.pageSize),total: members.length});
 };
 protected memberRow(member: NonNullable<ChatDTO['members']>[number]): SingleRowData {
  return {id: member.id, title: member.name ?? member.initials, avatarUrl: member.imageUrl, avatarInitials: member.initials, avatarToneClass: `user-color-${member.gender}`};
 }

 private readonly chats=inject(ChatsService);
 protected readonly calls=inject(ChatCallService);
 private readonly element=inject<ElementRef<HTMLElement>>(ElementRef);
 protected readonly selectedMessageId=signal('');
 protected readonly reactionMessageId=signal('');
 protected readonly replyTarget=signal<ChatMessageDto['replyTo']>(null);
 protected readonly details=signal<ChatMessageDto|null>(null);
 protected readonly pinsOpen=signal(false);
 protected readonly typing=signal<readonly ChatTypingIndicator[]>([]);
 protected readonly quickReactions=['❤️','😆','😮','😢','😡','👍'];
 private typingIdle:ReturnType<typeof setTimeout>|null=null;
 private localTyping=false;
 private readonly remoteTypingTimers=new Map<string,ReturnType<typeof setTimeout>>();
 private retry:{text:string;replyId:string;clientId:string}|null=null;
 protected readonly actionTrigger:AppMenuTrigger={icon:'more_vert',closeIcon:'close',hideLabel:true,layout:'icon',palette:'blue',ariaLabel:"chat.message.actions.aria"};
 protected readonly emojiTrigger:AppMenuTrigger={icon:'add',closeIcon:'close',hideLabel:true,layout:'icon',palette:'blue',ariaLabel:"chat.emoji.search"};
 protected readonly emojiMenu:AppMenuModel<string,{emoji:string}>={layout:'tabs',density:'compact',groups:ChatMessageMenuConverter.emojiCategories.map(category=>({
  id:category.key,label:category.label,icon:category.icon,items:category.emojis.map(emoji=>({id:`emoji:${emoji}`,label:emoji,detail:category.label,icon:emoji,iconKind:'text',layout:'icon',value:emoji,context:{emoji}}))
 }))};
 protected readonly pinsModel:PopupModel={title:"chat.pins.title",ariaLabel:"chat.pins.title",closeAriaLabel:"chat.pins.close.aria",size:'small',height:'auto',bodyLayout:'flush',headerTone:'accent',closeOnBackdrop:true,onClose:()=>this.pinsOpen.set(false)};
 protected readonly detailsModel:PopupModel={title:"chat.reactions.title",ariaLabel:"chat.reactions.title",closeAriaLabel:"chat.reactions.close.aria",size:'small',height:'auto',headerTone:'accent',bodyLayout:'flush',backdropTone:'dim',closeOnBackdrop:true,onClose:()=>this.details.set(null)};
 protected readonly pinsConfig:SmartListConfig<ChatMessageDto>={pageSize:20,showStickyHeader:false,listLayout:'stack',trackBy:(_i,message)=>message.id,emptyLabel:'chat.pins.empty',headerProgress:{enabled:false}};
 protected readonly loadPins:SmartListLoadPage<ChatMessageDto>=query=>{
  const pins=(this.thread?.itemsSnapshot()??[]).filter(message=>message.pinnedAtIso&&!message.deletedAtIso).sort((a,b)=>Date.parse(b.pinnedAtIso!)-Date.parse(a.pinnedAtIso!));
  return of({items:pins.slice(query.page*query.pageSize,(query.page+1)*query.pageSize),total:pins.length});
 };
 private readonly profiles=inject(UserProfileStore);
 private readonly notifications=inject(NotificationCenterStore);
 private readonly route=inject(ActivatedRoute);
 private readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
 @ViewChild('thread') private thread?:SmartListComponent<ChatMessageDto>;
 @ViewChild('channels') private channels?:SmartListComponent<ChatDTO>;
 protected readonly selected=signal<ChatDTO|null>(null);
 protected readonly busy=signal(false);
 protected readonly error=signal('');
 protected readonly loadError=signal<string|null>(null);
 protected readonly connected=signal(true);
 protected readonly editing=signal<ChatMessageDto|null>(null);
 protected draft='';
 private disconnect:(()=>void)|null=null;
 private generation=0;
 private destroyed=false;
 constructor(){
  effect(()=>{const chat=this.selected();untracked(()=>void this.calls.bindChat(chat).catch(()=>this.calls.error.set('chat.call.error.signaling')));});
  effect(onCleanup=>{
   const id=this.params().get('chatId')?.trim();
   if(!id)return;
   let cancelled=false;
   onCleanup(()=>{cancelled=true;});
   untracked(()=>void this.chats.queryChatById(id).then(chat=>{
    if(cancelled||this.destroyed)return;
    if(chat)void this.open(chat);else this.error.set('chat.unavailable');
   }).catch(()=>{if(!cancelled&&!this.destroyed)this.error.set('chat.unavailable');}));
  });
 }
 protected readonly listConfig:SmartListConfig<ChatDTO>={
  pageSize:10, initialPageSize:20, defaultView:'day', listLayout:'card-grid', desktopColumns:1, mobileColumns:1,
  snapMode:'none', scrollPaddingTop:'2.6rem', footerSpacerHeight:null, pagination:{mode:'scroll'},
  pollIntervalMs:()=>!this.selected()&&!this.dialogs.dialog()?30000:0,
  trackBy:(_i,chat)=>chat.id, groupBy: chat=>UiDateUtils.smartListDayLabel(new Date(chat.dateIso??'')),
  showGroupMarker:({groupIndex})=>groupIndex>0,
  emptyLabel:'chat.empty',headerProgress:{enabled:true,state:()=>this.runtime.isDataSourceAvailable()?'active':'inactive'}};
 protected readonly threadConfig:SmartListConfig<ChatMessageDto>={
  pageSize:10,initialPageSize:15,preloadOffsetPx:48,mobilePageSizeCap:null,initialPageCount:1,showStickyHeader:false,showFirstGroupMarker:true,containerClass:['chat-thread-list','chat-thread-list--reverse'],groupMarkerClass:'chat-thread-group-marker',groupBy:message=>UiDateUtils.smartListDayLabel(new Date(message.sentAtIso)),listLayout:'thread',listFlow:'reverse',loadTriggerEdge:'end',mergeStrategy:'append',initialScrollAnchor:'start',
  defaultDirection:'desc',sortable:{sortKey:message=>[-Date.parse(message.sentAtIso),message.id]},
  trackBy:(_i,message)=>message.id,emptyLabel:'chat.messages.empty',headerProgress:{enabled:true,tone:'chat',state:()=>this.runtime.isDataSourceAvailable()?'active':'inactive'}
 };
 protected readonly threadFilters=computed(()=>({chatId:this.selected()?.id??''}));
 protected readonly loadChats:SmartListLoadPage<ChatDTO>=(query,context)=>defer(()=>from(this.chats.queryActivitiesChatPage(this.profiles.activeUserId(),query,context?.signal)));
 protected readonly loadMessages:SmartListLoadPage<ChatMessageDto>=(query)=>defer(()=>{
  const chat=this.selected();
  if(!chat) throw new Error('Chat unavailable');
  const generation=this.generation;
  if(query.page===0)this.loadError.set(null);
  const token=this.notifications.captureUnreadSyncToken();
  return from(this.chats.queryChatMessagesPage(chat,query).then(page=>{
   if(typeof page.notificationUnread==='number')this.notifications.applyRealtimeUnreadCount(token,page.notificationUnread);
   const receipt=page.readReceipt;
   if(!receipt)return page;
   this.applyChannelRead(receipt);
   const ids=new Set(receipt.messageIds);
   return {...page,items:page.items.map(message=>ids.has(message.id)&&!message.readBy.some(reader=>reader.id===receipt.userId)
    ? {...message,readBy:[...message.readBy,{id:receipt.userId,initials:receipt.userInitials,gender:receipt.userGender,imageUrl:receipt.userImageUrl}]}:message)};
  }).catch(error=>{
   if(generation===this.generation&&query.page===0)this.loadError.set('chat.unavailable');
   throw error;
  }));
 });
 protected row(chat:ChatDTO,groupLabel?:string):SingleRowData{return {...ActivityChatSingleRowConverter.convert(chat,{activeUser:this.profiles.activeUserProfile()!,resolveUserById:id=>this.profiles.getUserProfile(id)}),groupLabel};}
 protected async open(chat:ChatDTO):Promise<void>{
  this.close();this.selected.set(chat);const generation=this.generation;
  try {
   const stop=await this.chats.watchChatEvents(chat,event=>{if(!this.destroyed&&generation===this.generation)this.receive(event);});
   if(this.destroyed||generation!==this.generation)stop();else this.disconnect=stop;
  } catch {if(generation===this.generation)this.error.set('chat.connection.failed');}
 }
 protected close():void{this.stopTyping();this.clearRemoteTyping();this.selectedMessageId.set('');this.reactionMessageId.set('');this.replyTarget.set(null);this.details.set(null);this.pinsOpen.set(false);this.membersOpen.set(false);this.retry=null;this.generation++;this.disconnect?.();this.disconnect=null;this.selected.set(null);this.editing.set(null);this.draft='';this.error.set('');this.loadError.set(null);this.connected.set(true);}
 protected edit(message:ChatMessageDto):void{if(!message.mine||message.deletedAtIso)return;this.editing.set(message);this.replyTarget.set(null);this.draft=message.text;this.selectedMessageId.set('');this.focusComposer();}
 protected cancelEdit():void{this.editing.set(null);this.draft='';}
 protected async send():Promise<void>{
  const chat=this.selected(),text=this.draft.trim(),edit=this.editing();
  if(!chat||!text||this.busy())return;
  const generation=this.generation;this.busy.set(true);this.error.set('');this.stopTyping();
  const reply=this.replyTarget(),replyId=reply?.id??'';
  if(!this.retry||this.retry.text!==text||this.retry.replyId!==replyId)this.retry={text,replyId,clientId:crypto.randomUUID()};
  try{
   const result=edit?await this.chats.updateChatMessage(chat,edit.id,{text}):await this.chats.sendChatMessageWithAttachments(chat,text,[],this.retry.clientId,reply);
   if(generation!==this.generation||this.destroyed)return;
   if(!result)throw new Error('Message was not saved');
   this.applyMessage(result);this.draft='';this.editing.set(null);this.replyTarget.set(null);this.retry=null;
  }catch{if(generation===this.generation)this.error.set('chat.send.failed');}
  finally{this.busy.set(false);}
 }
 protected menuItems(message:ChatMessageDto){return ChatMessageMenuConverter.items(message);}
 protected onMenu(event:AppMenuItemSelectEvent<string,unknown>):void{
  const context=event.context as ChatMessageMenuContext|undefined;
  if(context?.menu!=='message-action'||this.busy())return;
  const message=this.thread?.itemsSnapshot().find(item=>item.id===context.message.id);
  if(!message||message.deletedAtIso)return;
  if(context.action==='reply')this.reply(message);
  else if(context.action==='edit')this.edit(message);
  else if(context.action==='unsend'&&message.mine)void this.mutate(message,{deleted:true});
  else if(context.action==='pin')void this.mutate(message,{pinned:!message.pinnedAtIso});
  else if(context.action==='resend')void this.resend(message);
 }
 private async resend(message:ChatMessageDto):Promise<void>{
  const chat=this.selected();if(!chat||!message.mine||message.deliveryState!=='timed-out'||this.busy())return;
  const generation=this.generation;this.busy.set(true);this.error.set('');
  try{
   const result=await this.chats.sendChatMessageWithAttachments(chat,message.text,message.attachments??[],message.clientId??message.id,message.replyTo);
   if(generation!==this.generation)return;
   if(!result)throw new Error('Message was not saved');this.applyMessage(result);
  }catch{if(generation===this.generation)this.error.set('chat.send.failed');}
  finally{this.busy.set(false);}
 }
 protected selectMessage(message:ChatMessageDto):void{
  if(message.deletedAtIso)return;
  this.selectedMessageId.update(id=>id===message.id?'':message.id);this.reactionMessageId.set('');this.thread?.closeMenu();
 }
 protected reply(message:ChatMessageDto):void{
  if(message.deletedAtIso)return;
  this.replyTarget.set({id:message.id,sender:message.mine?'yourself':message.sender,text:message.text});
  this.editing.set(null);this.selectedMessageId.set('');this.reactionMessageId.set('');this.focusComposer();
 }
 protected async react(message:ChatMessageDto,emoji:string):Promise<void>{
  const current=this.thread?.itemsSnapshot().find(item=>item.id===message.id)??message;
  const mine=current.reactions?.find(reaction=>reaction.userId===this.profiles.activeUserId());
  await this.mutate(current,{reactionEmoji:mine?.emoji===emoji?null:emoji});
 }
 protected chooseEmoji(message:ChatMessageDto,event:AppMenuItemSelectEvent<string,{emoji:string}>):void{
  if(event.context?.emoji)void this.react(message,event.context.emoji);
 }
 protected reactionSummary(message:ChatMessageDto):Array<{emoji:string;count:number}>{
  const counts=new Map<string,number>();
  for(const reaction of message.reactions??[])counts.set(reaction.emoji,(counts.get(reaction.emoji)??0)+1);
  return [...counts].map(([emoji,count])=>({emoji,count}));
 }
 private async mutate(message:ChatMessageDto,mutation:ChatMessageMutation):Promise<void>{
  const chat=this.selected();if(!chat||this.busy())return;
  const generation=this.generation;this.busy.set(true);this.error.set('');
  this.selectedMessageId.set('');this.reactionMessageId.set('');this.thread?.closeMenu();
  try{
   const result=await this.chats.updateChatMessage(chat,message.id,mutation);
   if(generation!==this.generation)return;
   if(!result)throw new Error('Message was not updated');
   this.applyMessage(result);
  }catch{if(generation===this.generation)this.error.set('chat.update.failed');}
  finally{this.busy.set(false);}
 }
 protected jumpTo(id:string):void{
  this.pinsOpen.set(false);
  const target=this.element.nativeElement.querySelector<HTMLElement>(`[data-chat-message-id="${CSS.escape(id)}"]`);
  target?.scrollIntoView({block:'center',behavior:'smooth'});target?.querySelector<HTMLElement>('.chat-bubble')?.focus();
 }
 private focusComposer():void{this.element.nativeElement.querySelector<HTMLTextAreaElement>('.chat-compose-box textarea')?.focus();}
 protected draftChanged(value:string):void{
  this.draft=value;const chat=this.selected();if(!chat)return;
  if(!value.trim()){this.stopTyping();return;}
  if(!this.localTyping){this.localTyping=true;void this.chats.sendChatTyping(chat,true).catch(()=>{});}
  if(this.typingIdle)clearTimeout(this.typingIdle);
  this.typingIdle=setTimeout(()=>this.stopTyping(),1800);
 }
 protected resizeComposerTextarea(): void {
  const textarea = this.element.nativeElement.querySelector<HTMLTextAreaElement>('.chat-compose-box textarea');
  if (!textarea) return;
  textarea.style.height = 'auto';
  const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight) || 20;
  textarea.style.height = `${Math.min(textarea.scrollHeight, Math.round(lineHeight * 6))}px`;
 }
 protected composerKey(event:KeyboardEvent):void{
  if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&!window.matchMedia('(pointer: coarse)').matches){event.preventDefault();void this.send();}
 }
 protected emojiSuggestions(){return AppUtils.asciiEmojiSuggestionsForToken(AppUtils.trailingAsciiEmojiToken(this.draft),6);}
 protected insertEmoji(emoji:string):void{this.draftChanged(AppUtils.replaceTrailingAsciiEmojiToken(this.draft,emoji));this.focusComposer();}
 private stopTyping():void{
  if(this.typingIdle)clearTimeout(this.typingIdle);this.typingIdle=null;
  const chat=this.selected();if(this.localTyping&&chat)void this.chats.sendChatTyping(chat,false).catch(()=>{});
  this.localTyping=false;
 }
 private receiveTyping(indicator:ChatTypingIndicator):void{
  if(indicator.userId===this.profiles.activeUserId())return;
  const timer=this.remoteTypingTimers.get(indicator.userId);if(timer)clearTimeout(timer);
  this.remoteTypingTimers.delete(indicator.userId);
  this.typing.update(items=>[...items.filter(item=>item.userId!==indicator.userId),...(indicator.typing?[indicator]:[])]);
  if(indicator.typing)this.remoteTypingTimers.set(indicator.userId,setTimeout(()=>this.receiveTyping({...indicator,typing:false}),3200));
 }
 private clearRemoteTyping():void{for(const timer of this.remoteTypingTimers.values())clearTimeout(timer);this.remoteTypingTimers.clear();this.typing.set([]);}
 private applyMessage(message:ChatMessageDto):void{
  const list=this.thread;if(!list)return;
  if(this.details()?.id===message.id)this.details.set(message);
  if(!list.patchVisibleItem(item=>item.id===message.id,()=>message))list.reinsertVisibleItem(message,{totalDelta:1});
 }
 private receive(event:ChatLiveEvent):void{
  if(event.type==='message'||event.type==='ack'){
   if(event.message){this.applyMessage(event.message);if(!event.message.mine&&!event.message.deletedAtIso)void this.read([event.message.id]);}
  }else if(event.type==='read')this.applyReceipt(event.read);
  else if(event.type==='typing')this.receiveTyping(event.typing);
  else if(event.type==='disconnected'){this.connected.set(false);this.clearRemoteTyping();}
  else if(event.type==='reconnected'){this.connected.set(true);void this.thread?.refreshVisibleItems();}
  else if(event.type==='error')this.error.set('chat.update.failed');
 }
 protected visibleMessages(messages:readonly ChatMessageDto[]):void{
  const actor=this.profiles.activeUserId();
  const unread=messages.filter(message=>!message.mine&&!message.deletedAtIso&&!message.readBy.some(reader=>reader.id===actor)).map(message=>message.id);
  if(unread.length)void this.read(unread);
 }
 private readonly reading=new Set<string>();
 private async read(ids:readonly string[]):Promise<void>{
  const chat=this.selected(),generation=this.generation;
  const pending=ids.filter(id=>!this.reading.has(id));if(!chat||!pending.length)return;
  pending.forEach(id=>this.reading.add(id));
  try{const receipt=await this.chats.markChatRead(chat,pending);if(receipt&&generation===this.generation)this.applyReceipt(receipt);}
  catch{if(generation===this.generation)this.error.set('chat.read.failed');}
  finally{pending.forEach(id=>this.reading.delete(id));}
 }
 private applyReceipt(receipt:ChatReadReceipt):void{
  this.applyChannelRead(receipt);
  const list=this.thread;if(!list)return;const ids=new Set(receipt.messageIds);
  const updated=list.itemsSnapshot().map(message=>ids.has(message.id)&&!message.readBy.some(reader=>reader.id===receipt.userId)?{
   ...message,readBy:[...message.readBy,{id:receipt.userId,initials:receipt.userInitials,gender:receipt.userGender,imageUrl:receipt.userImageUrl}]
  }:message);
  list.replaceVisibleItems(updated,{total:list.totalItemCount()});
  const detail=this.details();if(detail)this.details.set(updated.find(message=>message.id===detail.id)??detail);
 }
 private applyChannelRead(receipt:ChatReadReceipt):void{
  const chat=this.selected();
  const unread=receipt.unread;
  if(!chat||receipt.userId!==this.profiles.activeUserId()||typeof unread!=='number')return;
  this.channels?.patchVisibleItem(item=>item.id===chat.id,item=>({...item,unread}));
 }
 ngOnDestroy():void{this.destroyed=true;this.close();void this.calls.bindChat(null);}

}

import { HTTP_ADAPTER, LOCAL_ADAPTER } from '../../adapter-loaders';
import { AdapterProxyService } from '../platform/adapter-proxy.service';
import type { ChatCallRequest } from '../../../contracts/chat/chat-call.interface';
import { Injectable, inject } from '@angular/core';
import type { ListQuery } from '@fssrepository/myscoutee-components';
import type { ChatDTO, ChatMessageDto, ChatMessageAttachment, ChatMessageMutation, ChatLiveEvent, ChatFeedFilters } from '../../../contracts';
import { BaseRouteModeService } from '../platform/base-route-mode.service';
import { RouteDelayService } from '../platform/route-delay.service';
@Injectable({providedIn:'root'})
export class ChatsService extends BaseRouteModeService {
  private readonly transportAdapters = inject(AdapterProxyService);

 private readonly local=this.transportAdapters.reference(LOCAL_ADAPTER.CHATS);
 private readonly http=this.transportAdapters.reference(HTTP_ADAPTER.CHATS);
 private readonly routeDelay=inject(RouteDelayService);
 private get service(){return this.resolveRouteService('/activities/chats',this.local,this.http);}
 queryActivitiesChatPage(userId:string,query:ListQuery<ChatFeedFilters>,signal?:AbortSignal){return this.service.queryActivitiesChatPage(userId,query,signal);}
 queryChatById(id:string){return this.service.queryChatById(id);}
 queryChatMessagesPage(chat:ChatDTO,query:ListQuery){return this.routeDelay.withRequestTimeout('/activities/chats',this.service.queryChatMessagesPage(chat,query));}
 sendChatMessage(chat:ChatDTO,text:string,clientId?:string){return this.service.sendChatMessage(chat,text,clientId);}
 sendChatMessageWithAttachments(chat:ChatDTO,text:string,attachments:readonly ChatMessageAttachment[],clientId?:string,replyTo?:ChatMessageDto['replyTo']){return this.service.sendChatMessageWithAttachments(chat,text,attachments,clientId,replyTo);}
 sendChatTyping(chat:ChatDTO,typing:boolean){return this.service.sendChatTyping(chat,typing);}
 chatCallsSupported():boolean{return !this.isLocalRouteEnabled('/activities/chats');}
 sendChatCall(chat:ChatDTO,request:ChatCallRequest){return this.service.sendChatCall(chat,request);}
 updateChatMessage(chat:ChatDTO,id:string,mutation:ChatMessageMutation){return this.service.updateChatMessage(chat,id,mutation);}
 markChatRead(chat:ChatDTO,ids:readonly string[]){return this.service.markChatRead(chat,ids);}
 watchChatEvents(chat:ChatDTO,listener:(event:ChatLiveEvent)=>void){return this.service.watchChatEvents(chat,listener);}
}

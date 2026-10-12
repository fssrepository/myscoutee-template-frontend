import { Injectable, inject } from '@angular/core';
import { UiDateUtils, type ListQuery } from '@fssrepository/myscoutee-components';
import { LocalMemoryDb } from '../../../../common/app.db';
import type { AppMemorySchema } from '../../../common/memory.schema';
import { AppUtils } from '../../../../base/app-utils';
import type * as ContractTypes from '../../../../contracts';
import type { ChatFeedFilters } from '../../../../contracts/chat/chat.interface';
import { CHAT_MESSAGES_TABLE_NAME, CHATS_TABLE_NAME, type ChatRecord, type ChatThreadRecord, type ChatMessageRecord } from '../../entity/chat/chat.entity';
import { USERS_TABLE_NAME } from '../../entity/accounts/user.entity';
import { LocalChatThreadMapper } from '../../mappers/chat/chat-thread.mapper';
import { LocalChatMessageMapper } from '../../mappers/chat/chat-message.mapper';
import { LocalContactsRepository } from '../accounts/contacts.repository';
@Injectable({providedIn:'root'})
export class LocalChatsRepository {
 private readonly memoryDb = inject(LocalMemoryDb);
 private readonly contacts = inject(LocalContactsRepository);
 queryChatItemById(userId:string,chatId:string):ChatThreadRecord|null {
  const record=this.memoryDb.read().chats.byId[LocalChatThreadMapper.buildRecordKey(userId.trim(),chatId.trim())];
  return record ? LocalChatThreadMapper.cloneRecord(record) : null;
 }
 private resolveChatRecord(chat:ChatRecord,_options:{createServiceChat?:boolean}={}):ChatThreadRecord|null {
  const owner=(chat as Partial<ChatThreadRecord>).ownerUserId?.trim();
  return owner ? this.queryChatItemById(owner,chat.id) : null;
 }
 private isSetupRequiredDemoProfile(userId:string):boolean { return this.memoryDb.read().users.byId[userId]?.profileStatus === 'onboarding'; }
 async flushToIndexedDb(): Promise<void> {
    await this.memoryDb.flushToIndexedDb();
  }

requireDirectChatConsent(actor: string, peer: string): void {
    if (!this.contacts.isChatApproved(actor, peer)) throw new Error('Direct chat access requires approval.');
  }

queryActivitiesChatPage(
    userId: string,
    query: ListQuery<ChatFeedFilters>
  ): { items: ChatThreadRecord[]; total: number; nextCursor: string | null } {
    const normalizedUserId = userId.trim();
    if (!normalizedUserId || this.isSetupRequiredDemoProfile(normalizedUserId)) {
      return {
        items: [],
        total: 0,
        nextCursor: null
      };
    }

    const rangeStartMs = this.parseRangeDateMs(query.rangeStart, Number.NEGATIVE_INFINITY);
    const rangeEndMs = this.parseRangeDateMs(query.rangeEnd, Number.POSITIVE_INFINITY);
    if (rangeStartMs > rangeEndMs) {
      return {
        items: [],
        total: 0,
        nextCursor: null
      };
    }

    const source = (query.filters?.adminServiceOnly === true && this.activitiesChatContextFilter(query) === 'service'
      ? this.querySupportCaseRecordsForAdmin(normalizedUserId, this.activitiesSupportCaseFilter(query))
      : this.queryUserRecordsForPage(normalizedUserId, query))
      .filter(record => this.matchesDateRange(record, rangeStartMs, rangeEndMs));
    const sorted = this.sortChatPageRecords(source, query);
    const pageSize = Math.max(1, Math.trunc(Number(query.pageSize) || 10));
    const startIndex = this.resolvePageStartIndex(query, pageSize);
    const endIndex = Math.min(sorted.length, startIndex + pageSize);
    return {
      items: sorted
        .slice(startIndex, endIndex)
        .map(record => LocalChatThreadMapper.cloneRecord(record)),
      total: sorted.length,
      nextCursor: endIndex < sorted.length ? String(endIndex) : null
    };
  }

private querySupportCaseRecordsForAdmin(
    normalizedUserId: string,
    filter: ContractTypes.SupportCaseFilter = 'all'
  ): ChatThreadRecord[] {
    if (!this.isDemoAdminUser(normalizedUserId)) {
      return [];
    }
    const normalizedFilter = this.normalizeSupportCaseFilter(filter);
    const table = this.memoryDb.read()[CHATS_TABLE_NAME];
    const byChatId = new Map<string, ChatThreadRecord>();
    for (const id of table.ids) {
      const record = table.byId[id];
      if (!record || !this.isSupportCaseRecord(record)
          || (record.supportBaseGroupId ?? null) !== null) {
        continue;
      }
      const chatId = `${record.id ?? ''}`.trim();
      if (!chatId) {
        continue;
      }
      const current = byChatId.get(chatId);
      if (!current || record.ownerUserId === normalizedUserId) {
        byChatId.set(chatId, record);
      }
    }
    return [...byChatId.values()]
      .filter(record => normalizedFilter === 'all' || record.supportCase?.status === normalizedFilter)
      .map(record => ({
        ...record,
        supportCase: this.cloneSupportCase(record.supportCase),
        ownerUserId: normalizedUserId
      }));
  }

queryChatMessagesPage(
    chat: ChatRecord,
    query: ListQuery
  ): { items: ContractTypes.ChatMessageDto[]; total: number; nextCursor: string | null } {
    const record = this.resolveChatRecord(chat, { createServiceChat: false });
    if (!record) {
      return { items: [], total: 0, nextCursor: null };
    }
    const snapshot = this.memoryDb.read()[CHAT_MESSAGES_TABLE_NAME];
    const chatKey = LocalChatMessageMapper.chatKey(record.ownerUserId, record.id);
    const orderedIds = snapshot.idsByChatKey[chatKey] ?? [];
    const pageSize = Math.max(1, Math.trunc(Number(query.pageSize) || 10));
    let startIndex = this.resolveMessagePageStartIndex(query, pageSize);
    const targetMessageId = `${(query.filters as { targetMessageId?: string } | undefined)?.targetMessageId ?? ''}`.trim();
    if (targetMessageId && !query.cursor) {
      const targetIndex = orderedIds.slice().reverse()
        .findIndex(id => snapshot.byId[id]?.messageId === targetMessageId);
      if (targetIndex < 0) return { items: [], total: 0, nextCursor: null };
      startIndex = Math.floor(targetIndex / pageSize) * pageSize;
    }
    const endIndex = Math.min(orderedIds.length, startIndex + pageSize);
    const pageRecords = orderedIds
      .slice()
      .reverse()
      .slice(startIndex, endIndex)
      .map(id => snapshot.byId[id])
      .filter((message): message is ChatMessageRecord => Boolean(message));
    const messages = LocalChatMessageMapper.toDtoList(pageRecords).map(message => ({
      ...message,
      readBy: message.readBy.filter(reader => `${reader.id ?? ''}`.trim() !== `${message.senderAvatar.id ?? ''}`.trim())
    }));
    return {
      items: messages,
      total: orderedIds.length,
      nextCursor: endIndex < orderedIds.length ? String(endIndex) : null
    };
  }

appendChatMessage(chat: ChatRecord, message: ContractTypes.ChatMessageDto): ContractTypes.ChatMessageDto | null {
    const record = this.resolveChatRecord(chat, { createServiceChat: false });
    if (!record) return null;
    if (record.channelType === 'contact' && record.memberIds.length === 2) {
      for (const peer of record.memberIds) if (peer !== record.ownerUserId) this.requireDirectChatConsent(record.ownerUserId, peer);
    }
    let saved: ContractTypes.ChatMessageDto | null = null;
    this.memoryDb.write(state => {
      const table = state[CHATS_TABLE_NAME];
      let messages = state[CHAT_MESSAGES_TABLE_NAME];
      const previous = this.findMessageRecord(messages, record, message.id);
      if (previous) { saved = LocalChatMessageMapper.toDto(previous); return state; }
      const stored = this.withAppendTimeline(message, record, messages);
      const byId = { ...table.byId };
      let users = state[USERS_TABLE_NAME];
      for (const key of table.ids) {
        const owner = table.byId[key];
        if (owner.id !== record.id) continue;
        const mine = owner.ownerUserId === record.ownerUserId;
        const copy = { ...stored, mine };
        messages = this.upsertMessageRecord(messages, LocalChatMessageMapper.toRecord(owner.ownerUserId, owner.id, copy));
        byId[key] = { ...owner, lastMessage: stored.text || this.chatAttachmentSummary(stored),
          lastSenderId: stored.senderAvatar.id, dateIso: stored.sentAtIso,
          unread: this.normalizeCounter(owner.unread) + (mine ? 0 : 1), revision: this.nextChatRevision(owner.revision) };
        const context = this.chatCounterKey(owner.channelType);
        if (!mine && context) users = this.applyStoredChatCounterDelta(users, owner.ownerUserId, context, 1);
      }
      saved = stored;
      return { ...state, [CHATS_TABLE_NAME]: { ...table, byId }, [CHAT_MESSAGES_TABLE_NAME]: messages, [USERS_TABLE_NAME]: users };
    });
    return saved;
  }

updateChatMessage(
    chat: ChatRecord,
    messageId: string,
    mutation: ContractTypes.ChatMessageMutation
  ): ContractTypes.ChatMessageDto | null {
    const record = this.resolveChatRecord(chat, { createServiceChat: false });
    const normalizedMessageId = `${messageId ?? ''}`.trim();
    if (!record || !normalizedMessageId) {
      return null;
    }
    const actor = this.memoryDb.read()[USERS_TABLE_NAME].byId[record.ownerUserId];
    const actorId = record.ownerUserId;
    const actorName = actor?.name ?? actorId;
    const actorInitials = actor?.initials ?? AppUtils.initialsFromText(actorName);
    const actorGender: 'woman' | 'man' = actor?.gender === 'woman' ? 'woman' : 'man';
    const nowIso = new Date().toISOString();
    let updatedMessage: ContractTypes.ChatMessageDto | null = null;
    const recordKey = LocalChatThreadMapper.buildRecordKey(record.ownerUserId, record.id);
    this.memoryDb.write(currentState => {
      const currentTable = currentState[CHATS_TABLE_NAME];
      const currentMessagesTable = currentState[CHAT_MESSAGES_TABLE_NAME];
      const existingRecord = currentTable.byId[recordKey];
      if (!existingRecord) {
        return currentState;
      }
      const existingMessageRecord = this.findMessageRecord(currentMessagesTable, existingRecord, normalizedMessageId);
      if (!existingMessageRecord) {
        return currentState;
      }
      if ((mutation.deleted || typeof mutation.text === 'string')
          && !existingMessageRecord.mine && existingMessageRecord.senderAvatar.userId !== actorId) throw new Error('Forbidden');
      const nextMessage = this.applyMessageMutation(LocalChatMessageMapper.toDto(existingMessageRecord), mutation, {
        actorId,
        actorName,
        actorInitials,
        actorGender,
        nowIso
      });
      updatedMessage = nextMessage;
      let nextMessagesTable = currentMessagesTable;
      const byId = { ...currentTable.byId };
      for (const key of currentTable.ids) {
        const owner = currentTable.byId[key];
        if (owner.id !== existingRecord.id) continue;
        const previous = this.findMessageRecord(currentMessagesTable, owner, normalizedMessageId);
        if (!previous) continue;
        const copy = { ...nextMessage, mine: previous.mine };
        nextMessagesTable = this.upsertMessageRecord(nextMessagesTable, LocalChatMessageMapper.toRecord(owner.ownerUserId, owner.id, copy));
        const latestRecord = this.latestChatMessageRecord(nextMessagesTable, owner);
        const latest = latestRecord ? LocalChatMessageMapper.toDto(latestRecord) : null;
        byId[key] = { ...owner,
          lastMessage: latest ? (latest.text || this.chatAttachmentSummary(latest) || this.deletedMessageSummary(latest)) : owner.lastMessage,
          lastSenderId: latest?.senderAvatar.id ?? owner.lastSenderId,
          dateIso: latest?.sentAtIso ?? owner.dateIso, revision: this.nextChatRevision(owner.revision) };
      }
      return { ...currentState, [CHATS_TABLE_NAME]: { ...currentTable, byId }, [CHAT_MESSAGES_TABLE_NAME]: nextMessagesTable };
    });
    return updatedMessage;
  }

markChatRead(
    chat: ChatRecord,
    ownerUserId: string,
    messageIds: readonly string[],
    wholeChannel = false
  ): { messageIds: string[]; unread: number; reader: ContractTypes.ChatReadAvatar; readAtIso: string } | null {
    const normalizedOwnerUserId = `${ownerUserId ?? ''}`.trim();
    const targetIds = [...new Set(
      (messageIds ?? [])
        .map(messageId => `${messageId ?? ''}`.trim())
        .filter(Boolean)
    )];
    const sourceId = `${chat.id ?? ''}`.trim();
    const channelOwnerId = `${chat.ownerId ?? ''}`.trim();
    const channelType = `${chat.channelType ?? ''}`.trim();
    if (!normalizedOwnerUserId || (!sourceId && !channelOwnerId)) {
      return null;
    }
    const recordsTable = this.memoryDb.read()[CHATS_TABLE_NAME];
    const recordKey = this.findChatRecordKey(recordsTable, normalizedOwnerUserId, sourceId, channelOwnerId, channelType);
    if (!recordKey) {
      return null;
    }
    const record = recordsTable.byId[recordKey] ?? null;
    if (!record) {
      return null;
    }

    if (wholeChannel) {
      const messagesTable = this.memoryDb.read()[CHAT_MESSAGES_TABLE_NAME];
      const chatKey = LocalChatMessageMapper.chatKey(record.ownerUserId, record.id);
      targetIds.splice(
        0,
        targetIds.length,
        ...(messagesTable.idsByChatKey[chatKey] ?? [])
          .map(recordId => messagesTable.byId[recordId]?.messageId ?? '')
          .filter(Boolean)
      );
    }
    if (targetIds.length === 0 && !wholeChannel) {
      return null;
    }

    const reader = this.readAvatarForUser(normalizedOwnerUserId);
    const readAtIso = new Date().toISOString();
    const changedIds: string[] = [];
    const previousUnread = Math.max(0, Math.trunc(Number(record.unread) || 0));
    let unread = previousUnread;
    let changed = false;
    this.memoryDb.write(currentState => {
      const currentTable = currentState[CHATS_TABLE_NAME];
      const currentMessagesTable = currentState[CHAT_MESSAGES_TABLE_NAME];
      const existingRecord = currentTable.byId[recordKey];
      if (!existingRecord) {
        return currentState;
      }
      let ownerCopies: ChatThreadRecord[] | null = null;
      let nextMessageRecords: typeof currentMessagesTable.byId | null = null;
      for (const messageId of targetIds) {
        const messageRecord = this.findMessageRecord(currentMessagesTable, existingRecord, messageId);
        if (
          !messageRecord
          || messageRecord.mine
          || (messageRecord.readBy ?? []).some(existingReader => existingReader.userId === normalizedOwnerUserId)
        ) {
          continue;
        }
        changedIds.push(messageRecord.messageId);
        ownerCopies ??= currentTable.ids
          .map(id => currentTable.byId[id])
          .filter(owner => owner?.id === existingRecord.id);
        nextMessageRecords ??= { ...currentMessagesTable.byId };
        for (const owner of ownerCopies) {
          const copyId = LocalChatMessageMapper.recordKey(owner.ownerUserId, owner.id, messageRecord.messageId);
          const copy = nextMessageRecords[copyId];
          if (!copy || (copy.readBy ?? []).some(existingReader => existingReader.userId === reader.id)) continue;
          nextMessageRecords[copyId] = {
            ...copy,
            readBy: [...(copy.readBy ?? []), {
              userId: reader.id,
              initials: reader.initials,
              gender: reader.gender,
              imageUrl: reader.imageUrl ?? null
            }]
          };
        }
      }
      // Receipt changes preserve message identity/order; no per-message upsert or sort is needed.
      const nextMessagesTable = nextMessageRecords
        ? { ...currentMessagesTable, byId: nextMessageRecords } : currentMessagesTable;
      const clearWholeChannel = wholeChannel && previousUnread > 0;
      if (changedIds.length === 0 && !clearWholeChannel) {
        return currentState;
      }
      changed = true;
      unread = wholeChannel ? 0 : this.normalizeCounter(previousUnread - changedIds.length);
      const unreadDelta = unread - previousUnread;
      const currentUsersTable = currentState[USERS_TABLE_NAME];
      const currentUser = currentUsersTable.byId[normalizedOwnerUserId] ?? null;
      const chatCounterKey = this.chatCounterKey(existingRecord.channelType);
      const currentChatCounters = currentUser?.activities?.chat ?? {};
      const nextChatCounters = {
        all: this.normalizeCounter((currentChatCounters.all ?? currentUser?.activities?.chats ?? 0) + unreadDelta),
        appSupport: this.normalizeCounter((currentChatCounters.appSupport ?? 0) + (chatCounterKey === 'appSupport' ? unreadDelta : 0)),
        contacts: this.normalizeCounter((currentChatCounters.contacts ?? 0) + (chatCounterKey === 'contacts' ? unreadDelta : 0)),
      };
      const nextUsersTable = currentUser && unreadDelta !== 0
        ? {
            ...currentUsersTable,
            byId: {
              ...currentUsersTable.byId,
              [normalizedOwnerUserId]: {
                ...currentUser,
                activities: {
                  ...currentUser.activities,
                  chats: this.normalizeCounter((currentUser.activities?.chats ?? 0) + unreadDelta),
                  chat: nextChatCounters
                }
              }
            }
          }
        : currentUsersTable;
      return {
        ...currentState,
        [CHATS_TABLE_NAME]: {
          ...currentTable,
          byId: {
            ...currentTable.byId,
            [recordKey]: {
              ...existingRecord,
              unread,
              revision: this.nextChatRevision(existingRecord.revision)
            }
          }
        },
        [CHAT_MESSAGES_TABLE_NAME]: nextMessagesTable,
        [USERS_TABLE_NAME]: nextUsersTable
      };
    });
    return changed
      ? {
          messageIds: changedIds,
          unread,
          reader,
          readAtIso
        }
      : null;
  }

private applyStoredChatCounterDelta(
    table: AppMemorySchema[typeof USERS_TABLE_NAME],
    userId: string,
    context: 'event' | 'subEvent' | 'group' | 'service' | 'appSupport' | 'contacts' | 'groupSupport' | 'campaign' | 'cases',
    delta: number
  ): AppMemorySchema[typeof USERS_TABLE_NAME] {
    const currentUser = table.byId[userId] ?? null;
    if (!currentUser || delta === 0) {
      return table;
    }
    const currentChat = currentUser.activities?.chat ?? {};
    return {
      ...table,
      byId: {
        ...table.byId,
        [userId]: {
          ...currentUser,
          activities: {
            ...currentUser.activities,
            chats: this.normalizeCounter((currentUser.activities?.chats ?? 0) + delta),
            chat: {
              ...currentChat,
              all: this.normalizeCounter((currentChat.all ?? currentUser.activities?.chats ?? 0) + delta),
              appSupport: this.normalizeCounter((currentChat.appSupport ?? 0) + (context === 'appSupport' ? delta : 0)),
              contacts: this.normalizeCounter((currentChat.contacts ?? 0) + (context === 'contacts' ? delta : 0)),
            }
          }
        }
      }
    };
  }

private queryUserRecordsForPage(
    userId: string,
    query: ListQuery<ChatFeedFilters>
  ): ChatThreadRecord[] {
    const table = this.memoryDb.read()[CHATS_TABLE_NAME];
    return table.ids
      .map(id => table.byId[id])
      .filter((record): record is ChatThreadRecord => Boolean(record))
      .filter(record => record.ownerUserId === userId)
      .filter(record => this.matchesChatContextFilter(record, this.activitiesChatContextFilter(query)))
      .filter(record => this.matchesSupportCaseFilter(record, this.activitiesSupportCaseFilter(query)));
  }

private matchesChatContextFilter(
    record: ChatRecord,
    filter: ContractTypes.ActivitiesChatContextFilter
  ): boolean {
    return filter === 'all' || this.activityChatContextFilterKey(record) === filter;
  }

private activityChatContextFilterKey(
    record: Pick<ChatRecord, 'channelType' | 'serviceContext'>
  ): ContractTypes.ActivitiesChatContextFilter {
    if (record.channelType === 'campaign') return 'campaign';
    if (record.channelType === 'case') return 'cases';
    if (record.channelType === 'contact') return 'contacts';
    if (record.channelType === 'groupSupport') return 'groupSupport';
    if (record.channelType === 'appSupport' || record.channelType === 'supportCase') {
      return 'appSupport';
    }
    if (record.channelType === 'serviceEvent' || record.serviceContext) {
      return 'service';
    }
    if (record.channelType === 'groupSubEvent') {
      return 'group';
    }
    if (record.channelType === 'optionalSubEvent') {
      return 'subEvent';
    }
    if (record.channelType === 'mainEvent') {
      return 'event';
    }
    return 'all';
  }

private activitiesSecondaryFilter(query: ListQuery<ChatFeedFilters>): ContractTypes.ActivitiesSecondaryFilter {
    const value = query.filters?.secondaryFilter;
    return value === 'relevant' || value === 'past' ? value : 'recent';
  }

private activitiesChatContextFilter(query: ListQuery<ChatFeedFilters>): ContractTypes.ActivitiesChatContextFilter {
    const value = query.filters?.chatContextFilter;
    return value === 'event' || value === 'subEvent' || value === 'group' || value === 'service' || value === 'appSupport' || value === 'contacts' || value === 'groupSupport' || value === 'campaign' || value === 'cases'
      ? value
      : 'all';
  }

private activitiesSupportCaseFilter(query: ListQuery<ChatFeedFilters>): ContractTypes.SupportCaseFilter {
    const value = query.filters?.supportCaseFilter;
    return value === 'pending' || value === 'warned' || value === 'picked' || value === 'solved' || value === 'blocked' ? value : 'all';
  }

private matchesSupportCaseFilter(record: ChatRecord, filter: ContractTypes.SupportCaseFilter | undefined): boolean {
    const normalizedFilter = this.normalizeSupportCaseFilter(filter ?? 'all');
    return normalizedFilter === 'all' || record.supportCase?.status === normalizedFilter;
  }

private sortChatPageRecords(
    records: readonly ChatThreadRecord[],
    query: ListQuery<ChatFeedFilters>
  ): ChatThreadRecord[] {
    const direction = query.direction === 'asc' ? 1 : -1;
    const sorted = [...records];
    if (this.activitiesSecondaryFilter(query) === 'relevant') {
      return sorted.sort((left, right) =>
        this.chatMetricScore(right) - this.chatMetricScore(left)
        || direction * (
          UiDateUtils.toSortableDate(left.dateIso ?? '') - UiDateUtils.toSortableDate(right.dateIso ?? '')
        )
      );
    }
    return sorted.sort((left, right) =>
      direction * (UiDateUtils.toSortableDate(left.dateIso ?? '') - UiDateUtils.toSortableDate(right.dateIso ?? ''))
    );
  }

private chatMetricScore(record: Pick<ChatRecord, 'unread' | 'memberIds'>): number {
    const unread = Math.max(0, Math.trunc(Number(record.unread) || 0));
    const memberCount = new Set(
      (record.memberIds ?? [])
        .map(memberId => `${memberId ?? ''}`.trim())
        .filter(Boolean)
    ).size;
    return unread * 10 + memberCount;
  }

private normalizeCounter(value: unknown): number {
    const count = Number(value);
    return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  }

private nextChatRevision(value: unknown): number {
    const current = Math.max(1, Math.trunc(Number(value) || 1));
    return Math.max(Date.now(), current + 1);
  }

private withAppendTimeline(
    message: ContractTypes.ChatMessageDto,
    chat: ChatThreadRecord,
    messagesTable: AppMemorySchema[typeof CHAT_MESSAGES_TABLE_NAME]
  ): ContractTypes.ChatMessageDto {
    const latestRecord = this.latestChatMessageRecord(messagesTable, chat);
    const latestMs = latestRecord ? UiDateUtils.toSortableDate(latestRecord.sentAtIso) : Number.NaN;
    const messageMs = UiDateUtils.toSortableDate(message.sentAtIso ?? '');
    if (!Number.isFinite(latestMs) || (Number.isFinite(messageMs) && messageMs > latestMs)) {
      return message;
    }

    const sentAt = new Date(latestMs + 60 * 1000);
    return {
      ...message,
      sentAtIso: UiDateUtils.toIsoDateTime(sentAt),
      time: sentAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  }

private findChatRecordKey(
    table: AppMemorySchema[typeof CHATS_TABLE_NAME],
    ownerUserId: string,
    chatId: string,
    ownerId: string,
    channelType: string
  ): string | null {
    const normalizedOwnerUserId = `${ownerUserId ?? ''}`.trim();
    const normalizedChatId = `${chatId ?? ''}`.trim();
    const normalizedOwnerId = `${ownerId ?? ''}`.trim();
    const normalizedChannelType = `${channelType ?? ''}`.trim();
    if (normalizedOwnerUserId && normalizedOwnerId) {
      const ownerMatch = table.ids.find(id => {
        const record = table.byId[id];
        return record?.ownerUserId === normalizedOwnerUserId
          && `${record.ownerId ?? ''}`.trim() === normalizedOwnerId
          && (!normalizedChannelType || `${record.channelType ?? ''}`.trim() === normalizedChannelType);
      });
      if (ownerMatch) {
        return ownerMatch;
      }
    }
    if (normalizedOwnerUserId && normalizedChatId) {
      const key = LocalChatThreadMapper.buildRecordKey(normalizedOwnerUserId, normalizedChatId);
      if (table.byId[key]) {
        return key;
      }
    }
    return null;
  }

private readAvatarForUser(userId: string): ContractTypes.ChatReadAvatar {
    const normalizedUserId = `${userId ?? ''}`.trim();
    const user = normalizedUserId ? this.memoryDb.read()[USERS_TABLE_NAME].byId[normalizedUserId] ?? null : null;
    const label = user?.name?.trim() || normalizedUserId || 'You';
    return {
      id: normalizedUserId,
      initials: user?.initials?.trim() || AppUtils.initialsFromText(label),
      gender: user?.gender ?? 'man',
      imageUrl: AppUtils.firstImageUrl(user?.images)
    };
  }

private resolvePageStartIndex(query: ListQuery<ChatFeedFilters>, pageSize: number): number {
    const cursorIndex = Number(query.cursor);
    if (Number.isFinite(cursorIndex)) {
      return Math.max(0, Math.trunc(cursorIndex));
    }
    return Math.max(0, Math.trunc(Number(query.page) || 0)) * pageSize;
  }

private resolveMessagePageStartIndex(query: ListQuery, pageSize: number): number {
    const cursorIndex = Number(query.cursor);
    if (Number.isFinite(cursorIndex)) {
      return Math.max(0, Math.trunc(cursorIndex));
    }
    return Math.max(0, Math.trunc(Number(query.page) || 0)) * pageSize;
  }

private findMessageRecord(
    table: AppMemorySchema[typeof CHAT_MESSAGES_TABLE_NAME],
    chat: ChatThreadRecord,
    messageId: string
  ): ChatMessageRecord | null {
    const recordId = LocalChatMessageMapper.recordKey(chat.ownerUserId, chat.id, messageId);
    return table.byId[recordId] ?? null;
  }

private latestChatMessageRecord(
    table: AppMemorySchema[typeof CHAT_MESSAGES_TABLE_NAME],
    chat: ChatThreadRecord
  ): ChatMessageRecord | null {
    const chatKey = LocalChatMessageMapper.chatKey(chat.ownerUserId, chat.id);
    const ids = table.idsByChatKey[chatKey] ?? [];
    const latestId = ids[ids.length - 1] ?? '';
    return latestId ? table.byId[latestId] ?? null : null;
  }

private upsertMessageRecord(
    table: AppMemorySchema[typeof CHAT_MESSAGES_TABLE_NAME],
    message: ChatMessageRecord
  ): AppMemorySchema[typeof CHAT_MESSAGES_TABLE_NAME] {
    if (!message.recordId) {
      return table;
    }
    const chatKey = LocalChatMessageMapper.chatKey(message.ownerUserId, message.chatId);
    const nextById = {
      ...table.byId,
      [message.recordId]: message
    };
    const nextIds = table.ids.includes(message.recordId)
      ? [...table.ids]
      : [...table.ids, message.recordId];
    const nextChatIds = table.idsByChatKey[chatKey]?.includes(message.recordId)
      ? [...table.idsByChatKey[chatKey]]
      : [...(table.idsByChatKey[chatKey] ?? []), message.recordId];
    nextChatIds.sort((leftId, rightId) => {
      const left = nextById[leftId];
      const right = nextById[rightId];
      return left && right ? this.compareMessageRecordsAsc(left, right) : left ? -1 : right ? 1 : 0;
    });
    return {
      byId: nextById,
      ids: nextIds,
      idsByChatKey: {
        ...table.idsByChatKey,
        [chatKey]: nextChatIds
      }
    };
  }

private compareMessageRecordsAsc(left: ChatMessageRecord, right: ChatMessageRecord): number {
    return UiDateUtils.toSortableDate(left.sentAtIso) - UiDateUtils.toSortableDate(right.sentAtIso)
      || `${left.messageId ?? ''}`.localeCompare(`${right.messageId ?? ''}`);
  }

private matchesDateRange(record: ChatRecord, rangeStartMs: number, rangeEndMs: number): boolean {
    const dateMs = UiDateUtils.toSortableDate(record.dateIso ?? '');
    return dateMs >= rangeStartMs && dateMs <= rangeEndMs;
  }

private parseRangeDateMs(value: string | null | undefined, fallback: number): number {
    const text = `${value ?? ''}`.trim();
    if (!text) {
      return fallback;
    }
    const dateMs = UiDateUtils.toSortableDate(text);
    return Number.isFinite(dateMs) ? dateMs : fallback;
  }

private isDemoAdminUser(userId: string): boolean {
    return this.memoryDb.read().users.byId[userId]?.admin === true;
  }

private isSupportCaseRecord(record: ChatRecord): boolean {
    return record.channelType === 'supportCase'
      || `${record.id ?? ''}`.trim().startsWith('c-support-admin-')
      || Boolean(record.supportCase);
  }

private cloneSupportCase<T extends ContractTypes.ChatSupportCase | null | undefined>(supportCase: T): T {
    return supportCase
      ? {
          ...supportCase,
          assignee: supportCase.assignee ? { ...supportCase.assignee } : supportCase.assignee
        } as T
      : supportCase;
  }

private normalizeSupportCaseFilter(filter: ContractTypes.SupportCaseFilter): ContractTypes.SupportCaseFilter {
    return filter === 'pending' || filter === 'warned' || filter === 'picked' || filter === 'solved' || filter === 'blocked'
      ? filter
      : 'all';
  }

private resolveDemoAdminActor(ownerUserId: string): { id: string; name: string; initials: string } {
    const profile = this.memoryDb.read().users.byId[ownerUserId];
    if (profile?.admin) return { id: profile.id, name: profile.name, initials: profile.initials };
    throw new Error('Administrator required.');
  }

private chatAttachmentSummary(message: ContractTypes.ChatMessageDto): string {
    const firstAttachment = message.attachments?.[0];
    if (!firstAttachment) {
      return '';
    }
    if (firstAttachment.type === 'image') {
      return 'Sent an image';
    }
    if (firstAttachment.type === 'event') {
      return 'Shared an event';
    }
    if (firstAttachment.type === 'asset') {
      return 'Shared an asset';
    }
    return firstAttachment.title || 'Shared an attachment';
  }

private applyMessageMutation(
    message: ContractTypes.ChatMessageDto,
    mutation: ContractTypes.ChatMessageMutation,
    actor: {
      actorId: string;
      actorName: string;
      actorInitials: string;
      actorGender: 'woman' | 'man';
      nowIso: string;
    }
  ): ContractTypes.ChatMessageDto {
    if (mutation.deleted === true) {
      return {
        ...message,
        text: '',
        deletedAtIso: actor.nowIso,
        deletedByUserId: actor.actorId,
        deletedByName: actor.actorName,
        reactions: [],
        readBy: []
      };
    }
    if (typeof mutation.text === 'string') {
      const nextText = mutation.text.trim();
      if (nextText && message.mine && !message.deletedAtIso) {
        return {
          ...message,
          text: nextText,
          editedAtIso: actor.nowIso
        };
      }
    }
    if (typeof mutation.pinned === 'boolean') {
      return {
        ...message,
        pinnedAtIso: mutation.pinned ? actor.nowIso : null,
        pinnedByUserId: mutation.pinned ? actor.actorId : null
      };
    }
    if (Object.prototype.hasOwnProperty.call(mutation, 'reactionEmoji')) {
      const emoji = `${mutation.reactionEmoji ?? ''}`.trim();
      const withoutMine = (message.reactions ?? []).filter(reaction => reaction.userId !== actor.actorId);
      return {
        ...message,
        reactions: emoji
          ? [
              ...withoutMine,
              {
                emoji,
                userId: actor.actorId,
                userName: actor.actorName,
                userInitials: actor.actorInitials,
                userGender: actor.actorGender,
                reactedAtIso: actor.nowIso
              }
            ]
          : withoutMine
      };
    }
    if (mutation.attachments) {
      return {
        ...message,
        attachments: mutation.attachments.map(attachment => ({ ...attachment }))
      };
    }
    return message;
  }

private deletedMessageSummary(message: ContractTypes.ChatMessageDto): string {
    return message.deletedAtIso ? `${message.deletedByName || message.sender} deleted a message` : '';
  }

private chatCounterKey(
    channelType: ContractTypes.ChatChannelType | null | undefined
  ): 'event' | 'subEvent' | 'group' | 'service' | 'appSupport' | 'contacts' | 'groupSupport' | 'campaign' | 'cases' | null {
    switch (channelType) {
      case 'mainEvent': return 'event';
      case 'optionalSubEvent': return 'subEvent';
      case 'groupSubEvent': return 'group';
      case 'serviceEvent': return 'service';
      case 'campaign': return 'campaign';
      case 'case': return 'cases';
      case 'contact': return 'contacts';
      case 'groupSupport': return 'groupSupport';
      case 'appSupport':
      case 'supportCase': return 'appSupport';
      default: return null;
    }
  }
}

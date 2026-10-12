import type {
  ActivitiesChatPageResultDTO,
  ChatDTO,
} from '../../../../contracts/chat/chat.interface';
import type { RecordToDtoListMapper } from '../common/mapper.types';
import type { ChatThreadRecord } from '../../entity/chat/chat.entity';


export class LocalChatThreadMapper {
  static toDto(record: ChatThreadRecord): ChatDTO {
    return {
      id: record.id,
      avatar: record.avatar,
      title: record.title,
      lastMessage: record.lastMessage,
      lastSenderId: record.lastSenderId,
      memberIds: [...(record.memberIds ?? [])],
      members: this.cloneMembers(record.members),
      unread: Math.max(0, Math.trunc(Number(record.unread) || 0)),
      dateIso: record.dateIso,
      contextStartAtIso: record.contextStartAtIso ?? null,
      contextEndAtIso: record.contextEndAtIso ?? null,
      distanceKm: record.distanceKm,
      distanceMetersExact: record.distanceMetersExact,
      channelType: record.channelType,
      serviceContext: record.serviceContext,
      ownerId: record.ownerId,
      caseOfferId: record.caseOfferId,
      eventId: record.eventId,
      ownerStatus: record.ownerStatus ?? null,
      revision: Math.max(1, Math.trunc(Number(record.revision) || 1)),
      subEventId: record.subEventId,
      supportCase: this.cloneSupportCase(record.supportCase),
      ownerUserId: record.ownerUserId,
    };
  }

  static toDtoList(records: readonly ChatThreadRecord[]): ChatDTO[] {
    return records.map(record => this.toDto(record));
  }

  static toMap(records: readonly ChatThreadRecord[]): Map<string, ChatDTO> {
    const result = new Map<string, ChatDTO>();
    for (const record of records ?? []) {
      const ownerId = `${record.ownerId ?? ''}`.trim();
      if (ownerId) {
        result.set(ownerId, this.toDto(record));
      }
    }
    return result;
  }

  static toDtoPage(page: {
    items: readonly ChatThreadRecord[];
    total: number;
    nextCursor?: string | null;
  }): ActivitiesChatPageResultDTO {
    return {
      items: this.toDtoList(page.items),
      total: Math.max(0, Math.trunc(Number(page.total) || 0)),
      nextCursor: page.nextCursor ?? null
    };
  }

  static cloneRecord(record: ChatThreadRecord): ChatThreadRecord {
    return {
      ...record,
      memberIds: [...record.memberIds],
      members: this.cloneMembers(record.members),
      supportCase: this.cloneSupportCase(record.supportCase)
    };
  }

  static buildRecordKey(ownerUserId: string, sourceId: string): string {
    return `${ownerUserId}:${sourceId}`;
  }

  private static cloneSupportCase<T extends ChatDTO['supportCase']>(supportCase: T): T {
    return supportCase
      ? {
          ...supportCase,
          assignee: supportCase.assignee ? { ...supportCase.assignee } : supportCase.assignee
        } as T
      : supportCase;
  }

  private static cloneMembers<T extends ChatDTO['members']>(members: T): T {
    return members
      ? members.map(member => ({ ...member })) as T
      : members;
  }
}

export const localChatThreadMapper =
  LocalChatThreadMapper satisfies RecordToDtoListMapper<ChatThreadRecord, ChatDTO>;

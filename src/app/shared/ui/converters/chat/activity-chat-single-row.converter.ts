import { type SingleRowData, type UiListConverter } from '@fssrepository/myscoutee-components';
import type { ChatDTO, ChatMemberSummaryDto } from '../../../core/contracts/chat/chat.interface';
import type { UserDto } from '../../../core/contracts/accounts/user.interface';
import { AppUtils } from '../../../core/base/app-utils';
export interface ActivityChatSingleRowConverterOptions {
  activeUser: UserDto;
  resolveUserById?: (userId: string) => UserDto | null;
}
interface ResolvedActivityChatSingleRowConverterOptions extends ActivityChatSingleRowConverterOptions { fallbackUser: UserDto; }
type ActivityChatPerson = Pick<UserDto, 'id' | 'name' | 'initials' | 'gender'> & { avatarUrl?: string | null; images?: readonly string[]; };
export class ActivityChatSingleRowConverter {
  static convert(dto: ChatDTO, options: ActivityChatSingleRowConverterOptions): SingleRowData {
    const resolved = this.resolveOptions(options);
    const lastSender = this.resolveLastSender(dto, resolved);
    const unread = Math.max(0, Math.trunc(Number(dto.unread) || 0));
    const memberCount = this.resolveMemberCount(dto, resolved);
    return {
      id: dto.id, smartListKey: `chats:${dto.channelType ?? 'general'}:${dto.id}`,
      status: dto.channelType, dateIso: dto.dateIso, badgeCount: unread, sortScore: unread * 10 + memberCount,
      title: lastSender?.name ?? dto.title, subtitle: dto.title, detail: dto.lastMessage?.trim() || '',
      unread, avatarUrl: this.personAvatarUrl(lastSender),
      avatarInitials: lastSender?.initials || AppUtils.initialsFromText(lastSender?.name ?? dto.title),
      avatarToneClass: lastSender ? `user-color-${lastSender.gender}` : null,
      avatarAriaLabel: lastSender?.name ?? dto.title,
      memberCount, surfaceTone: 'default', sideLabel: null, badges: [], menuActions: [], clickable: true
    };
  }
  static convertList(dtos: readonly ChatDTO[], options: ActivityChatSingleRowConverterOptions): SingleRowData[] {
    return dtos.map(dto => this.convert(dto, options));
  }
  private static resolveLastSender(
    dto: ChatDTO,
    options: ResolvedActivityChatSingleRowConverterOptions
  ): ActivityChatPerson | null {
    const lastSender = this.resolveUserById(dto.lastSenderId, dto, options);
    if (lastSender) {
      return lastSender;
    }
    const members = this.resolveMembers(dto, options);
    return members[0] ?? null;
  }

  private static resolveMemberCount(
    dto: ChatDTO,
    options: ResolvedActivityChatSingleRowConverterOptions
  ): number {
    const explicitMemberCount = new Set(
      (dto.memberIds ?? [])
        .map(memberId => `${memberId ?? ''}`.trim())
        .filter(Boolean)
    ).size;
    if (explicitMemberCount > 0) {
      return explicitMemberCount;
    }
    return this.resolveMembers(dto, options).length;
  }

  private static resolveMembers(
    dto: ChatDTO,
    options: ResolvedActivityChatSingleRowConverterOptions
  ): ActivityChatPerson[] {
    const memberIds = new Set([
      ...(dto.memberIds ?? []),
      ...(dto.members ?? []).map(member => member.id)
    ].map(memberId => `${memberId ?? ''}`.trim()).filter(Boolean));
    const members = [...memberIds]
      .map(memberId => this.resolveUserById(memberId, dto, options))
      .filter((user): user is ActivityChatPerson => Boolean(user));
    if (members.length > 0) {
      return this.uniqueUsersById(members);
    }
    return [options.fallbackUser];
  }

  private static resolveOptions(
    options: ActivityChatSingleRowConverterOptions
  ): ResolvedActivityChatSingleRowConverterOptions {
    return {
      ...options,
      fallbackUser: options.activeUser
    };
  }

  private static resolveUserById(
    userId: string | undefined,
    dto: Pick<ChatDTO, 'members'>,
    options: ActivityChatSingleRowConverterOptions
  ): ActivityChatPerson | null {
    const normalizedUserId = `${userId ?? ''}`.trim();
    if (!normalizedUserId) {
      return null;
    }
    if (normalizedUserId === options.activeUser.id) {
      return options.activeUser;
    }
    const resolvedUser = options.resolveUserById?.(normalizedUserId) ?? null;
    if (resolvedUser) {
      return resolvedUser;
    }
    const member = (dto.members ?? []).find(candidate => `${candidate.id ?? ''}`.trim() === normalizedUserId);
    return member ? this.memberSummaryPerson(member) : null;
  }

  private static memberSummaryPerson(member: ChatMemberSummaryDto): ActivityChatPerson {
    const name = `${member.name ?? ''}`.trim() || member.id;
    return {
      id: member.id,
      name,
      initials: `${member.initials ?? ''}`.trim() || AppUtils.initialsFromText(name),
      gender: member.gender === 'woman' ? 'woman' : 'man',
      avatarUrl: `${member.imageUrl ?? ''}`.trim() || null
    };
  }

  private static personAvatarUrl(person: ActivityChatPerson | null): string | null {
    if (!person) {
      return null;
    }
    return `${person.avatarUrl ?? ''}`.trim()
      || AppUtils.firstImageUrl(person.images)
      || null;
  }

  private static uniqueUsersById(users: readonly ActivityChatPerson[]): ActivityChatPerson[] {
    const seen = new Set<string>();
    const unique: ActivityChatPerson[] = [];
    for (const user of users) {
      if (seen.has(user.id)) {
        continue;
      }
      seen.add(user.id);
      unique.push(user);
    }
    return unique;
  }
}

export const activityChatSingleRowConverter =
  ActivityChatSingleRowConverter satisfies UiListConverter<
    ChatDTO,
    SingleRowData,
    ActivityChatSingleRowConverterOptions
  >;

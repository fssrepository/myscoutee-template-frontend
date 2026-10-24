import type { UserDto, UserSelectorListItemDto } from '../../../../contracts/accounts/user.interface';
import type { UserRecord } from '../../entity/accounts/user.entity';
export class LocalUsersMapper {
 static toDto(record: UserRecord): UserDto {
  const { devices, integrationTokens: _tokens, integrationAccess: _access, ...profile } = record;
  return structuredClone({ ...profile, notificationDevices: (devices ?? []).map(device => ({ deviceId: device.deviceId, notificationsEnabled: device.notificationsEnabled === true })) });
 }
 static toRecord(user: UserDto): UserRecord {
  const { notificationDevices: _devices, ...profile } = structuredClone(user);
  return { ...profile, images: (profile.images ?? []).map(image => image.trim()).filter(Boolean) };
 }
  static toDtoList(records: readonly UserRecord[]): UserDto[] {
    return records.map(record => this.toDto(record));
  }

  static toSelectorListItem(record: UserRecord): UserSelectorListItemDto {
    return {
      id: record.id,
      locationRequired: !record.partitionKey?.trim(),
      locationCoordinates: record.locationCoordinates ? { ...record.locationCoordinates } : null,
      name: record.name,
      city: record.city,
      initials: record.initials,
      avatarUrl: (record.images ?? [])
        .find(imageUrl => `${imageUrl ?? ''}`.trim())
        ?.replace(/\/large\.webp$/, '/small.webp') ?? '',
      gender: record.gender,
      profileFormVersion: record.profileFormVersion,
      status: record.status,
      deletedAtIso: record.deletedAtIso ?? null
    };
  }

  static toSelectorListItemList(records: readonly UserRecord[]): UserSelectorListItemDto[] {
    return records.map(record => this.toSelectorListItem(record));
  }
}

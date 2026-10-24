
export interface AsciiEmojiConversion {
  token: string;
  emoji: string;
  label: string;
}

const ASCII_EMOJI_CONVERSIONS: readonly AsciiEmojiConversion[] = [
  { token: ':)', emoji: '🙂', label: 'Smile' },
  { token: ':-)', emoji: '🙂', label: 'Smile' },
  { token: '=)', emoji: '🙂', label: 'Smile' },
  { token: ':D', emoji: '😄', label: 'Grin' },
  { token: ':-D', emoji: '😄', label: 'Grin' },
  { token: '=D', emoji: '😄', label: 'Grin' },
  { token: 'xD', emoji: '😆', label: 'Laugh' },
  { token: 'XD', emoji: '😆', label: 'Laugh' },
  { token: ';)', emoji: '😉', label: 'Wink' },
  { token: ';-)', emoji: '😉', label: 'Wink' },
  { token: ':(', emoji: '🙁', label: 'Sad' },
  { token: ':-(', emoji: '🙁', label: 'Sad' },
  { token: ":'(", emoji: '😢', label: 'Cry' },
  { token: ":'-(", emoji: '😢', label: 'Cry' },
  { token: ':P', emoji: '😛', label: 'Tongue' },
  { token: ':-P', emoji: '😛', label: 'Tongue' },
  { token: ':p', emoji: '😛', label: 'Tongue' },
  { token: ':-p', emoji: '😛', label: 'Tongue' },
  { token: ';P', emoji: '😜', label: 'Wink tongue' },
  { token: ';-P', emoji: '😜', label: 'Wink tongue' },
  { token: ':o', emoji: '😮', label: 'Surprise' },
  { token: ':O', emoji: '😮', label: 'Surprise' },
  { token: ':-o', emoji: '😮', label: 'Surprise' },
  { token: ':-O', emoji: '😮', label: 'Surprise' },
  { token: ':/', emoji: '🫤', label: 'Unsure' },
  { token: ':-/', emoji: '🫤', label: 'Unsure' },
  { token: ':\\', emoji: '🫤', label: 'Unsure' },
  { token: ':-\\', emoji: '🫤', label: 'Unsure' },
  { token: ':|', emoji: '😐', label: 'Neutral' },
  { token: ':-|', emoji: '😐', label: 'Neutral' },
  { token: ':*', emoji: '😘', label: 'Kiss' },
  { token: ':-*', emoji: '😘', label: 'Kiss' },
  { token: '<3', emoji: '❤️', label: 'Heart' },
  { token: '</3', emoji: '💔', label: 'Broken heart' },
  { token: 'B)', emoji: '😎', label: 'Cool' },
  { token: 'B-)', emoji: '😎', label: 'Cool' },
  { token: '8)', emoji: '😎', label: 'Cool' },
  { token: '8-)', emoji: '😎', label: 'Cool' },
  { token: 'O:)', emoji: '😇', label: 'Angel' },
  { token: 'O:-)', emoji: '😇', label: 'Angel' },
  { token: '0:)', emoji: '😇', label: 'Angel' },
  { token: '0:-)', emoji: '😇', label: 'Angel' },
  { token: '>:)', emoji: '😈', label: 'Devil' },
  { token: '>:-)', emoji: '😈', label: 'Devil' },
  { token: '-_-', emoji: '😑', label: 'Unamused' }
];

const ASCII_EMOJI_BY_TOKEN = new Map(
  ASCII_EMOJI_CONVERSIONS.map(conversion => [conversion.token, conversion])
);

const ASCII_EMOJI_TOKEN_REGEX = new RegExp(
  `(^|[\\s([{])(${ASCII_EMOJI_CONVERSIONS
    .map(conversion => conversion.token)
    .sort((first, second) => second.length - first.length)
    .map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})(?=$|[\\s.,!?;:\\])}])`,
  'g'
);

export class AppUtils {
  static normalizeMessages(value: Record<string, string> | null, normalizeSourceKey: (value: string) => string): Record<string, string> | null {
    if (!value || typeof value !== 'object') {
      return null;
    }
    const normalized: Record<string, string> = {};
    Object.entries(value).forEach(([key, translation]) => {
      const normalizedKey = normalizeSourceKey(key);
      const normalizedTranslation = `${translation ?? ''}`.trim();
      if (normalizedKey && normalizedTranslation) {
        normalized[normalizedKey] = normalizedTranslation;
      }
    });
    return normalized;
  }

  static normalizeLanguage(value: string): string {
    return `${value ?? ''}`
      .trim()
      .toLowerCase()
      .split(',')[0]
      .split(';')[0]
      .split('-')[0]
      .replace(/[^a-z]/g, '');
  }

  static trimEndCharacters(value: string, characters: string): string {
    let end = value.length;
    while (end > 0 && characters.includes(value[end - 1])) end--;
    return value.slice(0, end);
  }

  static trimCharacters(value: string, characters: string): string {
    const trimmedEnd = this.trimEndCharacters(value, characters);
    let start = 0;
    while (start < trimmedEnd.length && characters.includes(trimmedEnd[start])) start++;
    return trimmedEnd.slice(start);
  }

  static isEmail(value: string): boolean {
    const separator = value.indexOf('@');
    const domainDot = value.lastIndexOf('.');
    return separator > 0 && separator === value.lastIndexOf('@')
      && domainDot > separator + 1 && domainDot < value.length - 1
      && !/\s/.test(value);
  }

  // Canonical keys and signatures use UTF-16 order, independent of the user's locale.
  static compareCodeUnits(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }

static initialsFromText(value: string): string {
    const words = value
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length === 0) {
      return 'U';
    }
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }

static hashText(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) % 104729;
    }
    return Math.abs(hash);
  }

static firstImageUrl(images: readonly string[] | undefined | null): string {
    return (images ?? [])
      .map(image => `${image ?? ''}`.trim())
      .find(image => image.length > 0) ?? '';
  }

static convertAsciiEmojis(value: string | null | undefined): string {
    const text = `${value ?? ''}`;
    if (!text) {
      return '';
    }
    return text.replace(ASCII_EMOJI_TOKEN_REGEX, (_match, prefix: string, token: string) => {
      const conversion = ASCII_EMOJI_BY_TOKEN.get(token);
      return conversion ? `${prefix}${conversion.emoji}` : `${prefix}${token}`;
    });
  }


  static mediaImageVariantUrl(
    imageUrl: string | null | undefined,
    variant: 'small' | 'medium' | 'large'
  ): string {
    const normalized = `${imageUrl ?? ''}`.trim();
    if (!normalized) {
      return '';
    }
    const publicKey = this.mediaPublicObjectKey(normalized);
    if (!publicKey) {
      return normalized;
    }
    const variantKey = this.mediaVariantObjectKey(publicKey, variant);
    if (!variantKey) {
      return normalized;
    }
    return normalized.replace(/([?&]key=)([^&#]*)/, (_match, prefix: string) =>
      `${prefix}${encodeURIComponent(variantKey)}`
    );
  }

  static uniqueTrimmedStrings(values: Iterable<string | null | undefined> | null | undefined): string[] {
    return Array.from(new Set(
      Array.from(values ?? [])
        .map(value => `${value ?? ''}`.trim())
        .filter(Boolean)
    ));
  }

  private static mediaPublicObjectKey(imageUrl: string): string | null {
    const match = imageUrl.match(/[?&]key=([^&#]+)/);
    if (!match?.[1]) {
      return null;
    }
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return null;
    }
  }

  private static mediaVariantObjectKey(
    objectKey: string,
    variant: 'small' | 'medium' | 'large'
  ): string | null {
    if (!/^(?:images\/|private\/images\/|public\/(?:demo|branding)\/images\/)/.test(objectKey)) {
      return null;
    }
    const slashIndex = objectKey.lastIndexOf('/');
    if (slashIndex <= 0 || slashIndex >= objectKey.length - 1) {
      return null;
    }
    const objectName = objectKey.slice(slashIndex + 1);
    if (!/^(?:small|medium|large)\.webp$/.test(objectName)) {
      return null;
    }
    return `${objectKey.slice(0, slashIndex)}/${variant}.webp`;
  }

  static enumValue<T extends string>(
    value: string | null | undefined,
    values: readonly T[],
    fallback: T
  ): T {
    return this.enumValueOrNull(value, values) ?? fallback;
  }

  static enumValueOrNull<T extends string>(
    value: string | null | undefined,
    values: readonly T[]
  ): T | null {
    const normalized = `${value ?? ''}`.trim();
    return (values as readonly string[]).includes(normalized) ? normalized as T : null;
  }
  static trailingAsciiEmojiToken(value: string | null | undefined): string {
    const match = `${value ?? ''}`.match(/(?:^|[\s([{])(\S{1,8})$/);
    const token = `${match?.[1] ?? ''}`.trim();
    return token && this.asciiEmojiSuggestionsForToken(token, 1).length > 0 ? token : '';
  }

  static asciiEmojiSuggestionsForToken(
    token: string | null | undefined,
    limit = 8
  ): readonly AsciiEmojiConversion[] {
    const normalized = `${token ?? ''}`.trim();
    if (!normalized) {
      return [];
    }
    const lower = normalized.toLowerCase();
    return ASCII_EMOJI_CONVERSIONS
      .filter(conversion => conversion.token.toLowerCase().startsWith(lower))
      .sort((first, second) => {
        const firstExact = first.token.toLowerCase() === lower ? 0 : 1;
        const secondExact = second.token.toLowerCase() === lower ? 0 : 1;
        return firstExact - secondExact || first.token.length - second.token.length;
      })
      .slice(0, Math.max(1, Math.trunc(limit)));
  }

  static replaceTrailingAsciiEmojiToken(
    value: string | null | undefined,
    replacement: string
  ): string {
    const text = `${value ?? ''}`;
    const token = this.trailingAsciiEmojiToken(text);
    if (!token) {
      return text;
    }
    return `${text.slice(0, text.length - token.length)}${replacement}`;
  }

}

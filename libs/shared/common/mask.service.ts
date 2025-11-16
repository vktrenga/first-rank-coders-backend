export class MaskService {
  /**
   * Mask an email address, e.g. john.doe@example.com -> j***@example.com
   */
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 1) return `*@${domain}`;
    return `${local[0]}***@${domain}`;
  }

  /**
   * Mask a phone number, e.g. 9876543210 -> 98*****210
   */
  maskPhone(phone: string): string {
    if (!phone || phone.length < 5) return phone;
    return `${phone.slice(0, 2)}*****${phone.slice(-3)}`;
  }

  /**
   * Mask a name, e.g. John Doe -> J*** D**
   */
  maskName(name: string): string {
    if (!name) return name;
    return name
      .split(' ')
      .map(part => part.length > 1 ? `${part[0]}${'*'.repeat(part.length - 1)}` : part)
      .join(' ');
  }

  /**
   * Mask any string, keeping first and last character
   */
  maskString(str: string): string {
    if (!str || str.length < 3) return str;
    return `${str[0]}${'*'.repeat(str.length - 2)}${str[str.length - 1]}`;
  }
}

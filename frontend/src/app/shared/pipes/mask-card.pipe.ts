import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCard',
  standalone: true
})
export class MaskCardPipe implements PipeTransform {
  transform(cardNumber: string | null | undefined): string {
    if (!cardNumber) return '•••• •••• •••• ••••';
    const cleaned = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
    if (cleaned.length >= 16) {
      return `•••• •••• •••• ${cleaned.slice(-4)}`;
    }
    return cardNumber;
  }
}

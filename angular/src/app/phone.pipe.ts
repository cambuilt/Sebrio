import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'phone'
})

export class PhonePipe implements PipeTransform {
	transform(phoneNumber: string) {
		if (!phoneNumber) {
			return null;
		}

		const numbers = phoneNumber.replace(/\D/g, '');

		if (numbers.length !== 10) {
			return phoneNumber;
		}

		const char = { 0: '(', 3: ') ', 6: '-' };
		let formattedPhone = '';

		for (let i = 0; i < numbers.length; i++) {
			formattedPhone += (char[i] || '') + numbers[i];
		}

		return formattedPhone;
	}
}

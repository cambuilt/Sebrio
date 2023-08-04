import { Component, OnInit, HostListener } from '@angular/core';
import { MessagingService } from '../services/messaging.service';

@Component({
	selector: 'app-notification-message',
	template: '<div class=\'notificationContent\' [ngClass]="{\'show\': open === true}" [ngClass]="{\'closing\': closing === true}"><mat-icon style=\'transform: rotate(90deg);\' svgIcon=\'highlight_outline\'></mat-icon><span class=\'dataSpanMessage\'>{{data}}</span><button class=\'closeBroadcast\' mat-button (click)="ok();">OK</button></div>',
	styleUrls: ['./notification-message.component.css'],
})

export class NotificationMessageComponent implements OnInit {
	data: any;
	open = false;
	closing = false;
	originalHeight: any;
	broadcastMessageId;
	height128 = true;
	totalLines = 0;
	messageText = '';
	// messageText = 'This is a very long message to test with for the time being. It is a great message, many are saying it could in fact be the greatest long message in presidential history. This message is very proud of the economy';

	constructor(private messagingService: MessagingService) {}

	ngOnInit() {
	}

	show(message) {
		this.broadcastMessageId = message.Id;
		this.messageText = message.MessageText;
		// this.setBannerHeight();
		this.data = this.messageText;
		this.open = true;
	}

	close() {
		this.data = '';
		this.closing = true;
		this.open = false;
	}

	ok() {
		const ids = [this.broadcastMessageId];
		const notificationContent: HTMLDivElement = document.querySelector('.notificationContent');
		notificationContent.style.height = '0px';
		notificationContent.style.paddingTop = '0px';
		notificationContent.style.paddingBottom = '0px';
		console.log('setting message read for ', ids);
		this.messagingService.sendToSocket({ Action: 'SetMessageRead', MessageIds: ids });
		this.messageText = '';
		this.close();
	}

	setBannerHeight() {
		const notificationContent: HTMLDivElement = document.querySelector('.notificationContent');
		if (this.messageText.length === 0) {
			return;
		}
		const charsPerLine = window.innerWidth * .115;
		const totalLines = Math.max(Math.floor(this.messageText.length / charsPerLine), 1);

		if (totalLines !== this.totalLines || notificationContent.style.height === '0px' ) {
			this.totalLines = totalLines;
			const factor = this.totalLines > 10 ? 18 : this.totalLines > 5 ? 12 : 5;
			const totalHeight = 64 + this.totalLines * factor;
			notificationContent.style.height = `${totalHeight}px`;
			notificationContent.style.maxHeight = `${totalHeight}px`;
			if (this.totalLines > 1) {
				notificationContent.style.paddingTop = '15px';
				notificationContent.style.paddingBottom = '15px';
			}
		}
	}

	// @HostListener('window:resize', ['$event']) onResize(event) {
	// 	this.setBannerHeight();
	// }
}

import { Injectable } from '@angular/core';
// tslint:disable-next-line:import-blacklist
import * as Rx from 'rxjs/Rx';

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {
	constructor() { }

	private subject: Rx.Subject<MessageEvent>;

	public connect(url): Rx.Subject<MessageEvent> {
		if (!this.subject) {
			this.subject = this.create(url);
			console.log('Successfully connected: ' + url);
		}
		return this.subject;
	}

	private create(url): Rx.Subject<MessageEvent> {
		const ws = new WebSocket(url, 'chat');

		const observable = Rx.Observable.create(
			(obs: Rx.Observer<MessageEvent>) => {
				ws.onmessage = obs.next.bind(obs);
				ws.onerror = obs.error.bind(obs);
				ws.onclose = obs.complete.bind(obs);
				return ws.close.bind(ws);
			});
		const observer = {
			next: (data: Object) => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify(data));
				}
			}
		};
		return Rx.Subject.create(observer, observable);
	}

	private disconnectSocket() {
		// this.mysocket.close();
		// this.subject.close();
		console.log('disconnected from the socket');
	}

}

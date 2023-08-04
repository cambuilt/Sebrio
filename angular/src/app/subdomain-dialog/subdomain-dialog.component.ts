import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { NgModel } from '@angular/forms';
import { SystemService } from '../services/system.service';

@Component({
	selector: 'app-subdomain-dialog',
	templateUrl: './subdomain-dialog.component.html',
	styleUrls: ['./subdomain-dialog.component.css']
})

export class SubdomainDialogComponent implements OnInit, AfterViewInit {
	objectForm = [];
	@ViewChild('subdomainForm') subdomainForm: NgModel;
	subdomain: string;

	constructor(private systemService: SystemService, private authService: AuthService, public dialogRef: MatDialogRef<SubdomainDialogComponent>) { }

	ngAfterViewInit() {
		this.objectForm.push(this.subdomainForm);
	}

	ngOnInit() {
		const firstField: HTMLInputElement = document.querySelector('#firstField');
		firstField.focus();
	}

	resetAdd() {
		this.objectForm.forEach(c => {
			c.reset();
		});
	}

	saveForm() {
		let formValid = true;
		this.objectForm.forEach(c => {
			c.control.markAsDirty();
			c.control.markAsTouched();
			c.control.updateValueAndValidity();
			if (!c.valid) {
				formValid = false;
			}
		});
		return formValid;
	}

	setSubdomain() {
		if (this.saveForm()) {
			localStorage.setItem('subdomain', this.subdomain);
			this.authService.subdomain = this.subdomain;
			this.dialogRef.close();
		}
	}

}

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as moment from 'moment';
import { UtilsService } from '../services/utils.service';

@Component({
	selector: 'app-abn-form',
	templateUrl: './abn-spanish.component.html',
	styleUrls: ['./abn-spanish.component.css']
	// templateUrl: './abn-form.component.html',
	// styleUrls: ['./abn-spanish.component.css']
})
export class AbnFormComponent implements OnInit {

	options = {
		1: false,
		2: false,
		3: false
	};
	_printIframe: any;
	language = 'english';
	signature = '';
	totalAmount: any;
	tests = [];
	charges = [10.60, 28.86, 27.24, 31.36];
	reasons = [
		`Medicare may not pay for these tests because they do not meet the
		criteria for medical necessity and frequency limitations established by Medicare
		regarding how often this test will be paid`, `Medicare does not pay for these tests as often as this (denied as too frequent)`, `Medicare does not pay for experimental or research tests`
	];
	mainKey: any;
	englishKey = {
		Headers: {
			One: `Patient Name: `,
			Two: `Identification Number: `,
			Three: `Advance Beneficiary Notice of Noncoverage (ABN)`,
			Four: `Notifier: `
		},
		Section1: {
			One: 'NOTE:',
			Two: `If Medicare doesn't pay for the`,
			Three: `Laboratory test(s)`,
			Four: `below, you may have to pay.`,
			Five: `Medicare does not pay for everything, even some care that you or your health care provider have good reason to think you need. We expect Medicare may not pay for the`,
			Six: `Laboratory tests(s)`,
			Seven: `below.`
		},
		TableSection: {
			One: `Laboratory Test:`,
			Two: `Reason Medicare May Not Pay:`,
			Three: `Estimated Cost:`,
			Four: `Total Cost:`
		},
		Section3: {
			One: `WHAT YOU NEED TO DO KNOW:`,
			Two: `Read this notice, so you can make an informed	decision about your care.`,
			Three: `Ask us any questions that you may have after you finished reading.`,
			Four: `Choose an option below about whether to receive the`,
			Five: `Laboratory tests(s)`,
			Six: `listed above.`,
			Seven: `Note:`,
			Eight: `If you choose Option 1 or 2, we may help you to use any other insurance`,
			Nine: `that you might have, but Medicare cannot require us to do this.`
		},
		OptionsSection: {
			Option: `OPTION`,
			One: `OPTIONS: Check only one box. We cannot choose a box for you.`,
			Two: `I want the`,
			Three: ` listed above. You may ask to be paid now, but I also want Medicare billed for an official decision on payment, which is sent to me on a Medicare Summary Notice (MSN). I understand that if Medicare doesn't pay, I am responsible for payment, but`,
			Four: `I can appeal to Medicare`,
			Five: `by following the directions on the MSN. If Medicare does pay, you will refund any payments I made to you, less co-pays or deductibles.`,
			Six: `I want the `,
			Seven: `listed above, but do not bill Medicare. You may ask to be paid now as I am responsible for payment. `,
			Eight: `I cannot appeal if Medicare is not billed.`,
			Nine: `I don't want the `,
			Ten: `listed above. I understand with this choice I am not responsible for payment, and `,
			Eleven: `I cannot appeal to see if Medicare would pay.`
		},
		AdditionalSection: {
			One: `Additional Information:`,
			Two: ``,
			// Two: `If you Choose Option 3, you should notify your doctor who ordered these Laboratory Test(s) that you did not receive them.`,
			Three: `This notice gives our opinion, not an official Medicare decision.`,
			Four: `If you have other questions on this notice or Medicare billing, call `,
			Five: `Signing below means that you have received and understand this notice. You also receive a copy.`,
		},
		Signature: {
			One: `Signature: `,
			Two: `Date: `
		},
		FinePrint: {
			One: `CMS does not discriminate in its programs and activities. To request this publication in an alternative format, please call: 1-800-MEDICARE or email: AltFormatRequest@cms.hhs.gov.`,
			Two: `According to the Paperwork Reduction Act of 1995, no persons are required to respond to a collection of information unless it displays a valid OMB control number. The valid OMB control number for this information collection is 0938-0566. The time required to complete this information collection is estimated to average 7 minutes per response, including the time to review instructions, search existing data resources, gather the data needed, and complete and review the information collection. If you have comments concerning the accuracy of the time estimate or suggestions for improving this form, please write to: CMS, 7500 Security Boulevard, Attn: PRA Reports Clearance Officer, Baltimore, Maryland 21244-1850.`,
			Three: `Form CMS-R-131 (Exp. 03/2020)`,
			Four: `Form Approved OMB No. 0938-0566`
		}
	};


	spanishKey = {
		Headers: {
			One: `Nombre de paciente: `,
			Two: `Número de identificación: `,
			Three: `Notificación previa de NO-cobertura al beneficiario (ABN)`,
			Four: `Notificante: `
		},
		Section1: {
			One: 'NOTA: ',
			Two: `Si Medicare no paga`,
			Three: `Prueba(s) de laboratorio`,
			Four: `ca continuación, usted deberá pagar.`,
			Five: `Medicare no paga todo, incluso ciertos servicios que, según usted o su médico, están justificados. Prevemos que Medicare no pagará`,
			Six: `Prueba de laboratorio`,
			Seven: `a continuación.`
		},
		TableSection: {
			One: `Prueba de laboratorio:`,
			Two: `Razón por la que no está cubierto por Medicare: `,
			Three: `Costo estimado:`,
			Four: `Total Cost:`
		},
		Section3: {
			One: `Lo que usted necesita hacer ahora:`,
			Two: `Lea la presente notificación, de manera que pueda tomar una decisión fundamentada sobre la atención que recibe.`,
			Three: `Háganos toda pregunta que pueda tener después de que termine de leer.`,
			Four: `Escoja una opción a continuación sobre si desea recibir`,
			Five: `Prueba de laboratorio`,
			Six: `mencionado anteriormente.`,
			Seven: `Nota:`,
			Eight: `Si escoge la opción 1 ó 2, podemos ayudarlo a usar cualquier otro seguro que `,
			Nine: `tal vez tenga, pero Medicare no puede exigirnos que lo hagamos.`
		},
		OptionsSection: {
			Option: `OPCIÓN`,
			One: `OPCIONES: Sírvase marcar un recuadro solamente. No podemos escoger un  recuadro por usted.`,
			Two: `Quiero`,
			Three: ` mencionado anteriormente. Puede cobrarme ahora, pero también deseo que se cobre a Medicare a fin de que se expida una decisión oficial sobre el pago, la cual se me enviará en el Resumen de Medicare (MSN). Entiendo que si Medicare no paga, soy responsable por el pago, pero`,
			Four: `puedo apelar a Medicare`,
			Five: `según las instrucciones en el MSN. Si Medicare paga, se me reembolsarán los pagos que he realizado, menos los copagos o deducibles.`,
			Six: `Quiero `,
			Seven: `mencionado anteriormente, pero que no se cobre a Medicare. Puede solicitar que se le pague ahora dado que soy responsable por el pago. `,
			Eight: `No tengo derecho a apelar si no se le cobra a Medicare.`,
			Nine: `No quiero `,
			Ten: `mencionado anteriormente. Entiendo que con esta opción no soy responsable por el pago y `,
			Eleven: `no puedo apelar para determinar si pagaría Medicare.`
		},
		AdditionalSection: {
			One: `Additional Information:`,
			Two: `If you Choose Option 3, you should notify your doctor who ordered these Laboratory Test(s) that you did not receive them.`,
			Three: `This notice gives our opinion, not an official Medicare decision.`,
			Four: `If you have other questions on this notice or Medicare billing, call `,
			Five: `Signing below means that you have received and understand this notice. You also receive a copy.`,
		},
		Signature: {
			One: `Firma: `,
			Two: `Fecha: `
		},
		FinePrint: {
			One: `CMS no discrimina en sus programas y actividades. Para solicitar esta publicación en un formato alternativo, por favor llame al: 1-800-MEDICARE o escriba al correo electrónico: AltFormatRequest@cms.hhs.gov.`,
			Two: `De conformidad con la Ley de reducción de los trámites burocráticos de 1995, nadie estará obligado a responder en todo pedido para recabar información a menos que se identifique con un número de control OMB válido. El número de control OMB válido para esta recolección de información es 0938-0566. El tiempo necesario para completar esta solicitud de información se calcula, en promedio, 7 minutos por respuesta, incluido el tiempo para revisar las instrucciones, buscar en fuentes de datos existentes, recabar los datos necesarios y llenar y revisar los datos recogidos. Si tiene comentarios sobre la precisión del cálculo del tiempo o sugerencias para mejorar el presente formulario, sírvase escribir a: CMS, 7500 Security Boulevard, Attn: PRA Reports Clearance Officer, Baltimore, Maryland 21244-1850.`,
			Three: `Formulario  CMS-R-131 (Exp. 03/2020)`,
			Four: `Formulario aprobado OMB No 0938-0566
			`
		}
	};
	cordova = false;

	constructor(private utilsService: UtilsService, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialog, private printer: Printer) { }

	ngOnInit() {
		console.log('data passed to abn: ', this.data);
		this.determineLanguage(this.data.Language);
		this.getReason();
		this.getTotal();
		if ((<any>window).deviceReady === true) {
			this.cordova = true;
		}
	}

	determineLanguage(lang) {
		console.log('language passed is: ', lang);
		switch (lang) {
			case 'english': this.mainKey = this.englishKey; this.language = 'english'; break;
			case 'spanish': this.mainKey = this.spanishKey; this.language = 'spanish'; break;
		}
	}

	checkBox(id) {
		Object.keys(this.options).forEach(key => {
			if (key !== id) {
				this.options[key] = false;
			}
		});
	}

	openSignaturePad() {
		const newDialog = this.dialog.open(SignaturePadComponent, {
			data: '',
			panelClass: 'signatureDialog',
			backdropClass: 'fullPageOverlay',
		});
		newDialog.beforeClose().subscribe(result => {
			this.signature = newDialog.componentInstance.signatureURL;
		});
	}

	getReason() {
		// let total = 0;
		this.data.Tests.forEach(test => {
			console.log('test: ', test);
			this.tests.push({ Code: test.Code, Description: test.Description, ChargeAmount: test.ChargeAmount === '' ? this.charges[Math.floor(Math.random() * 3) + 1] : test.ChargeAmount, Reason: this.reasons[Math.floor(Math.random() * 2) + 1] });
			// total += parseFloat(test.ChargeAmount.toString()); // this will work once tests hace charges
		});
		// console.log('total: ', total);
		// this.totalAmount = total;
	}

	androidPrint() {
		const data = document.querySelector('#oReportDiv');
		html2canvas(data).then(canvas => {
			const contentDataURL = canvas.toDataURL('image/png');
			let newUrl = contentDataURL.replace('data:image/png;base64,', '');
			(<any>window).plugins.PrintPDF.isPrintingAvailable((isAvailable) => {
				this.utilsService.showError(`printing available? ${isAvailable}`);
				if (isAvailable === true) {
					setTimeout(() => (<any>window).testPrint(newUrl), 2000);
				} else { this.utilsService.showError(`printing is not available on your device`); }
			});
		});
	}

	// androidPrint2() {
	// 	const data = document.querySelector('#oReportDiv');
	// 		(<any>window).plugins.PrintPDF.isPrintingAvailable((isAvailable) => {
	// 			this.utilsService.showError(`printing available? ${isAvailable}`);
	// 			if (isAvailable === true) {
	// 				setTimeout(() => (<any>window).testPrint(data.innerHTML.toString()), 2000);
	// 			} else { this.utilsService.showError(`printing is not available on your device`); }
	// 		});
	// }

	androidPrint2() {
		const data = document.querySelector('#oReportDiv');
		this.printer.print(data.innerHTML.toString()).then(res => {
			this.utilsService.showError(`response from android print: ${res}`);
		});
	}



	getTotal() {
		let total = 0;
		this.tests.forEach(test => {
			// tslint:disable-next-line:radix
			total += parseFloat(test.ChargeAmount.toString());
		});
		this.totalAmount = parseFloat(total.toString()).toFixed(2);
	}


	print() {
		const data = document.querySelector('#oReportDiv');
		html2canvas(data).then(canvas => {
			const contentDataURL = canvas.toDataURL('image/png');
			let newUrl = contentDataURL.replace('data:image/png;base64,', '');
			setTimeout(() => (<any>window).testPrint(newUrl), 500);
		});
	}

	generatePDF(action) {
		const data = document.querySelector('#oReportDiv');
		html2canvas(data).then(canvas => {
			const imgWidth = 210;
			const imgHeight = canvas.height * imgWidth / canvas.width;
			const contentDataURL = canvas.toDataURL('image/png');
			let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
			let position = 0;
			pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
			if (action === 'download') {
				setTimeout(() => { pdf.save(`ABN Form`); }, 1000); // Generated PDF
			} else {
				let blob = pdf.output('blob');
				this.printDesktop(blob);
				this.dialog.closeAll();
			}
		});
	}


	printDesktop(blob) {
		const fileUrl = URL.createObjectURL(blob);
		let iframe = this._printIframe;
		if (!this._printIframe) {
			iframe = this._printIframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			iframe.style.display = 'none';
			iframe.onload = function () {
				setTimeout(() => {
					iframe.focus();
					iframe.contentWindow.print();
				}, 100);
			};
		}
		iframe.src = fileUrl;
	}

	getDate() {
		let date = new Date();
		return moment(date).format('MM/DD/YYYY');
	}

}

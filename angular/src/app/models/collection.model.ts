import { OrderedTest } from './ordered-test.model';
import { Patient } from './patient.model';

export class Collection {
	Lab: {
		Code: string;
	};
	SpotCode: string;
	Bed: string;
	IsCancelled: boolean;
	IsProblem: boolean;
	IsRequested: boolean;
	IsRescheduled: boolean;
	IsTransferred: boolean;
	CancellationReason: string;
	CancellationComments: string;
	CancelledBy: {
		FirstName: string;
		LastName: string;
		Username: string;
	};
	Code: string;
	CollectedLocation: {
		AddressLine1: string;
		AddressLine2: string;
		City: string;
		Country: string;
		County: string;
		State: string;
		ZipCode: string;
		Code: string;
		Id: string;
	};
	Id: string;
	Patient: Patient;
	Priority: {
		Code: string;
		Description: string;
		Id: string;
		Priority: string;
		ShowColor: boolean;
	};
	ProblemReason: string;
	ReportedBy: {
		FirstName: string;
		LastName: string;
		Username: string;
	};
	OrderedTest: OrderedTest;
	OrderedTests: any;
	ScheduledDateTime: string;
	Status: string;
	TransferReason: string;
	TransferredBy: {
		FirstName: string;
		LastName: string;
		Username: string;
	};
	CollectionInformation: {
		IDDoc1ConfirmType: string;
		IDDoc2ConfirmType: string;
		CaregiverName: string;
		ManualIdentifyConfirmed: boolean;
		ScanIdentifyConfirmed: boolean;
		CollectionSite: string;
		Workload: string;
		WorkloadQuantity: number;
		CollectionComments: string;
		CentralLineStatus: boolean;
		FastingStatus: string;
		CollectionNote: string;
		PrintComments: string;
		CollectionStartTime: string;
		CollectionEndTime: string;
	};

	constructor() {
		this.Lab = {
			Code: ''
		};
		this.SpotCode = '';
		this.Bed = '';
		this.IsCancelled = false;
		this.IsProblem = false;
		this.IsRequested = false;
		this.IsRescheduled = false;
		this.IsTransferred = false;
		this.CancellationReason = '';
		this.CancellationComments = '';
		this.CancelledBy = {
			FirstName: '',
			LastName: '',
			Username: ''
		};
		this.Code = '';
		this.CollectedLocation = {
			AddressLine1: '',
			AddressLine2: '',
			City: '',
			Country: '',
			County: '',
			State: '',
			ZipCode: '',
			Code: '',
			Id: ''
		};
		this.Id = '';
		this.Patient = new Patient();
		this.Priority = {
			Code: '',
			Description: '',
			Id: '',
			Priority: '',
			ShowColor: false
		};
		this.ProblemReason = '';
		this.ReportedBy = {
			FirstName: '',
			LastName: '',
			Username: ''
		};
		this.OrderedTest = new OrderedTest();
		this.OrderedTests = [];
		this.ScheduledDateTime = '';
		this.Status = '';
		this.TransferReason = '';
		this.TransferredBy = {
			FirstName: '',
			LastName: '',
			Username: ''
		};
		this.CollectionInformation = {
			IDDoc1ConfirmType: '',
			IDDoc2ConfirmType: '',
			CaregiverName: '',
			ManualIdentifyConfirmed: false,
			ScanIdentifyConfirmed: false,
			CollectionSite: '',
			Workload: '',
			WorkloadQuantity: 0,
			CollectionComments: '',
			CentralLineStatus: false,
			FastingStatus: '',
			CollectionNote: '',
			PrintComments: '',
			CollectionStartTime: '',
			CollectionEndTime: ''
		};
	}
}

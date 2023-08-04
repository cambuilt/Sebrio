export class OrderedTest {
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
	ProblemReason: string;
	ReportedBy: {
		FirstName: string;
		LastName: string;
		Username: string;
	};
	RescheduleComments: string;
	RescheduledBy: {
		FirstName: string;
		LastName: string;
		Username: string;
	};
	TransferReason: string;
	TransferredBy: {
		FirstName: string;
		LastName: string;
		Username: string;
	};
	Code: string;
	Container: {
		Code: string,
		Description: string,
		Name: string,
		ContainerRank: string,
		ContainerType: string,
		DrawOrder: string,
		Id: string,
		SpecimenCode: string,
		StorageCode: string,
		TopColor: string,
		TopColorName: string,
		Volume: string
	};
	DateTimeObserved: string;
	DateObserved: string;
	Description: string;
	Destination: string;
	LabDepartment: string;
	Id: string;
	Instructions: string;
	LaboratoryAccessionId: string;
	Notes: string;
	Priority: {
		Code: string,
		Description: string,
		Id: string,
		Priority: string,
		ShowColor: boolean
	};
	Quantity: number;
	Volume: string;

	constructor() {
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
		this.ProblemReason = '';
		this.ReportedBy = {
			FirstName: '',
			LastName: '',
			Username: ''
		};
		this.TransferReason = '';
		this.TransferredBy = {
			FirstName: '',
			LastName: '',
			Username: ''
		};

		this.Code = '';
		this.Container = {
			Code: '',
			Description: '',
			Name: '',
			ContainerRank: '',
			ContainerType: '',
			DrawOrder: '',
			Id: '',
			SpecimenCode: '',
			StorageCode: '',
			TopColor: '',
			TopColorName: '',
			Volume: ''
		};
		this.DateTimeObserved = '';
		this.DateObserved = '';
		this.Description = '';
		this.Destination = '';
		this.LabDepartment = '';
		this.Id = '';
		this.Instructions = '';
		this.LaboratoryAccessionId = '';
		this.Notes = '';
		this.Priority = {
			Code: '',
			Description: '',
			Id: '',
			Priority: '',
			ShowColor: false
		};
		this.Quantity = 0;
		this.Volume = '';
	}
}

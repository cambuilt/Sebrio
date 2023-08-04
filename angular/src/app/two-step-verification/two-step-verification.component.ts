import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UtilsService } from '../services/utils.service';
import { MatDialog } from '@angular/material';
import { AuthService } from '../services/auth.service';
import { NgModel } from '@angular/forms';
import { TranslationService } from 'angular-l10n';

@Component({
  selector: 'app-two-step-verification',
  templateUrl: './two-step-verification.component.html',
  styleUrls: ['./two-step-verification.component.css']
})
export class TwoStepVerificationComponent implements OnInit, AfterViewInit {

  constructor(public authService: AuthService, private utilsService: UtilsService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  onSignin() {
    
  }

}

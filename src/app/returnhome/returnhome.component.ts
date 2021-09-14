import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { SessionService } from '../session.service';
import { Router } from '@angular/router';
import UIkit from 'uikit';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-returnhome',
  templateUrl: './returnhome.component.html',
  styleUrls: ['./returnhome.component.scss']
})

export class ReturnhomeComponent implements OnInit {
  credits: number;
  loggedin: boolean = true;
  openVerify: true;
  lblShow: boolean = true;
  passType: string = "password";
  verErrorMes: boolean = false;
  verErrorMes2: boolean = false;
  isEng: boolean = true;

  get hasCashback(): number {
    return this._cashBackAmount;
  }
  get isSubscribed(): boolean {
    return this._isSubscribed;
  }

  get isChecked(): boolean {
    return this._isChecked;
  }

  get gamesPlayed(): number {
    return this._gamesPlayed;
  }

  // Check if already a subscribed player
  private _isSubscribed = false;
  // Check if he has cashback waiting
  public _cashBackAmount = 0;
  // Check if check is checked so he can click the button
  private _isChecked = false;
  // How many (1st free or billable) games the user has played
  public _gamesPlayed = 0;

  public errorMsg = "";
  public noMoreRealGames = "Unfortunately, your current plan is not allowed to participate.\nTry using another number.";
  public noMoreDemoGames = "No more demo games available! \n Why don't you try the real thing?";

  checkCheckBoxvalue(event) {
    console.log(event.target.checked);
    this._isChecked = event.target.checked;
  }

  GoSubscribe() {

  }
  startGame() {
    // console.log("Games Played: " + this.gamesPlayed);
    // this.sessionService.state = "INACTIVE"
    console.log("Play Main Game!");
    this.sessionService.gamesPlayed++;
    this.router.navigate(['game']);

  }

  startFreeGame() {
    this.router.navigate(['freetimegame']);
  }

  constructor(
    private dataService: DataService,
    private sessionService: SessionService,
    private router: Router,
    private translate: TranslateService) {
    translate.onLangChange.subscribe(lang => {
      if (this.translate.currentLang == 'en')
        this.isEng = true;
      else
        this.isEng = false;

    })
  }

  ngOnInit() {
    if (this.translate.currentLang == 'en')
      this.isEng = true;
    else
      this.isEng = false;

    // console.log( "Has Credit: " + this.sessionService.hasCredit() );
    console.log("Played Games: " + this.sessionService.gamesPlayed);
    // user login validation check
    if (!this.sessionService.token || !this.sessionService.isSubscribed || !this.sessionService.isEligible || this.sessionService.isUnsub()) {
      // wanna inform the user here?
      // if (this.sessionService.isUnsub())
        this.router.navigate(['/home']);
      // else {
      //   // Redirect him to Home
      //   this.router.navigate(['/home'], { queryParams: { errorCode: 401 } });
      // }

    }
    else if (!this.sessionService.isEligible) {
      this.router.navigate(['/home'], { queryParams: { errorCode: 1026 } });
    }
    else {

      this._isSubscribed = this.sessionService.isSubscribed;
      // console.log(this.sessionService.msisdn);
      // console.log("this.session " + this.sessionService.token);
      // this._cashBackAmount = this.sessionService._cashBackAmount;
      // this._cashBackAmount = 500;

      // TOBE ERASED
      // This resets the games played every time


      this.dataService.getUserProfile().then(
        (data: User) => {
          this.sessionService.user = data;
          this._gamesPlayed = this.sessionService.gamesPlayed;

          // console.log("this._gamesPlayed " + this._gamesPlayed);
          // console.log("this.sessionService.gamesPlayed " + this.sessionService.gamesPlayed);

          this.CheckCredits();
          // Set Properties here
          // this._gamesPlayed = 3;
          // this._cashBackAmount = this.sessionService.user.wallet.pendingMaturityCashback + this.sessionService.user.wallet.pendingTransferCashback;
        },
        (err) => {

        }

      );
    }
  }

  CheckCredits() {
    // console.log("Checking Credits: " + this.sessionService.hasCredit());

    this.sessionService.hasCredit();

  }

  OpenOTPPurchase() {
    // Check if user state is PENDING
    if (this.sessionService.isPending()) {
      // If yes show message that user already is waiting for Credit+Link
      this.verErrorMes2 = true;
    } else {
      // If not
      this.dataService.purchaseCreditRequest().subscribe((resp: any) => {
        // console.log(resp);
        // Change Session state 
        this.sessionService.state = "PENDING";
        // Open Modal
        let modal = UIkit.modal("#otp");
        modal.show();
      },
        (err: any) => {
          console.log("Error with Sending purchase Pin!!!");
          let modal = UIkit.modal("#error");
          modal.show();
        });
    }
  }


  OpenPass() {
    this.lblShow = !this.lblShow;
    console.log("Hide/Show Password: " + this.lblShow);
    if (this.lblShow)
      this.passType = "password";
    else
      this.passType = "test";
  }

  verify(pass: string) {

    this.dataService.purchaseCredit(pass).subscribe((resp: any) => {

      // Get JWT token from response header and keep it for the session
      const userToken = resp.headers.get('X-Access-Token');
      if (userToken)  // if exists, keep it
        this.sessionService.token = userToken;

      // Deserialize payload
      const body: any = resp.body; // JSON.parse(response);

      if (body.hasCredit != undefined)
        this.sessionService.hasCredits = body.hasCredit;

      console.log("hasCredit: " + this.sessionService.hasCredit());


      this.sessionService.user = body;
      this._gamesPlayed = this.sessionService.gamesPlayed;
      console.table(body);

      if (this.sessionService.user.credits > 0) {
        // Burn Credit
        this.startGame();
      }

      // Goto the returnHome page
      //this.router.navigate(['/returnhome']);
    },
      (err: any) => {
        console.log("Error With Pin!!!");
        this.verErrorMes = true;
      });
  }

  resetPin() {
    console.log("Reset PIN!");
  }
}

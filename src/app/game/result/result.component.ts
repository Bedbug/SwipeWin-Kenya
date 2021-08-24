import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../session.service';
import { Router } from '@angular/router';
import UIkit from 'uikit';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  get secondVariant(): boolean {
    return this._secondVariant;
  }
  get cashbackAmount(): number {
    return this._cashbackAmount;
  }
  get rightAnswerCount(): number {
    return this._rightAnswerCount;
  }
  get totalAnswerCount(): string {
    return (this._rightAnswerCount +"/"+ (this._rightAnswerCount + this._wrongAnswerCount));
  }
  get gamesPlayed(): number {
    return this._gamesPlayed;
  }
  get getScoreToday(): number {
    return this._totalDayScore;
  }
  
  lblShow:boolean = true;
  passType: string = "password";
  verErrorMes: boolean = false;
  verErrorMes2: boolean = false;

  private _firstTime = false;
  public _gamesPlayed = 2;
  private _rightAnswerCount = 10;
  private _wrongAnswerCount = 10;
  private _cashbackAmount = 0;
  private _secondVariant = true;
  private _firstGameEver = true;
  private _firstGameToday = true;
  private _isInTop = true;
  private _bestWeekScore = 0;
  private _totalDayScore = 0;
  
  constructor( public session: SessionService, private router: Router, private translate: TranslateService, private dataService: DataService  ) { }

  ngOnInit() {
    if (!this.session.lastGameResults)
      this.router.navigate(['home']);
    // console.log("Today Score: "+this.session.lastGameResults.pointsWonToday);
    
    this._rightAnswerCount = this.session.lastGameResults.correctAnswers;
    this._wrongAnswerCount = this.session.lastGameResults.wrongAnswers;
    this._cashbackAmount = this.session.lastGameResults.cashbackWon || 0;
    this._firstTime = this.session.gamesPlayed == 1;
    this._gamesPlayed = this.session.gamesPlayed;
    this._bestWeekScore = this.session.lastGameResults.isBestScoreLastWeek;
    this._totalDayScore = this.session.lastGameResults.pointsWonToday;
    this._isInTop = this.session.lastGameResults.isTop100;
    this.session.hasCredits = this.session.lastGameResults.userHasCredit;
    this.session.state = this.session.lastGameResults.userState;

    // console.table(this.session.lastGameResults);
    // console.log(this.session.hasCredits);
    // if(this.session.hasCredits)
    // this.session.hasCredits = false;
    // console.log(this.session.hasCredits);

    // Check Best Score Today
    var bestScore = this.session.user.bestScore;
    var bestScoreToday = this.session.user.bestScoreToday;
    if(this._rightAnswerCount > bestScoreToday)
      this.session.user.bestScoreToday = this._rightAnswerCount
    if(this._rightAnswerCount > bestScore)
      this.session.user.bestScore = this._rightAnswerCount
    
    // console.log("Games Played: "+ this._gamesPlayed);
    // console.log("cashBack Won: "+ this._cashbackAmount);
    // console.log("hasCredit: " + this.session.hasCredit());
    // console.log("Credits: " + this.session.credits);
    // console.log("State: " + this.session.state);
    var modal = UIkit.modal("#result", {escClose: false, bgClose: false});
    setTimeout( () => { modal.show(); }, 1000 );
      
  }
  
  startGame() {
    
      console.log("Play Main Game!");
      this.session.gamesPlayed++;
      this.session.credits--;
      console.log("this.sessionService.credits: "+this.session.credits);
       this.router.navigate(['game']);
    // }
  }

  OpenOTPPurchase() {
    // Check if user state is PENDING
    if (this.session.isPending()){
      // If yes show message that user already is waiting for Credit+Link
      this.verErrorMes2 = true;
    } else {
      this.dataService.purchaseCreditRequest().subscribe((resp: any) => {
        // Update the user State
        this.session.state = "PENDING";
        // Open Modal
        let modal = UIkit.modal("#otp");
        modal.show();
      },
        (err: any) => {
          console.log("Error with Sending purchase Pin!!!");
          // Open Error Modal
          let modal = UIkit.modal("#error", {escClose: false, bgClose: false});
          modal.show();
        });
    }
  }

  
  OpenPass(){
    this.lblShow = !this.lblShow;
    console.log("Hide/Show Password: " + this.lblShow);
    if(this.lblShow)
      this.passType = "password";
    else
      this.passType = "test";
  }

  verify(pass: string) {

    this.dataService.purchaseCredit(pass).subscribe((resp: any) => {

      // Get JWT token from response header and keep it for the session
      const userToken = resp.headers.get('X-Access-Token');
      if (userToken)  // if exists, keep it
        this.session.token = userToken;

      // Deserialize payload
      const body: any = resp.body; // JSON.parse(response);
      
      if (body.credits > 0)
        this.session.credits = body.credits;

        console.log("hasCredit: " + this.session.hasCredit());
     

      this.session.user = body;
      this._gamesPlayed = this.session.gamesPlayed;
      console.table(body);

      if (this.session.credits > 0) {
        // Burn Credit
        this.session.credits--;
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
  
  OpenResultAgain() {
    console.log("Open Result Again");
    let modal = UIkit.modal("#result", {escClose: false, bgClose: false});
    modal.show();
  }
  
  returnHome() {
    this.router.navigate(['returnhome']);
  }
  
  startFreeGame() {
    this.router.navigate(['freetimegame']);
  }
  
  hasCredit() {
	  return this.session.hasCredit();
  }
  
  get TopText(): string {
    if(this._rightAnswerCount == 0)
      return this.translate.instant('END.MES_01')
    if(this._rightAnswerCount == 1)
      return this.translate.instant('END.MES_02')
    if(this._rightAnswerCount >= 2 && this._rightAnswerCount <= 4)
      return this.translate.instant('END.MES_03')
    if(this._rightAnswerCount >= 5 && this._rightAnswerCount <= 9)
      return this.translate.instant('END.MES_04')
    if(this._rightAnswerCount >= 10)
      return this.translate.instant('END.MES_05')
  }
  
  get answerMessage(): string {
    if(this._rightAnswerCount == 0)
      return this.translate.instant('END.MES_06')
    if(this._rightAnswerCount == 1)
      return this.translate.instant('END.MES_06')
    if(this._rightAnswerCount >= 2 && this._rightAnswerCount <= 4)
      return this.translate.instant('END.MES_06')
    if(this._rightAnswerCount >= 5 )
      return this.translate.instant('END.MES_06')
    // if(this._rightAnswerCount >= 10)
    //   return "Прекрасно!"
  }
  
  get FooterText(): string {
    console.log("Games Played: "+ this._gamesPlayed);
    // if(this._firstGameEver){
    //   return "Станьте ближе к 25 000 ₽\nПолучите дополнительную игру сейчас!"
    // }else 
    if(this._gamesPlayed == 1){
      return "Keep playing for today’s 10,000$"
    }else if(this._rightAnswerCount <= this._bestWeekScore) {
      return "Keep playing for today’s 10,000$"
    }else if(this._isInTop){
        if(this._gamesPlayed <=2)
          return "Keep playing for today’s 10,000$"
        else
          return "Keep playing for today’s 10,000$"
    }else if(this._rightAnswerCount > this._bestWeekScore){
        if(this._gamesPlayed <=2)
          return "Keep playing for today’s 10,000$"
        else
          return "Keep playing for today’s 10,000$"
    }else{
      if(this._gamesPlayed <=2)
          return "Keep playing for today’s 10,000$"
        else
          return "Keep playing for today’s 10,000$"
    }
  }


}

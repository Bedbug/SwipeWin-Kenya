import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { SessionService } from '../session.service';
import { LocalizationService } from '../localization.service';
import { DefaultUrlSerializer, Router, ActivatedRoute } from '@angular/router';
import { UrlTree } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import UIkit from 'uikit';
import { createPipeInstance } from '@angular/core/src/view/provider';
import { debug } from 'util';
import { TranslateService } from '@ngx-translate/core';
import { parsePhoneNumberFromString } from 'libphonenumber-js'

declare global {
  interface Window {
    dataLayer: any;
  }
}
// import * as libphonenumber from 'google-libphonenumber';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class HomeComponent implements OnInit {
  loginOn: number;
  AutoLogin: boolean;
  openVerify: boolean;
  lblShow: boolean = true;
  passType: string = "password";
  loggedin: boolean;
  credits: number;
  gamesPlayed: number;
  openSubSuccess: boolean = false;
  alertNumber: boolean = false;
  verErrorMes: boolean = false;
  isEng: boolean = true;

  public inputValue: string = "";

  // get this form the User object
  get isHasCashback(): boolean {
    return this._isHasCashback;
  }

  // get this form the User objectusername
  get isSubscribed(): boolean {
    return this._isSubscribed;
  }

  public _isSubscribed = true;
  private _isHasCashback = false;
  public demoGamesPlayed = 0;
  public errorMsg = "";
  public noMoreRealGames = this.translate.instant('MESSAGES.MESSAGE_08');
  public noMoreDemoGames = this.translate.instant('MESSAGES.MESSAGE_09');
  public authError = this.translate.instant('MESSAGES.MESSAGE_10');
  public logOut = this.translate.instant('MESSAGES.MESSAGE_11');
  public blackListed = this.translate.instant('MESSAGES.MESSAGE_12');
  public noCredits = this.translate.instant('MESSAGES.MESSAGE_13');
  public isSubedText = this.translate.instant('MESSAGES.MESSAGE_18');


  public logOutBtn = true;
  public gotofaqBtn = false;

  public lastDemoPlayed: Date;
  public now: Date = new Date();

  public showLogin = false;
  public newLogin = true;

  lang: string;
  // Lottie
  public lottieConfig: Object;
  private anim: any;
  private animationSpeed: number = 1;
  public showConfirm: boolean = false;

  constructor(
    private location: Location,
    private dataService: DataService,
    private sessionService: SessionService,
    private localizationService: LocalizationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cookieService: CookieService,
    private translate: TranslateService

  ) {
    translate.onLangChange.subscribe(lang => {
      if (this.translate.currentLang == 'en')
        this.isEng = true;
      else
        this.isEng = false;

    })
  }


  ngOnInit() {

    let utm_source = null;
    let utm_medium = null;
    let utm_campaign = null;
    let utm_content = null;

    // UTMs
    var urlSer = new DefaultUrlSerializer();
    console.log('incoming path from Ath: ' + this.location.path());
    var urlTree: UrlTree = urlSer.parse(this.location.path());
    console.log('Url Tree : ' + urlTree);

    utm_source = urlTree.queryParams["utm_source"];
    utm_medium = urlTree.queryParams["utm_medium"];
    utm_campaign = urlTree.queryParams["utm_campaign"];
    utm_content = urlTree.queryParams["utm_content"];
    console.log("Check Params!");

    if(utm_source != null){
      console.log("Saving Params!");
      localStorage.setItem('utm_source', utm_source);
      localStorage.setItem('utm_medium', utm_medium);
      localStorage.setItem('utm_campaign', utm_campaign);
      localStorage.setItem('utm_content', utm_content); // Clear these after success to endpoint
      console.log("utm_source: "+utm_source);
      console.log("utm_medium: "+utm_medium);
      console.log("utm_campaign: "+utm_campaign);
      console.log("utm_content: "+utm_content);
    }

    console.log(this.translate.currentLang);
    if (this.translate.currentLang == 'en')
      this.isEng = true;
    else
      this.isEng = false;

    // Get Login On From LocalStorage
    this.loginOn = 0;
    this.openSubSuccess = false;

    

    // Detect if a unique link exists in the home path
    // implemented after https://medium.com/@tomastrajan/how-to-get-route-path-parameters-in-non-routed-angular-components-32fc90d9cb52
    let msisdnCode;
    let errorCode = null;
    let cidCode;

    this.activatedRoute.paramMap.subscribe((params) => {
      const code = params.get('msisdnCode');
      if (code !== 'home')
        msisdnCode = code;
    });
    this.activatedRoute.queryParams.subscribe(params => {
      errorCode = params["errorCode"];
      cidCode = params["cid"];
    });

    // if (cidCode)
    //   console.log("cidCode: " + cidCode);


    // Load the game settings
    this.dataService.fetchGameSettings().then(
      (data: any) => {
        this.sessionService.gameSettings = data;
        this.localizationService.init(this.sessionService.gameSettings.localization);
        let modal = UIkit.modal("#error");

        // Determine if an error code sent navigation to this state, then display the appropriate message
        if (errorCode) {
          switch (errorCode) {
            case '401': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('401'); break;
            case '1010': this.errorMsg = this.authError; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1010'); break;
            case '1026': this.errorMsg = this.blackListed; this.logOutBtn = true; this.gotofaqBtn = true; console.log('1026'); break;
            case '1023': this.errorMsg = this.noMoreRealGames; this.gotofaqBtn = false; this.logOutBtn = false; break;
            case '1021': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
            case '1025': this.errorMsg = this.noCredits; this.gotofaqBtn = false; this.logOutBtn = false; break;
          }

          if (this.sessionService.user)
            this.sessionService.reset();

          if (this.errorMsg !== '' && modal != null) {
            modal.show();
          }

        } else if (msisdnCode) {// Else, Determine if this is the mobile/Ussd/Sms user flow or the WiFi one
          // Mobile/Ussd/Sms flow here
          // console.log('Mobile /SMS /USSD user flow');
          this.AutoLogin = true;

          this.dataService.authenticateOrangeSSO(msisdnCode).subscribe((resp: any) => {

            // Get JWT token from response header and keep it for the session
            const userToken = resp.headers.get('X-Access-Token');

            if (userToken)  // if exists, keep it
              this.sessionService.token = userToken;

            // Deserialize payload
            const body: any = resp.body; // JSON.parse(response);
            // console.table(body);
            if (body.isEligible !== undefined)
              this.sessionService.isEligible = body.isEligible;
            if (body.isSubscribed != undefined)
              this.sessionService.isSubscribed = body.isSubscribed;
            if (body.gamesPlayedToday !== undefined)
              this.sessionService.gamesPlayed = body.gamesPlayedToday;
            if (body.hasCredit !== undefined)
              this.sessionService.hasCredits = body.hasCredit;

            // Update the user State
            this.sessionService.state = body.state;
            // this.sessionService.state = "INACTIVE";
            // console.log(this.sessionService.state);
            // console.log("Checking Credits: " + this.sessionService.hasCredit());

            if (body.credits > 0)
              this.sessionService.credits = body.credits;

            // console.log("hasCredit: " + this.sessionService.hasCredit());


            // Chage view state
            this.loggedin = true;
            this.openVerify = false;
            // if(!this.sessionService.isUnsub)
            this.router.navigate(['/returnhome']);
            // else{
            //   this.openSubSuccess = true;
            //   this.newLogin = true;
            // }

          },
            (err: any) => {
              this.AutoLogin = false;
              this.router.navigate(['/home']);
            });
        } else if (cidCode) {
          console.log('HE flow');
          // this.AutoLogin = true;

          this.dataService.authenticateCid(cidCode).subscribe((resp: any) => {

            // Get JWT token from response header and keep it for the session
            const userToken = resp.headers.get('X-Access-Token');

            if (userToken)  // if exists, keep it
              this.sessionService.token = userToken;

            // Deserialize payload
            const body: any = resp.body; // JSON.parse(response);
            // console.table(body);
            if (body.isEligible !== undefined)
              this.sessionService.isEligible = body.isEligible;
            if (body.isSubscribed != undefined)
              this.sessionService.isSubscribed = body.isSubscribed;
            if (body.gamesPlayedToday !== undefined)
              this.sessionService.gamesPlayed = body.gamesPlayedToday;
            if (body.hasCredit !== undefined)
              this.sessionService.hasCredits = body.hasCredit;

            // Update the user State
            this.sessionService.state = body.state;
            // this.sessionService.state = "INACTIVE";
            // console.log(this.sessionService.state);
            // console.log("Checking Credits: " + this.sessionService.hasCredit());

            if (body.credits > 0)
              this.sessionService.credits = body.credits;

            // Chage view state
            // this.loggedin = false;
            // this.openVerify = false;

            // Check The isSubscribed property, if true go on, if not fill the input with the cidcode

            if (this.sessionService.isSubscribed)
              this.router.navigate(['/returnhome']);
            else {
              // Autofill the input with the cidCode
              this.inputValue = "+254" + cidCode;
              return;
            }

          },
            (err: any) => {
              this.AutoLogin = false;
              this.router.navigate(['/home']);
            });
        }

        else {
          // WiFi flow here
          console.log('WiFi user flow');
        }
      },
      (err: any) => {
      });

    // Check AutoLogin or NOt
    this.AutoLogin = false;
    this.openVerify = false;
    this.loggedin = false;
  }

  public playGame($event) {
    // console.log('button is clicked');
    // $event.stopPropagation();
    this.showLogin = true;
  }

  logOutUser() {
    console.log("LoggingOut!");
    const allCookies: {} = this.cookieService.getAll();
    console.log(allCookies);
    this.cookieService.deleteAll('/');
    // Trying the updated MTS logout redirect with the logout parameter
    this.sessionService.reset();
    this.router.navigate(['/home']);
    // this.dataService.logoutRedirect();

  }

  gotoFaqPage() {
    this.logOutUser();
    this.router.navigate(['/faq']);
  }

  onKey(event: any) {
    console.log(event.target.value);
    const phoneNumber = parsePhoneNumberFromString(event.target.value, 'KE');
    // console.log(phoneNumber.);
    // console.log(phoneNumber.formatNational());
    if (event.target.value.indexOf("+254") == -1)
      event.target.value = "+254" + event.target.value;
    // if(phoneNumber!=null)
    //   event.target.value = phoneNumber.formatInternational();
  }

  submit(number: string) {

    // console.log("MSISDN: " + number);
    const phoneNumber = parsePhoneNumberFromString(number, 'KE')
    number = phoneNumber.countryCallingCode + "" + phoneNumber.nationalNumber;
    console.log("MSISDN: " + phoneNumber.countryCallingCode + phoneNumber.nationalNumber);

    if (number.length != 12) {
      this.alertNumber = true;
      window.dataLayer.push({ event: "User_Attempt_MSISDN", label: "msisdn_error_length" }); // Event for wrong msisdn
      return;
    }
    //this.showLogin = false;
    this._isSubscribed = false;


    if (!this.sessionService.msisdn)
      this.sessionService.msisdn = number;

    // Run or Go to returnHome
    // this.router.navigate(['/auth-callback'], { queryParams: { code: number } });

    this.dataService.authenticate(number).subscribe((resp: any) => {


      // Deserialize payload
      const body: any = resp.body; // JSON.parse(response);
      if (body.isEligible !== undefined)
        this.sessionService.isEligible = body.isEligible;
      if (body.isSubscribed != undefined)
        this.sessionService.isSubscribed = body.isSubscribed;
      if (body.gamesPlayedToday !== undefined)
        this.sessionService.gamesPlayed = body.gamesPlayedToday;
      if (body.hasCredit !== undefined)
        this.sessionService.hasCredits = body.hasCredit;

      // Update the user State
      this.sessionService.state = body.state;
      console.log(this.sessionService.state);

      console.log("Is Subed: " + this.sessionService.isSubscribed);

      if (!this.sessionService.isSubscribed)
        window.dataLayer.push({ "event": "User_Enter_MSISDN", "msisdn": this.sessionService.msisdn }); // Event for success msisdn
      this.openVerify = true;

      // If present, Get JWT token from response header and keep it for the session
      const userToken = resp.headers.get('X-Access-Token');
      if (userToken) { // if exists, keep it
        this.sessionService.token = userToken;
        this.sessionService.Serialize();

        // Goto the returnHome page
        //this.router.navigate(['/returnhome']);
        this.openSubSuccess = true;
        this.newLogin = true;
      }
    },
      (err: any) => {
        console.log(err.error.errorCode);
        if (err.error.errorCode == 1002 || err.error.errorCode == 1006) {
          console.log(err.error.errorCode);
          this.errorMsg = this.isSubedText;
          let modal = UIkit.modal("#error");
          modal.show();
        }
      });


  }


  verify(pass: string) {

    // console.log("username: " + this.sessionService.msisdn);
    console.log("password: " + pass);

    this.dataService.authenticateVerify(this.sessionService.msisdn, pass).subscribe((resp: any) => {

      // Get JWT token from response header and keep it for the session
      const userToken = resp.headers.get('X-Access-Token');
      if (userToken)  // if exists, keep it
        this.sessionService.token = userToken;

      // Deserialize payload
      const body: any = resp.body; // JSON.parse(response);
      console.table("body: " + body);
      if (body.isEligible !== undefined)
        this.sessionService.isEligible = body.isEligible;
      if (body.isSubscribed != undefined)
        this.sessionService.isSubscribed = body.isSubscribed;
      if (body.gamesPlayedToday !== undefined)
        this.sessionService.gamesPlayed = body.gamesPlayedToday;
      if (body.hasCredit !== undefined)
        this.sessionService.hasCredits = body.hasCredit;

      // Update the user State
      this.sessionService.state = body.state;
      // this.sessionService.hasCredits = true;
      console.log(this.sessionService.state);
      console.log("body.hasCredit: " + body.hasCredit);
      console.log("this.sessionService.hasCredits: " + this.sessionService.hasCredits);
      console.log("hasCredist() " + this.sessionService.hasCredit());
      // console.log("hasCredit: " + this.sessionService.hasCredit());
      // if (body.bestScore !== undefined) {
      //   if (!this.sessionService.user)
      //     this.sessionService.user = new User();
      //   this.sessionService.user.bestScore = body.bestScore;
      // }

      // console.log("User Best Score: "+this.sessionService.user.bestScore);
      //this.sessionService.Serialize();

      // Chage view state
      this.loggedin = true;
      this.openVerify = false;
      this.openSubSuccess = true;
      window.dataLayer.push({ "event": "User_Subscribed", "msisdn": this.sessionService.msisdn }); // Event for success subscribtion
      // this.CheckCredits();
      // Goto the returnHome page
      //this.router.navigate(['/returnhome']);
    },
      (err: any) => {
        console.log("Error With Pin!!!");
        this.verErrorMes = true;
      });

    // Run or Go to returnHome
    //this.router.navigate(['/auth-callback'], { queryParams: { code: user } });
  }

  verifyDirect(pass: string) {

    // console.log("username: " + this.sessionService.msisdn);
    console.log("password: " + pass);

    this.dataService.authenticateVerify(this.sessionService.msisdn, pass).subscribe((resp: any) => {

      // Get JWT token from response header and keep it for the session
      const userToken = resp.headers.get('X-Access-Token');
      if (userToken)  // if exists, keep it
        this.sessionService.token = userToken;

      // Deserialize payload
      const body: any = resp.body; // JSON.parse(response);
      if (body.isEligible !== undefined)
        this.sessionService.isEligible = body.isEligible;
      if (body.isSubscribed != undefined)
        this.sessionService.isSubscribed = body.isSubscribed;
      if (body.gamesPlayedToday !== undefined)
        this.sessionService.gamesPlayed = body.gamesPlayedToday;
      if (body.hasCredit !== undefined)
        this.sessionService.hasCredits = body.hasCredit;

      //this.sessionService.Serialize();

      // Chage view state
      this.loggedin = true;
      this.openVerify = false;
      this.openSubSuccess = true;
      if (!this.sessionService.isUnsub)
        this.newLogin = false;
      else
        this.newLogin = true;
      // this.router.navigate(['/returnhome']);
      window.dataLayer.push({ event: "User_Attempt_PIN", label: "pin_correct" }); // Event for correct pin
      // Goto the returnHome page
      //this.router.navigate(['/returnhome']);
    },
      (err: any) => {
        console.log("Error With Pin!!!");
        this.verErrorMes = true;
        window.dataLayer.push({ event: "User_Attempt_PIN", label: "pin_error" }); // Event for correct msisdn
      });

    // Run or Go to returnHome
    //this.router.navigate(['/auth-callback'], { queryParams: { code: user } });
  }


  resetPin() {
    this.dataService.requestPin(this.sessionService.msisdn).then((resp: any) => {
      console.log('Reset password is successful');
    });
  }

  /*
  // Check MSISDN FOR:
  // REGISTERED
  // VALID ORANGE USER
  CheckN( num: string) {
    
    console.log("MSISDN: "+num);
    // Check if user is registered, send Pin to Smartlink
    this._isSubscribed = false;
    console.log("USER IS SUBED: " + this._isSubscribed);
    // If not, check if valid orange User
    
    // If yes send pin to smartlink
    this.CreatePin();
    // Open Pin Validation
    this.openVerify = true;
  }

  CreatePin() {
    console.log("Creating PIN!");
  }

  VerifySubPin(pin:string) {
    console.log("Verify PIN & subscribe User!");
    this.openVerify = false;
    this.loggedin = true;
    this.openSubSuccess = true;
    // Check Credits
    // this.CheckCredits();
    // this.router.navigate(['returnhome']);
  }
  */

  GotoReturnHome() {
    this.router.navigate(['returnhome']);
  }

  PlayGame() {
    console.log("Burn One Credit, Play Game!");
    this.dataService.getUserProfile().then(
      (data: User) => {
        this.sessionService.user = data;
        console.log("this.sessionService.gamesPlayed " + this.sessionService.gamesPlayed);

        this.sessionService.gamesPlayed++;
        this.router.navigate(['game']);

      },
      (err) => {

      });


  }


  VerifyLogPin(pin: string) {
    console.log("Verify PIN & login User!");
    this.loggedin = true;
    // Check Credits
    // this.CheckCredits();
    this.router.navigate(['returnhome']);
  }

  CheckCredits() {
    console.log("Checking Credits!");
    // Dummy Properties
    // this.credits = 0;


    // if(this.credits > 0){
    //   // Open Button "Play Now"
    // }
    // if(this.credits == 0 && this.gamesPlayed < 5){
    //   // Open Button "Buy New Round"
    // }
    // if(this.credits == 0 && this.gamesPlayed >= 5){
    //   // Close Button "Buy New Round"
    // }
  }

  OpenPass() {
    this.lblShow = !this.lblShow;
    console.log("Hide/Show Password: " + this.lblShow);
    if (this.lblShow)
      this.passType = "password";
    else
      this.passType = "test";
  }

  // Check the number of games played in demo mode
  // public playDemoGame($event) {
  //   console.log('Demo button is clicked');

  //   if (!this.sessionService.gameSettings || !this.sessionService.gameSettings.maintenance || this.sessionService.gameSettings.maintenance.siteDown || this.sessionService.gameSettings.maintenance.noGames)
  //     return;

  //   // this.router.navigate(['demogame']);
  //   this.demoGamesPlayed = +localStorage.getItem('demoGamesPlayed');
  //   // Check games count
  //   console.log("demoGamesPlayed "+ this.demoGamesPlayed);
  //   if(this.demoGamesPlayed >= 2) {
  //     // popup modal with error
  //     var modal = UIkit.modal("#error");
  //     this.errorMsg = this.noMoreDemoGames;
  //     modal.show();

  //   }else{
  //     // Add one and play the demo game
  //     this.demoGamesPlayed++;
  //     localStorage.setItem('demoGamesPlayed', this.demoGamesPlayed.toString());
  //     localStorage.setItem('lastDemoPlayed', (new Date()).toString() );
  //     // this.router.navigate(['demogame']);
  //     this.router.navigate(['demogame']);
  //   }
  // }

}

import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { SessionService } from '../session.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-prizes',
  templateUrl: './prizes.component.html',
  styleUrls: ['./prizes.component.scss']
})
export class PrizesComponent implements OnInit {

  public isActive: boolean = false;
  public _gamesPlayed = 0;
  isEng: boolean = true;

  constructor(private dataService: DataService, private sessionService: SessionService, private router: Router, private translate: TranslateService) {
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


    window.scroll(0, 0);
    if (!this.sessionService.token || !this.sessionService.isSubscribed || !this.sessionService.isEligible) {
      // wanna inform the user here?
      this.isActive = true;

    } else {
      this.isActive = false;
      this._gamesPlayed = this.sessionService.gamesPlayed;
    }


  }

  public subscribe($event) {
    console.log('button is clicked');
    $event.stopPropagation();
    this.router.navigate(['home']);
  }

  startGame() {
    console.log("Play Main Game!");
    this.sessionService.gamesPlayed++;
    this.router.navigate(['game']);

  }

  startFreeGame() {
    this.router.navigate(['freetimegame']);
  }
  goHomeWithLogin() {
    console.log("Goto Return Home!");
    localStorage.setItem('loginOn', "1");
    this.router.navigate(['home']);
  }

  goHome() {
    if (!this.sessionService.token || !this.sessionService.isSubscribed || !this.sessionService.isEligible) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['/returnhome']);
    }
  }

}

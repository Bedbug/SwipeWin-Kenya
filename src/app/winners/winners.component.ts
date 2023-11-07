import { Component, OnInit } from '@angular/core';
import {  DataService } from  '../data.service';
import { Router } from '@angular/router';
import { SessionService } from '../session.service';
import {  Observable } from 'rxjs';
 
@Component({
  selector: 'app-winners',
  templateUrl: './winners.component.html',
  styleUrls: ['./winners.component.scss']
})
export class WinnersComponent implements OnInit {
  
  winners$: Array<any>;
  public dailyWinners$: Array<any> = [];
  public monthlyWinners$: Array<any> = [];
  showDay: boolean = true;
  sliceNum: number = 5;
  public isActive: boolean = false;
  
  
  constructor(private data: DataService, private sessionService: SessionService, private router: Router,) { }
 
  
  doAlert(){
      this.showDay = !this.showDay;
      console.log(this.showDay); // black
    }
  
  ngOnInit() {
    window.scroll(0,0);
    if (
      !this.sessionService.token 
      || !this.sessionService.isSubscribed 
      || !this.sessionService.isEligible) {
      // wanna inform the user here?
      this.isActive = true;
      
    }else{
      this.isActive = false;
      
    }

    this.dailyWinners$ = []
    this.data.getWinners().then(
        (data:any) => {
          
          this.dailyWinners$ = data.dailyWinners;
          
          console.log(data.dailyWinners);
          
          
          if(this.dailyWinners$ == null || this.dailyWinners$.length == 0)
          this.dailyWinners$ = [
            {id: "", username: "", msisdn: "", winDate: "8/12", winSum: ""},
            {id: "", username: "", msisdn: "", winDate: "9/10", winSum: ""},
            {id: "", username: "", msisdn: "", winDate: "7/7", winSum: ""},
            {id: "", username: "", msisdn: "", winDate: "7/8", winSum: ""}];
          
          else if(this.dailyWinners$[0].winDate != ""){
            // for( var i = 0; i < this.dailyWinners$.length; i++) {
            //   var newDate = this.formatDate(this.dailyWinners$[i].winDate)
            //   this.dailyWinners$[i].winDate = newDate.toString();
            // }
          } else {
            this.dailyWinners$ = [
              {id: "", username: "", msisdn: "", winDate: "8/12", winSum: ""},
              {id: "", username: "", msisdn: "", winDate: "9/10", winSum: ""},
              {id: "", username: "", msisdn: "", winDate: "7/7", winSum: ""},
              {id: "", username: "", msisdn: "", winDate: "7/8", winSum: ""}];
          }
          
          // this.dailyWinners$.sort((a, b) => parseInt(b.winDate) - parseInt(a.winDate));

          this.monthlyWinners$ = data.monthlyWinners$;
          
          console.log(this.monthlyWinners$);
          if(this.monthlyWinners$ == null)
            this.monthlyWinners$ = [{id: "", username: "", msisdn: "", winDate: ""},{id: "", username: "", msisdn: "", winDate: ""},{id: "", username: "", msisdn: "", winDate: ""},{id: "", username: "", msisdn: "", winDate: ""},{id: "", username: "", msisdn: "", winDate: ""},{id: "", username: "", msisdn: "", winDate: ""},{id: "", username: "", msisdn: "", winDate: ""},{id: "", username: "", msisdn: "", winDate: ""}];
          
          if(this.monthlyWinners$ ==  null)
            this.monthlyWinners$ = [];
            else if(this.monthlyWinners$[0].winDate != "") {
              // for( var i = 0; i < this.monthlyWinners$.length; i++) {
              //   var newDate = this.formatDate(this.monthlyWinners$[i].winDate)
              //   this.monthlyWinners$[i].winDate = newDate.toString();
              // }
            }
        },
        (err) => {
          console.error(err);
        }
      );
      
  }

  goHome() {
    if (!this.sessionService.token || !this.sessionService.isSubscribed || !this.sessionService.isEligible) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['/returnhome']);
    }
  }

  formatDate(stringDate){
    var date = new Date(stringDate);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear();
  }
}

import { Component, OnInit } from '@angular/core';
import { Globals } from '../globals';
import UIkit from 'uikit';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {

  private isFirstDemo: boolean;
  public showPlay:boolean = false;


  get getShowPlay(): boolean {
    return this.showPlay;
  }
  constructor(private globals: Globals) {
    this.isFirstDemo = globals.isFirstDemo;
  }

  ngOnInit() {
    console.log("Change globals.isFirstDemo to: " + this.globals.isFirstDemo);
    // this.showPlay = true;
    var that = this;
    // Get Index of Slide Shown
    function indexInParent(node) {
      var children = node.parentNode.childNodes;
      var num = 0;
  
      for (var i = 0; i < children.length; i++) {
        if (children[i] == node) return num;
        if (children[i].nodeType == 1) num++;
      }
  
      return -1;
    }
  
    UIkit.util.on('#slideshow', 'itemshown', function () {
      var $items = this.getElementsByClassName('uk-slideshow-items');
      var $activeItem = $items[0].getElementsByClassName('uk-active');
      var index = indexInParent($activeItem[0]);
  
      // console.log(index);
      if (index == 3)
        that.showPlay = true;
        else
        that.showPlay = false;
      // console.log(this.showPlay);
      
    });
  }

  changeTutorialFlag() {

    this.isFirstDemo = false;
    this.globals.isFirstDemo = this.isFirstDemo;
    console.log("Change isFirstDemo to: " + this.isFirstDemo);
    console.log("Change globals.isFirstDemo to: " + this.globals.isFirstDemo);
  }

  

}

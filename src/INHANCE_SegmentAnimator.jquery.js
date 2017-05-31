// JQuery plugin for image sequence animation 
// version: 0.0.7
// date: 08/24/2016
// Author: Myeong Kim
// Example:
// var animator = new INHANCE_SegmentAnimator.Animator(...)

var INHANCE_SegmentAnimator = (function () {
  'use strict';
  var Animator = function (canvasSelectionString, params) {
    this.animRef;
    this.imgs;
    this.canvas = $(canvasSelectionString)[0];
    this.ctx = this.canvas.getContext('2d');
    this.params = params;
    this.params.onInit;
    this.cnt = 0;
    this.curTime = 0;
    this.fps = params.fps || 30;
    this.isPlaying = false;
    
    this.init = function () {
      var cnt = this.params.frames;
      this.imgs = new Array(cnt);
      var self = this;
      for (var i = 0; i < this.params.frames; i++) {
        var replacee = this.params.naming.match(/#/g).join('');
        var suffix = replacee.replace(/#/g, '0');

        var src = this.params.naming.replace(replacee, (suffix.substring(1) + i).slice(suffix.length * -1));
        var img = new Image();
        img.id = i;
        $(img).on('load error', function (evt) {
          $(this).off();
          if (evt.type == 'load') self.imgs[this.id] = this;
          if (--cnt <= 0) {
            if (typeof self.params.onInit == 'function') {
              self.params.onInit();
              self.imgs = self.imgs.filter(function (e) { return e !== undefined && e !== null }); // for condensed array
              console.log(self.imgs);
            }
          }
        });
        img.src = src;
      }
    };

    this.playAnim = function (start, end, isLoop, callback) {
      if (this.isPlaying) this.pauseAnim();
      this.start = start;
      this.cnt = 0;
      this.end = Math.min(end || this.imgs.length - 1, this.imgs.length - 1);
      this.isLoop = isLoop;
      this.callback = callback;
      this.doAnim(this.curTime = rightNow());
    };

    this.doAnim = function (time) {
      this.isPlaying = true;
      var delta = (time - this.curTime) / 1000;
      this.cnt += (delta * this.fps);
      var curFrame = Math.max(Math.floor(this.cnt + this.start), 0);

      if (curFrame > this.end) {
        this.cnt = 0;
        curFrame = this.start;
        if (!this.isLoop) {
          cancelAnimationFrame(this.animRef);
          if (typeof this.callback == 'function') this.callback();
          return;
        }
      }

      this.animRef = requestAnimationFrame(this.doAnim.bind(this));
      this.curTime = time;

      // drawing canvas
      // console.log(curFrame);
      var curImg = this.imgs[curFrame];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      try {
        this.ctx.drawImage(curImg, 0, 0, curImg.width, curImg.height, 0, 0, this.canvas.width, this.canvas.height);  
      }
      catch (e) {
        console.log(e, curFrame, curImg);
      }
      
     
    };

    this.pauseAnim = function () {
      cancelAnimationFrame(this.animRef);
      // this.cnt = 0;
      this.isPlaying = false;
    };

    this.clean = function () {
      console.log('cleanAnim');
      if (this.isPlaying) this.pauseAnim();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    this.destroy = function () {
      var animator = this;
      if (this.isPlaying) this.clean();
      this.imgs.length = 0;
      animator = null;
    };

    this.init();
  };

  function rightNow() {
    if (window.performance && window.performance.now) {
      return window.performance.now();
    } 
    else {
      return +(new Date());
    }
  }

  return {
    Animator: Animator
  };

}());

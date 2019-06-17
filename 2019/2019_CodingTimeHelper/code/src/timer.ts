/**
 * @Author: ChrisChaoqun
 * @Date:   2019-06-06 09:09:22
 * @Last Modified by:   ChrisChaoqun
 * @Last Modified time: 2019-06-07 14:47:12
 */
"use strict";
import * as vscode from "vscode";
import { TimerState } from "./enum";

export class Timer {
  private TimerEndEventEmitter: vscode.EventEmitter<any>;
  private TimerChangedEventEmitter: vscode.EventEmitter<any>;
  private _elapsedSeconds: number;
  private _timerSeconds: number;
  private _interval: NodeJS.Timeout | undefined;
  private _state: number;

  public constructor(timerSec: number) {
    this.TimerEndEventEmitter = new vscode.EventEmitter();
    this.TimerChangedEventEmitter = new vscode.EventEmitter();
    this._elapsedSeconds = 0;
    this._timerSeconds = timerSec;
    this._interval = undefined;
    this._state = TimerState.Stopped;
  }

  public start() {
    this._state = TimerState.Running;
    this._interval = setInterval(() => {
      this._tick();
    }, 1000);
  }

  private _tick() {
    if (!vscode.window.state.focused) {
      return;
    }
    this._elapsedSeconds += 1;
    const remainingTime = Math.max(
      this._timerSeconds - this._elapsedSeconds,
      0
    );

    if (remainingTime <= 0) {
      this._elapsedSeconds = this._timerSeconds;
      this.TimerEndEventEmitter.fire();
    } else {
      try {
        this.TimerChangedEventEmitter.fire({
          datetime: Number(new Date()),
          leftSec: remainingTime
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  get onTimeChanged() {
    return this.TimerChangedEventEmitter.event;
  }

  get onTimeEnd() {
    return this.TimerEndEventEmitter.event;
  }

  get state() {
    return this._state;
  }

  get timeSec() {
    return this._timerSeconds;
  }

  public pause() {
    this._state = TimerState.Paused;
    this._clearTimerLoop();
  }

  public stop() {
    this._state = TimerState.Stopped;
    this._clearTimerLoop();
    this._elapsedSeconds = 0;
  }

  public reset(timeSec?: number) {
    this._state = TimerState.Stopped;
    this._clearTimerLoop();
    this._elapsedSeconds = 0;
    if (timeSec !== undefined) {
      this._timerSeconds = timeSec;
    }
  }

  private _clearTimerLoop() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}

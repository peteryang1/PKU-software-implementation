/**
 * @Author: ChrisChaoqun
 * @Date:   2019-06-04 15:00:47
 * @Last Modified by:   ChrisChaoqun
 * @Last Modified time: 2019-06-09 16:26:41
 */
"use strict";
import * as vscode from "vscode";
import { ReminderView } from "./reminderView";
import { Utility } from "./utility";

export class Scheduler {
  private codingTime: number = 0;

  public constructor(private context: vscode.ExtensionContext) {}

  public start() {
    setInterval(() => {
      this._tick();
    }, 1000);
  }

  private _tick() {
    if (!vscode.window.state.focused) {
      return;
    }
    this.codingTime += 1;
  }

  public show(context: vscode.ExtensionContext) {
    ReminderView.show(context, this.codingTime);
  }
}
